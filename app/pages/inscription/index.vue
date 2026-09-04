<script setup lang="ts">
import { anneeDeSaison } from '#shared/orientation'
import { consentementsObligatoires } from '#shared/consentements'

// ---------------------------------------------------------------------------
// Le formulaire d'inscription.
//
// Cinq étapes plutôt qu'une page unique : le dossier complet fait une centaine
// de champs, et personne ne remplit cent champs d'affilée. On avance par
// blocs, on peut revenir en arrière, et le brouillon survit à la fermeture de
// l'onglet — sauf la fiche santé, qui n'est jamais écrite sur le disque.
// ---------------------------------------------------------------------------

const { dossier, etape, brouillonRetrouve, restaurer, enregistrer, oublier } = useDossier()
const { charger, connecte } = useCompte()
const { enCours, erreur, champs, envoyer } = useFormulaire()

const { data: saison } = await useFetch('/api/saison')
const anneeSaison = computed(() =>
  saison.value && 'debut' in saison.value ? anneeDeSaison(new Date(saison.value.debut)) : anneeDeSaison(),
)
const bareme = computed(() =>
  saison.value && 'bareme' in saison.value ? saison.value.bareme : null,
)
const supplement = computed(() =>
  saison.value && 'supplementLocalCentimes' in saison.value
    ? saison.value.supplementLocalCentimes
    : 0,
)

const politiqueLue = ref(false)
const resultat = ref<{
  inscriptionId: string
  montantCentimes: number
  explicationTarif: string | null
  fratrieRecalculee: { prenom: string; montantCentimes: number }[]
  communication: string | null
} | null>(null)

const etapes = [
  { cle: 'enfant', titre: 'L’enfant' },
  { cle: 'responsables', titre: 'Les responsables' },
  { cle: 'sante', titre: 'La santé' },
  { cle: 'autorisations', titre: 'Les autorisations' },
  { cle: 'fin', titre: 'Vérification' },
]

onMounted(async () => {
  restaurer()
  await charger()
  // Un parent déjà connecté ne resaisit pas ses coordonnées : on préremplit.
  const { moi } = useCompte()
  if (moi.value?.connecte && !dossier.value.responsables[0]?.prenom) {
    dossier.value.responsables[0] = {
      ...dossier.value.responsables[0]!,
      prenom: moi.value.prenom ?? '',
      nom: moi.value.nom ?? '',
      email: moi.value.email ?? '',
    }
  }
})

watch(dossier, enregistrer, { deep: true })

// --- Ce qui empêche de passer à l'étape suivante ---------------------------
//
// Volontairement souple : on ne bloque que sur ce qui est réellement
// indispensable, pour ne pas transformer le formulaire en parcours d'obstacles.
const bloquant = computed<string | null>(() => {
  const d = dossier.value
  if (etape.value === 0) {
    if (!d.enfant.prenom || !d.enfant.nom) return 'Le prénom et le nom de l’enfant sont nécessaires.'
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d.enfant.dateNaissance)) return 'Indiquez la date de naissance.'
    if (!d.enfant.adresse.rue || !d.enfant.adresse.codePostal || !d.enfant.adresse.localite)
      return 'L’adresse est incomplète.'
    if (!d.enfant.sectionSlug) return 'Choisissez une section.'
  }
  if (etape.value === 1) {
    const r = d.responsables[0]
    if (!r?.prenom || !r?.nom || !r?.email || !r?.telephone)
      return 'Les coordonnées du responsable principal sont nécessaires.'
    if (!d.responsables.some((x) => x.autoriteParentale))
      return 'Au moins un responsable doit avoir l’autorité parentale.'
  }
  if (etape.value === 3) {
    const manquantes = consentementsObligatoires.filter((c) => d.consentements[c] !== true)
    if (manquantes.length)
      return 'Certaines autorisations sont indispensables : elles sont marquées d’une étoile.'
  }
  if (etape.value === 4) {
    if (!politiqueLue.value) return 'Confirmez que vous avez lu la politique de confidentialité.'
    if (!connecte.value && (dossier.value.motDePasse ?? '').length < 10)
      return 'Choisissez un mot de passe d’au moins dix caractères.'
  }
  return null
})

const tentative = ref(false)

function suivant() {
  tentative.value = true
  if (bloquant.value) return
  tentative.value = false
  etape.value = Math.min(etape.value + 1, etapes.length - 1)
  remonter()
}

function precedent() {
  tentative.value = false
  etape.value = Math.max(etape.value - 1, 0)
  remonter()
}

function aller(n: number) {
  if (n > etape.value) return
  etape.value = n
  remonter()
}

function remonter() {
  document.querySelector('.page__defilement')?.scrollTo({ top: 0, behavior: 'smooth' })
}

async function deposer() {
  tentative.value = true
  if (bloquant.value) return

  const r = await envoyer(() =>
    $fetch<{
      ok: true
      inscriptionId: string
      montantCentimes: number
      explicationTarif: string | null
      fratrieRecalculee: { prenom: string; montantCentimes: number }[]
      communication: string | null
    }>(
      '/api/inscriptions',
      {
        method: 'POST',
        body: {
          ...dossier.value,
          politiqueLue: true,
          motDePasse: connecte.value ? undefined : dossier.value.motDePasse,
        },
      },
    ),
  )
  if (!r) return
  resultat.value = r
  oublier()
  await charger(true)
}

useHead({ title: 'Inscrire un enfant — 16e Fleurus' })
</script>

<template>
  <AppPage
    :titre="resultat ? 'Inscription enregistrée' : 'Inscrire un enfant'"
    surtitre="Saison 2026-2027"
    :chapo="
      resultat
        ? undefined
        : 'Comptez une quinzaine de minutes. Vous pouvez interrompre et reprendre : tout est gardé, sauf la fiche santé.'
    "
  >
    <!-- Le fil des étapes vit dans l'en-tête de la page : c'est un slot nommé,
         il doit donc rester un enfant direct d'AppPage. -->
    <template #entete>
      <InscriptionEtapes
        v-if="!resultat && saison?.ouverte"
        :etapes="etapes"
        :courante="etape"
        @aller="aller"
      />
    </template>

    <!-- ------------------------------------------------------------------ -->
    <!-- Après le dépôt                                                     -->
    <!-- ------------------------------------------------------------------ -->
    <div v-if="resultat" class="pile fin">
      <div class="alerte alerte--bien" role="status">
        <UiIcone nom="check" :taille="18" />
        <span>
          C’est enregistré. Un courriel de confirmation part vers
          {{ dossier.responsables[0]?.email || 'votre adresse' }}.
        </span>
      </div>

      <section v-if="resultat.montantCentimes > 0" class="groupe">
        <h2 class="groupe__titre">La cotisation</h2>
        <p class="groupe__chapo">
          Il reste {{ euros(resultat.montantCentimes) }}.
          <template v-if="resultat.explicationTarif">{{ resultat.explicationTarif }}</template>
          L’inscription devient définitive à réception du paiement et après relecture par le staff.
        </p>

        <!-- Inscrire un enfant fait baisser le tarif de ses frères et sœurs :
             il faut le dire, sinon la famille croit à une erreur. -->
        <div v-if="resultat.fratrieRecalculee.length" class="alerte alerte--bien">
          <UiIcone nom="check" :taille="18" />
          <span>
            La cotisation de
            <template v-for="(f, i) in resultat.fratrieRecalculee" :key="f.prenom">
              <template v-if="i > 0">{{ i === resultat.fratrieRecalculee.length - 1 ? ' et ' : ', ' }}</template>
              <strong>{{ f.prenom }}</strong>
            </template>
            a baissé en même temps — le tarif famille s’applique à toute la fratrie, pas seulement
            au dernier inscrit. Les nouveaux montants sont dans votre espace.
          </span>
        </div>
        <div class="fin__actions">
          <NuxtLink class="bouton bouton--principal" :to="`/mon-espace/paiement/${resultat.inscriptionId}`">
            <UiIcone nom="carte" :taille="16" /> Payer en ligne
          </NuxtLink>
          <NuxtLink class="bouton bouton--fantome" to="/mon-espace">
            Voir mon espace
          </NuxtLink>
        </div>
        <p class="fin__virement">
          Ou par virement, avec la communication structurée
          <strong class="mono">{{ resultat.communication }}</strong>. Les coordonnées bancaires
          sont dans votre espace et dans le courriel.
        </p>
      </section>

      <NuxtLink v-else class="bouton bouton--principal" to="/mon-espace">Voir mon espace</NuxtLink>
    </div>

    <!-- ------------------------------------------------------------------ -->
    <!-- Saison fermée                                                      -->
    <!-- ------------------------------------------------------------------ -->
    <div v-else-if="saison && !saison.ouverte" class="alerte alerte--info">
      <UiIcone nom="info" :taille="18" />
      <span v-if="'pasEncore' in saison && saison.pasEncore">
        Les inscriptions ne sont pas encore ouvertes pour la saison {{ saison.libelle }}. Revenez
        un peu plus tard, ou écrivez au staff d’unité.
      </span>
      <span v-else>
        Les inscriptions en ligne sont closes. Écrivez au staff d’unité : il reste peut-être de la
        place.
      </span>
    </div>

    <!-- ------------------------------------------------------------------ -->
    <!-- Le formulaire                                                      -->
    <!-- ------------------------------------------------------------------ -->
    <template v-else>
      <form class="formulaire" novalidate @submit.prevent="etape === 4 ? deposer() : suivant()">
        <p v-if="brouillonRetrouve && etape === 0" class="alerte alerte--info">
          <UiIcone nom="info" :taille="18" />
          <span>
            Nous avons retrouvé un dossier en cours. La fiche santé est à ressaisir : elle n’est
            jamais conservée dans le navigateur.
            <button type="button" class="lien-bouton" @click="oublier()">Repartir de zéro</button>
          </span>
        </p>

        <p v-if="erreur" class="alerte alerte--erreur" role="alert">
          <UiIcone nom="alerte" :taille="18" /><span>{{ erreur }}</span>
        </p>
        <p v-else-if="tentative && bloquant" class="alerte alerte--erreur" role="alert">
          <UiIcone nom="alerte" :taille="18" /><span>{{ bloquant }}</span>
        </p>

        <InscriptionEtapeEnfant v-if="etape === 0" :champs="champs" :annee-saison="anneeSaison" />
        <InscriptionEtapeResponsables v-else-if="etape === 1" :champs="champs" />
        <InscriptionEtapeSante v-else-if="etape === 2" :champs="champs" />
        <InscriptionEtapeAutorisations v-else-if="etape === 3" :champs="champs" />
        <InscriptionEtapeRecapitulatif
          v-else
          v-model:politique-lue="politiqueLue"
          :champs="champs"
          :bareme="bareme"
          :supplement-local-centimes="supplement"
          :deja-connecte="connecte"
        />

        <div class="formulaire__pied">
          <button v-if="etape > 0" type="button" class="bouton bouton--fantome" @click="precedent">
            <UiIcone nom="chevrons-gauche" :taille="15" /> Précédent
          </button>
          <button class="bouton bouton--principal" type="submit" :disabled="enCours">
            <template v-if="etape < 4">
              Continuer <UiIcone nom="chevrons-droite" :taille="15" />
            </template>
            <template v-else>
              {{ enCours ? 'Envoi…' : 'Déposer l’inscription' }}
            </template>
          </button>
        </div>
      </form>
    </template>
  </AppPage>
</template>

<style lang="scss" scoped>
.formulaire {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-inline-size: 52rem;

  &__pied {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    flex-wrap: wrap;
    padding-block-start: 0.5rem;
  }
}

.lien-bouton {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 3px;
  @include focus-visible;
}

.fin {
  max-inline-size: 44rem;

  &__actions {
    display: flex;
    gap: 0.6rem;
    flex-wrap: wrap;
  }

  &__virement {
    font-size: 1rem;
    line-height: 1.6;
    color: rgba($blanc, 0.62);
  }
}
</style>
