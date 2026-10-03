<script setup lang="ts">
// Les événements, publiés par les staffs eux-mêmes. Mêmes règles que les
// actus : un chef pour sa section, le staff d'unité pour tout, et le serveur
// qui revérifie à chaque enregistrement.
import { bornesSections } from '#shared/orientation'

definePageMeta({ middleware: 'staff' })

const { data, pending, refresh } = await useFetch('/api/staff/evenements')
const { portee, nomPortee, nomDeSection } = usePortee()
const { mesSections } = useCompte()
const { aujourdhui } = usePlanning()

const pourLUnite = computed(() => Boolean(data.value?.pourLUnite))
const sectionsPossibles = computed(() =>
  pourLUnite.value ? bornesSections.map((s) => s.slug) : mesSections.value,
)

const voirPasses = ref(false)

// Même règle que les actus : sans portée, un chef voit ses sections.
const dansLaPortee = computed(() =>
  (data.value?.evenements ?? []).filter((e: any) =>
    portee.value
      ? e.section === portee.value
      : pourLUnite.value || mesSections.value.includes(e.section),
  ),
)
const passe = (e: any) => (e.dateFin ?? e.date) < aujourdhui.value
const nbPasses = computed(() => dansLaPortee.value.filter(passe).length)
const liste = computed(() => dansLaPortee.value.filter((e: any) => voirPasses.value || !passe(e)))

const PUBLICS = [
  { cle: 'tous', nom: 'Tout le monde', aide: 'Ouvert au dehors : visible sans compte, dans le calendrier public.' },
  { cle: 'parents', nom: 'Les familles', aide: 'Parents et animés connectés.' },
  { cle: 'chefs', nom: 'Les staffs', aide: 'Interne : seulement les chefs et le staff d’unité.' },
]

const ouverte = ref<string | null>(null)
const brouillon = ref<Record<string, any>>({})
const enCours = ref(false)
const souci = ref<string | null>(null)
const erreurs = ref<Record<string, string>>({})
const fait = ref<string | null>(null)

function remettreAZero() {
  souci.value = null
  erreurs.value = {}
  fait.value = null
}

function nouveau() {
  remettreAZero()
  ouverte.value = 'nouveau'
  brouillon.value = {
    titre: '',
    date: aujourdhui.value,
    dateFin: '',
    heure: '',
    lieu: 'Local de l’unité, Fleurus',
    section: portee.value || (pourLUnite.value ? '' : sectionsPossibles.value[0]),
    public: 'parents',
    resume: '',
    description: '',
    inscription: false,
    photo: '',
  }
}

function modifier(e: any) {
  if (ouverte.value === e.id) {
    ouverte.value = null
    return
  }
  remettreAZero()
  ouverte.value = e.id
  brouillon.value = {
    titre: e.titre,
    date: e.date,
    dateFin: e.dateFin ?? '',
    heure: e.heure ?? '',
    lieu: e.lieu,
    section: e.section ?? '',
    public: e.public,
    resume: e.resume,
    description: e.description,
    inscription: Boolean(e.inscription),
    photo: e.photo ?? '',
  }
}

async function enregistrer(statut: 'brouillon' | 'publie') {
  enCours.value = true
  souci.value = null
  erreurs.value = {}
  const corps = { ...brouillon.value, statut }
  try {
    if (ouverte.value === 'nouveau') {
      await $fetch('/api/staff/evenements', { method: 'POST', body: corps })
    } else {
      await $fetch(`/api/staff/evenements/${ouverte.value}`, { method: 'PATCH', body: corps })
    }
    fait.value = statut === 'publie' ? 'Événement en ligne.' : 'Brouillon enregistré.'
    ouverte.value = null
    await refresh()
  } catch (e: any) {
    souci.value = e?.data?.statusMessage ?? e?.statusMessage ?? 'Enregistrement impossible.'
    erreurs.value = e?.data?.data?.champs ?? {}
  } finally {
    enCours.value = false
  }
}

async function supprimer(e: any) {
  const ok = window.confirm(
    `Supprimer « ${e.titre} » pour de bon ?\n\nPour le retirer du site sans le perdre, repasse-le plutôt en brouillon.`,
  )
  if (!ok) return
  try {
    await $fetch(`/api/staff/evenements/${e.id}`, { method: 'DELETE' })
    ouverte.value = null
    fait.value = 'Événement supprimé.'
    await refresh()
  } catch (err: any) {
    souci.value = err?.data?.statusMessage ?? 'Suppression impossible.'
  }
}

function nomPublic(cle: string) {
  return PUBLICS.find((p) => p.cle === cle)?.nom ?? cle
}

useHead({ title: 'Événements — 16e Fleurus' })
</script>

<template>
  <AppPage
    titre="Événements"
    surtitre="Staff"
    :chapo="`Les rendez-vous de l’unité et des sections. Portée : ${nomPortee}.`"
    :retour="{ to: '/gestion', texte: 'Back office' }"
  >
    <template #entete>
      <GestionBarre />
    </template>

    <div class="publications">
      <div class="entete-liste">
        <p class="doux">
          {{ liste.length }} événement{{ liste.length > 1 ? 's' : '' }}
          {{ voirPasses ? '' : 'à venir' }}
          <template v-if="portee"> pour {{ nomDeSection(portee) }}</template>
          <button
            v-if="nbPasses"
            class="lien-discret"
            type="button"
            @click="voirPasses = !voirPasses"
          >
            {{ voirPasses ? 'Masquer' : 'Afficher' }} les {{ nbPasses }} passés
          </button>
        </p>
        <button
          v-if="sectionsPossibles.length"
          class="bouton bouton--principal"
          type="button"
          @click="nouveau"
        >
          <UiIcone nom="plus" :taille="16" />
          Nouvel événement
        </button>
      </div>

      <p v-if="fait" class="alerte alerte--bien" role="status">{{ fait }}</p>
      <p v-if="souci && ouverte === null" class="alerte alerte--erreur">{{ souci }}</p>

      <GestionFormulaireEvenement
        v-if="ouverte === 'nouveau'"
        v-model="brouillon"
        titre-formulaire="Nouvel événement"
        :sections-possibles="sectionsPossibles"
        :pour-l-unite="pourLUnite"
        :publics="PUBLICS"
        :erreurs="erreurs"
        :souci="souci"
        :en-cours="enCours"
        @enregistrer="enregistrer"
        @annuler="ouverte = null"
      />

      <p v-if="pending" class="alerte alerte--info">Chargement…</p>
      <p v-else-if="!liste.length" class="alerte alerte--info">
        Aucun événement à venir dans cette portée.
      </p>

      <ul class="liste">
        <li v-for="e in liste" :key="e.id" class="carte" :data-section="e.section ?? undefined">
          <div class="carte__tete">
            <div class="carte__titre">
              <span class="carte__date doux">
                {{ formaterDate(e.date, true) }}
                <template v-if="e.dateFin"> → {{ formaterDate(e.dateFin, true) }}</template>
                <template v-if="e.heure"> · <span class="sans-coupure">{{ e.heure }}</span></template>
              </span>
              <span class="carte__nom">{{ e.titre }}</span>
            </div>
            <span v-if="e.statut === 'brouillon'" class="etiquette etiquette--sourde">brouillon</span>
            <span v-else-if="e.aRelire" class="etiquette etiquette--relire">à relire</span>
            <span v-else class="etiquette etiquette--enligne">en ligne</span>
          </div>

          <div class="carte__meta">
            <span v-if="!e.section" class="etiquette etiquette--sourde">Toute l’unité</span>
            <span v-else class="etiquette" :data-section="e.section">{{ nomDeSection(e.section) }}</span>
            <span class="doux">{{ nomPublic(e.public) }}</span>
            <span v-if="e.lieu" class="doux">{{ e.lieu }}</span>
          </div>

          <p v-if="e.resume" class="carte__chapo">{{ e.resume }}</p>

          <div class="actions">
            <button
              v-if="e.modifiable"
              class="bouton bouton--fantome"
              type="button"
              @click="modifier(e)"
            >
              <UiIcone nom="crayon" :taille="15" />
              {{ ouverte === e.id ? 'Fermer' : e.aRelire ? 'Relire et modifier' : 'Modifier' }}
            </button>
            <NuxtLink
              v-if="e.statut === 'publie'"
              class="bouton bouton--fantome"
              :to="`/events/${e.slug}`"
              target="_blank"
            >
              Voir sur le site
            </NuxtLink>
            <span v-if="!e.modifiable" class="doux petit">
              {{ e.section ? 'Une autre section' : 'Rendez-vous d’unité, géré par le staff d’unité' }}
            </span>
          </div>

          <GestionFormulaireEvenement
            v-if="ouverte === e.id"
            v-model="brouillon"
            titre-formulaire="Modifier l’événement"
            :sections-possibles="sectionsPossibles"
            :pour-l-unite="pourLUnite"
            :publics="PUBLICS"
            :erreurs="erreurs"
            :souci="souci"
            :en-cours="enCours"
            :statut-actuel="e.statut"
            supprimable
            @enregistrer="enregistrer"
            @annuler="ouverte = null"
            @supprimer="supprimer(e)"
          />
        </li>
      </ul>
    </div>
  </AppPage>
</template>
