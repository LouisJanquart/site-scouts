<script setup lang="ts">
import { bornesSections } from '#shared/orientation'

definePageMeta({ middleware: 'staff' })

const route = useRoute()
const id = computed(() => route.params.id as string)

const { data: dossier, pending } = await useFetch(() => `/api/animes/${id.value}`)
const { data: sante } = await useFetch(() => `/api/animes/${id.value}/sante`)
const { data: accords } = await useFetch(() => `/api/animes/${id.value}/consentements`)

const nomSection = (slug: string) => bornesSections.find((s) => s.slug === slug)?.nom ?? slug

const enCours = computed(() => {
  const parType = new Map<string, any>()
  for (const c of accords.value?.consentements ?? []) {
    if (c.revoqueLe) continue
    if (!parType.has(c.type)) parType.set(c.type, c)
  }
  return parType
})

// Ce qu'un chef doit savoir avant une sortie, en trois lignes.
const image = computed(() => ({
  interne: enCours.value.get('image-interne')?.accorde ?? false,
  site: enCours.value.get('image-site')?.accorde ?? false,
  reseaux: enCours.value.get('image-reseaux')?.accorde ?? false,
  presse: enCours.value.get('image-presse')?.accorde ?? false,
}))

useHead({ title: () => `${dossier.value?.anime.prenom ?? 'Animé'} — Staff` })
</script>

<template>
  <AppPage
    :titre="dossier ? `${dossier.anime.prenom} ${dossier.anime.nom}` : 'Dossier'"
    surtitre="Staff"
    :retour="{ to: '/gestion', texte: 'Back office' }"
  >
    <p v-if="pending" class="alerte alerte--info">Chargement…</p>

    <div v-else-if="dossier" class="pile">
      <div class="alerte alerte--info">
        <UiIcone nom="cadenas" :taille="18" />
        <span>
          Votre consultation de ce dossier vient d’être enregistrée. La famille peut la voir. Ce
          n’est pas une surveillance : c’est la contrepartie du droit que vous avez de l’ouvrir.
        </span>
      </div>

      <!-- Le bandeau « avant de partir en camp » -------------------------- -->
      <section class="groupe">
        <h2 class="groupe__titre">À savoir</h2>
        <div class="drapeaux">
          <div class="drapeau" :class="{ 'drapeau--rouge': !sante?.existe }">
            <span class="drapeau__nom">Fiche santé</span>
            <span class="drapeau__valeur">{{ sante?.existe ? 'remplie' : 'MANQUANTE' }}</span>
          </div>
          <div class="drapeau" :class="{ 'drapeau--rouge': sante?.existe && !sante.contenu.saitNager }">
            <span class="drapeau__nom">Nage</span>
            <span class="drapeau__valeur">
              {{ sante?.existe ? (sante.contenu.saitNager ? 'oui' : 'NON') : '—' }}
            </span>
          </div>
          <div class="drapeau" :class="{ 'drapeau--rouge': !image.reseaux }">
            <span class="drapeau__nom">Photos publiques</span>
            <span class="drapeau__valeur">{{ image.reseaux ? 'autorisées' : 'INTERDITES' }}</span>
          </div>
          <div class="drapeau">
            <span class="drapeau__nom">Photos internes</span>
            <span class="drapeau__valeur">{{ image.interne ? 'autorisées' : 'interdites' }}</span>
          </div>
        </div>
      </section>

      <!-- Fiche santé ----------------------------------------------------- -->
      <section class="groupe">
        <h2 class="groupe__titre">Fiche santé</h2>
        <template v-if="sante?.existe">
          <dl class="fiche">
            <div v-if="sante.contenu.allergies?.length" class="fiche--important">
              <dt>Allergies</dt><dd>{{ sante.contenu.allergies.join(', ') }}</dd>
            </div>
            <div v-if="sante.contenu.traitements?.length" class="fiche--important">
              <dt>Traitements</dt>
              <dd>
                <span v-for="(t, i) in sante.contenu.traitements" :key="i" class="bloc">
                  {{ t.libelle }}<template v-if="t.posologie"> — {{ t.posologie }}</template>
                  <template v-if="t.autonome"> (le prend seul)</template>
                </span>
              </dd>
            </div>
            <div v-if="sante.contenu.regimesAlimentaires?.length">
              <dt>Régime</dt><dd>{{ sante.contenu.regimesAlimentaires.join(', ') }}</dd>
            </div>
            <div v-if="sante.contenu.antecedents">
              <dt>Antécédents</dt><dd>{{ sante.contenu.antecedents }}</dd>
            </div>
            <div v-if="sante.contenu.remarques">
              <dt>Remarques</dt><dd>{{ sante.contenu.remarques }}</dd>
            </div>
            <div>
              <dt>Tétanos</dt>
              <dd>{{ sante.contenu.tetanosAJour ? `à jour (${sante.contenu.tetanosDate ?? 'date non précisée'})` : 'non confirmé' }}</dd>
            </div>
            <div v-if="sante.contenu.medecinNom">
              <dt>Médecin</dt><dd>{{ sante.contenu.medecinNom }} — {{ sante.contenu.medecinTelephone }}</dd>
            </div>
            <div v-if="sante.contenu.mutuelle">
              <dt>Mutuelle</dt>
              <dd>{{ sante.contenu.mutuelle }} {{ sante.contenu.numeroAffiliationMutuelle }}</dd>
            </div>
          </dl>
        </template>
        <p v-else class="alerte alerte--erreur">
          <UiIcone nom="alerte" :taille="18" />
          <span>Aucune fiche santé. Réclamez-la aux parents avant toute sortie.</span>
        </p>
      </section>

      <!-- Qui appeler ------------------------------------------------------ -->
      <section class="groupe">
        <h2 class="groupe__titre">Qui appeler</h2>
        <ol class="contacts">
          <li v-for="(r, i) in dossier.responsables" :key="i">
            <span class="contacts__rang mono">{{ i + 1 }}</span>
            <span>
              <strong>{{ r.prenom }} {{ r.nom }}</strong>
              <span class="doux"> — {{ r.lien }}{{ r.autoriteParentale ? '' : ' (sans autorité parentale)' }}</span>
              <span class="bloc">
                <a :href="`tel:${r.telephone}`">{{ r.telephone }}</a> ·
                <a :href="`mailto:${r.email}`">{{ r.email }}</a>
              </span>
            </span>
          </li>
          <li v-for="(c, i) in dossier.contactsUrgence" :key="`u${i}`">
            <span class="contacts__rang mono">+</span>
            <span>
              <strong>{{ c.nom }}</strong><span class="doux"> — {{ c.lien }}</span>
              <span class="bloc"><a :href="`tel:${c.telephone}`">{{ c.telephone }}</a></span>
            </span>
          </li>
        </ol>
      </section>

      <!-- Inscriptions ------------------------------------------------------ -->
      <section class="groupe">
        <h2 class="groupe__titre">Inscriptions</h2>
        <ul class="liste">
          <li v-for="i in dossier.inscriptions" :key="i.id" :data-section="i.sectionSlug">
            <span class="etiquette etiquette--pleine">{{ nomSection(i.sectionSlug) }}</span>
            <span class="mono">{{ i.saison }}</span>
            <span class="doux">{{ i.statut }}</span>
            <span v-if="i.remarqueFamille" class="bloc doux">« {{ i.remarqueFamille }} »</span>
          </li>
        </ul>
      </section>
    </div>
  </AppPage>
</template>

<style lang="scss" scoped>
.drapeaux {
  display: grid;
  gap: 0.4rem;
  grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
}

.drapeau {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: 0.7rem 0.85rem;
  background: rgba($blanc, 0.035);
  border-radius: $r-champ;

  &__nom {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: rgba($blanc, 0.5);
  }

  &__valeur {
    font-size: 1rem;
    font-weight: 600;
  }

  &--rouge {
    background: rgba($rouge, 0.1);
    .drapeau__valeur {
      color: $rouge-texte;
    }
  }
}

.fiche {
  display: grid;
  gap: 0.55rem;
  margin: 0;

  div {
    display: grid;
    grid-template-columns: 9rem 1fr;
    gap: 0.75rem;
    padding: 0.35rem 0.5rem;
    border-radius: $r-champ;

    @include jusqua($bp-console) {
      grid-template-columns: 1fr;
      gap: 0.1rem;
    }
  }

  &--important {
    background: rgba($rouge, 0.08);
  }

  dt {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: rgba($blanc, 0.55);
  }
  dd {
    margin: 0;
    font-size: 1rem;
    line-height: 1.5;
  }
}

.contacts {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: grid;
    grid-template-columns: 1.5rem 1fr;
    gap: 0.6rem;
    font-size: 1rem;
    line-height: 1.5;
  }

  &__rang {
    color: $cyan;
    font-size: 0.75rem;
  }

  a {
    color: $cyan;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
}

.liste {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    align-items: baseline;
    gap: 0.6rem;
    flex-wrap: wrap;
    font-size: 1rem;
  }
}

.bloc {
  display: block;
  inline-size: 100%;
}

.doux {
  color: rgba($blanc, 0.55);
}
</style>
