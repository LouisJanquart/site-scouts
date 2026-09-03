<script setup lang="ts">
import { consentementsCatalogue } from '#shared/consentements'
import { bornesSections } from '#shared/orientation'

definePageMeta({ middleware: 'connecte' })

const route = useRoute()
const id = computed(() => route.params.id as string)

const { data: dossier, pending } = await useFetch(() => `/api/animes/${id.value}`)
const { data: sante, refresh: rafraichirSante } = await useFetch(() => `/api/animes/${id.value}/sante`)
const { data: accords, refresh: rafraichirAccords } = await useFetch(
  () => `/api/animes/${id.value}/consentements`,
)

const nomSection = (slug: string) => bornesSections.find((s) => s.slug === slug)?.nom ?? slug

// Les autorisations en cours : pour chaque type, la ligne la plus récente qui
// n'a pas été révoquée.
const enCours = computed(() => {
  const parType = new Map<string, any>()
  for (const c of accords.value?.consentements ?? []) {
    if (c.revoqueLe) continue
    if (!parType.has(c.type)) parType.set(c.type, c)
  }
  return parType
})

const inscriptionActive = computed(
  () => dossier.value?.inscriptions.find((i) => i.saisonActive) ?? dossier.value?.inscriptions[0],
)

const enregistrement = ref<string | null>(null)

async function basculer(type: string, valeur: boolean) {
  const ins = inscriptionActive.value
  if (!ins) return
  enregistrement.value = type
  try {
    await $fetch(`/api/animes/${id.value}/consentements`, {
      method: 'PATCH',
      body: { inscriptionId: ins.id, type, accorde: valeur },
    })
    await rafraichirAccords()
  } catch (e: any) {
    alert(e?.data?.statusMessage ?? 'Modification impossible.')
  } finally {
    enregistrement.value = null
  }
}

useHead({ title: () => `${dossier.value?.anime.prenom ?? 'Dossier'} — 16e Fleurus` })
</script>

<template>
  <AppPage
    :titre="dossier ? `${dossier.anime.prenom} ${dossier.anime.nom}` : 'Dossier'"
    surtitre="Espace des familles"
    :retour="{ to: '/mon-espace', texte: 'Mon espace' }"
  >
    <p v-if="pending" class="alerte alerte--info">Chargement…</p>

    <div v-else-if="dossier" class="pile">
      <!-- Identité et inscriptions ------------------------------------- -->
      <section class="groupe">
        <h2 class="groupe__titre">Inscriptions</h2>
        <ul class="liste">
          <li v-for="i in dossier.inscriptions" :key="i.id" :data-section="i.sectionSlug">
            <span class="etiquette etiquette--pleine">{{ nomSection(i.sectionSlug) }}</span>
            <span class="mono liste__saison">{{ i.saison }}</span>
            <span class="liste__statut">{{ i.statut }}</span>
          </li>
        </ul>
      </section>

      <!-- Fiche santé ---------------------------------------------------- -->
      <section class="groupe">
        <h2 class="groupe__titre">Fiche santé</h2>
        <p class="groupe__chapo">
          Chiffrée en base. Seuls les chefs de sa section et le staff d’unité peuvent l’ouvrir, et
          chaque consultation est enregistrée —
          <NuxtLink to="/mon-espace/mes-donnees">vous pouvez voir qui l’a lue</NuxtLink>.
        </p>

        <div v-if="sante?.existe" class="sante">
          <dl>
            <div v-if="sante.contenu.medecinNom">
              <dt>Médecin</dt>
              <dd>{{ sante.contenu.medecinNom }} — {{ sante.contenu.medecinTelephone }}</dd>
            </div>
            <div v-if="sante.contenu.mutuelle">
              <dt>Mutuelle</dt>
              <dd>{{ sante.contenu.mutuelle }}</dd>
            </div>
            <div v-if="sante.contenu.allergies?.length">
              <dt>Allergies</dt>
              <dd>{{ sante.contenu.allergies.join(', ') }}</dd>
            </div>
            <div v-if="sante.contenu.regimesAlimentaires?.length">
              <dt>Régime</dt>
              <dd>{{ sante.contenu.regimesAlimentaires.join(', ') }}</dd>
            </div>
            <div v-if="sante.contenu.traitements?.length">
              <dt>Traitements</dt>
              <dd>
                <span v-for="(t, i) in sante.contenu.traitements" :key="i" class="bloc">
                  {{ t.libelle }}<template v-if="t.posologie"> — {{ t.posologie }}</template>
                </span>
              </dd>
            </div>
            <div v-if="sante.contenu.antecedents">
              <dt>Antécédents</dt>
              <dd>{{ sante.contenu.antecedents }}</dd>
            </div>
            <div>
              <dt>Sait nager</dt>
              <dd>{{ sante.contenu.saitNager ? 'Oui' : 'Non' }}</dd>
            </div>
          </dl>
          <p class="doux petit">
            Dernière mise à jour : {{ new Date(sante.majLe).toLocaleDateString('fr-BE') }}
          </p>
        </div>
        <p v-else class="doux">Aucune fiche santé enregistrée pour la saison en cours.</p>
      </section>

      <!-- Autorisations --------------------------------------------------- -->
      <section class="groupe">
        <h2 class="groupe__titre">Autorisations</h2>
        <p class="groupe__chapo">
          Vous pouvez changer d’avis à tout moment. Le changement prend effet immédiatement, et
          l’historique de ce que vous avez signé est conservé.
        </p>

        <div class="pile">
          <div v-for="c in consentementsCatalogue" :key="c.cle" class="autorisation">
            <UiCase
              :model-value="enCours.get(c.cle)?.accorde ?? false"
              :titre="c.titre"
              :texte="c.texte"
              :consequence="c.siRefus"
              :obligatoire="c.obligatoire"
              @update:model-value="(v) => basculer(c.cle, v)"
            />
            <p v-if="c.obligatoire" class="autorisation__note">
              Indispensable à l’inscription : pour la retirer, écrivez au staff d’unité.
            </p>
            <p v-else-if="enCours.get(c.cle)" class="autorisation__note">
              Réponse donnée le
              {{ new Date(enCours.get(c.cle).donneLe).toLocaleDateString('fr-BE') }}
              (version {{ enCours.get(c.cle).versionTexte }})
            </p>
          </div>
        </div>
      </section>

      <!-- Contacts --------------------------------------------------------- -->
      <section v-if="dossier.responsables.length" class="groupe">
        <h2 class="groupe__titre">Responsables et contacts</h2>
        <ul class="liste">
          <li v-for="(r, i) in dossier.responsables" :key="i">
            <strong>{{ r.prenom }} {{ r.nom }}</strong>
            <span class="doux">{{ r.email }} · {{ r.telephone }}</span>
          </li>
          <li v-for="(c, i) in dossier.contactsUrgence" :key="`u${i}`">
            <strong>{{ c.nom }}</strong>
            <span class="doux">{{ c.lien }} · {{ c.telephone }}</span>
          </li>
        </ul>
      </section>
    </div>
  </AppPage>
</template>

<style lang="scss" scoped>
.liste {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    align-items: baseline;
    gap: 0.75rem;
    flex-wrap: wrap;
    font-size: 0.86rem;
  }

  &__saison,
  &__statut {
    font-size: 0.75rem;
    color: rgba($blanc, 0.6);
  }
}

.sante dl {
  display: grid;
  gap: 0.6rem;
  margin: 0 0 0.75rem;

  div {
    display: grid;
    grid-template-columns: 8rem 1fr;
    gap: 0.75rem;

    @include jusqua($bp-console) {
      grid-template-columns: 1fr;
      gap: 0.1rem;
    }
  }

  dt {
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: rgba($blanc, 0.5);
  }

  dd {
    margin: 0;
    font-size: 0.87rem;
    line-height: 1.5;
  }
}

.bloc {
  display: block;
}

.petit {
  font-size: 0.75rem;
}

.autorisation {
  &__note {
    margin: 0.3rem 0 0 2rem;
    font-size: 0.72rem;
    color: rgba($blanc, 0.62);
  }
}
</style>
