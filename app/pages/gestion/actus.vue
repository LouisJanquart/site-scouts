<script setup lang="ts">
// Les actus, publiées par les staffs eux-mêmes.
//
// Un chef écrit pour sa section et publie sans validation (choix du
// 15/09/2026). Le staff d'unité écrit pour toute l'unité ou pour n'importe
// quelle section. L'interface ne propose que ce qu'on a le droit de faire,
// mais c'est le serveur qui tranche à chaque enregistrement.
import { bornesSections } from '#shared/orientation'

definePageMeta({ middleware: 'staff' })

const { data, pending, refresh } = await useFetch('/api/staff/actus')
const { portee, nomPortee, nomDeSection } = usePortee()
const { mesSections } = useCompte()

const pourLUnite = computed(() => Boolean(data.value?.pourLUnite))
const sectionsPossibles = computed(() =>
  pourLUnite.value ? bornesSections.map((s) => s.slug) : mesSections.value,
)

// Une actu entre dans la portée si elle vise la section choisie. Sans portée,
// le staff d'unité voit tout, et un chef voit ce qui touche ses sections : le
// reste, il le lit déjà sur le site, il n'a pas à le trier ici.
const liste = computed(() =>
  (data.value?.actus ?? []).filter((a: any) =>
    portee.value
      ? a.sections.includes(portee.value)
      : pourLUnite.value || a.sections.some((s: string) => mesSections.value.includes(s)),
  ),
)

const PUBLICS = [
  { cle: 'tous', nom: 'Tout le monde', aide: 'Visible sans compte, sur le site public.' },
  { cle: 'parents', nom: 'Les familles', aide: 'Parents et animés connectés.' },
  { cle: 'chefs', nom: 'Les staffs', aide: 'Seulement les chefs et le staff d’unité.' },
]

// --- Le formulaire ------------------------------------------------------------

const ouverte = ref<string | null>(null) // id de l'actu, ou « nouvelle »
const brouillon = ref<Record<string, any>>({})
const enCours = ref(false)
const souci = ref<string | null>(null)
const erreurs = ref<Record<string, string>>({})
const fait = ref<string | null>(null)

function aujourdhui() {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Brussels' })
}

function nouvelle() {
  souci.value = null
  erreurs.value = {}
  fait.value = null
  ouverte.value = 'nouvelle'
  const section = portee.value || (pourLUnite.value ? '' : sectionsPossibles.value[0])
  brouillon.value = {
    titre: '',
    date: aujourdhui(),
    sections: section ? [section] : [],
    public: 'parents',
    chapo: '',
    corps: '',
  }
}

function modifier(a: any) {
  if (ouverte.value === a.id) {
    ouverte.value = null
    return
  }
  souci.value = null
  erreurs.value = {}
  fait.value = null
  ouverte.value = a.id
  brouillon.value = {
    titre: a.titre,
    date: a.date,
    sections: [...a.sections],
    public: a.public,
    chapo: a.chapo,
    corps: a.corps.join('\n\n'),
  }
}

async function enregistrer(statut: 'brouillon' | 'publie') {
  enCours.value = true
  souci.value = null
  erreurs.value = {}
  const corps = { ...brouillon.value, statut }
  try {
    if (ouverte.value === 'nouvelle') {
      await $fetch('/api/staff/actus', { method: 'POST', body: corps })
    } else {
      await $fetch(`/api/staff/actus/${ouverte.value}`, { method: 'PATCH', body: corps })
    }
    fait.value = statut === 'publie' ? 'Actu en ligne.' : 'Brouillon enregistré.'
    ouverte.value = null
    await refresh()
  } catch (e: any) {
    souci.value = e?.data?.statusMessage ?? e?.statusMessage ?? 'Enregistrement impossible.'
    erreurs.value = e?.data?.data?.champs ?? {}
  } finally {
    enCours.value = false
  }
}

async function supprimer(a: any) {
  const ok = window.confirm(
    `Supprimer « ${a.titre} » pour de bon ?\n\nPour la retirer du site sans la perdre, repasse-la plutôt en brouillon.`,
  )
  if (!ok) return
  try {
    await $fetch(`/api/staff/actus/${a.id}`, { method: 'DELETE' })
    ouverte.value = null
    fait.value = 'Actu supprimée.'
    await refresh()
  } catch (e: any) {
    souci.value = e?.data?.statusMessage ?? 'Suppression impossible.'
  }
}

function nomPublic(cle: string) {
  return PUBLICS.find((p) => p.cle === cle)?.nom ?? cle
}

useHead({ title: 'Actus — 16e Fleurus' })
</script>

<template>
  <AppPage
    titre="Actus"
    surtitre="Staff"
    :chapo="`Écrire, publier et retirer les actus du site. Portée : ${nomPortee}.`"
    :retour="{ to: '/gestion', texte: 'Back office' }"
  >
    <template #entete>
      <GestionBarre />
    </template>

    <div class="publications">
      <div class="entete-liste">
        <p class="doux">
          {{ liste.length }} actu{{ liste.length > 1 ? 's' : '' }}
          <template v-if="portee"> pour {{ nomDeSection(portee) }}</template>
        </p>
        <button
          v-if="sectionsPossibles.length"
          class="bouton bouton--principal"
          type="button"
          @click="nouvelle"
        >
          <UiIcone nom="plus" :taille="16" />
          Nouvelle actu
        </button>
      </div>

      <p v-if="fait" class="alerte alerte--bien" role="status">{{ fait }}</p>
      <p v-if="souci && ouverte === null" class="alerte alerte--erreur">{{ souci }}</p>

      <GestionFormulaireActu
        v-if="ouverte === 'nouvelle'"
        v-model="brouillon"
        titre-formulaire="Nouvelle actu"
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
        Aucune actu dans cette portée pour l’instant.
      </p>

      <ul class="liste">
        <li
          v-for="a in liste"
          :key="a.id"
          class="carte"
          :data-section="a.sections.length === 1 ? a.sections[0] : undefined"
        >
          <div class="carte__tete">
            <div class="carte__titre">
              <span class="carte__date doux">{{ formaterDate(a.date, true) }}</span>
              <span class="carte__nom">{{ a.titre }}</span>
            </div>
            <span v-if="a.statut === 'brouillon'" class="etiquette etiquette--sourde">brouillon</span>
            <span v-else-if="a.aRelire" class="etiquette etiquette--relire">à relire</span>
            <span v-else class="etiquette etiquette--enligne">en ligne</span>
          </div>

          <div class="carte__meta">
            <span v-if="!a.sections.length" class="etiquette etiquette--sourde">Toute l’unité</span>
            <span
              v-for="s in a.sections"
              :key="s"
              class="etiquette"
              :data-section="s"
            >{{ nomDeSection(s) }}</span>
            <span class="doux">· {{ nomPublic(a.public) }}</span>
          </div>

          <p v-if="a.chapo" class="carte__chapo">{{ a.chapo }}</p>

          <div class="actions">
            <button
              v-if="a.modifiable"
              class="bouton bouton--fantome"
              type="button"
              @click="modifier(a)"
            >
              <UiIcone nom="crayon" :taille="15" />
              {{ ouverte === a.id ? 'Fermer' : a.aRelire ? 'Relire et modifier' : 'Modifier' }}
            </button>
            <NuxtLink
              v-if="a.statut === 'publie'"
              class="bouton bouton--fantome"
              :to="`/actus/${a.slug}`"
              target="_blank"
            >
              Voir sur le site
            </NuxtLink>
            <span v-if="!a.modifiable" class="doux petit">
              {{ a.sections.length ? 'Une autre section' : 'Actu d’unité, gérée par le staff d’unité' }}
            </span>
          </div>

          <GestionFormulaireActu
            v-if="ouverte === a.id"
            v-model="brouillon"
            titre-formulaire="Modifier l’actu"
            :sections-possibles="sectionsPossibles"
            :pour-l-unite="pourLUnite"
            :publics="PUBLICS"
            :erreurs="erreurs"
            :souci="souci"
            :en-cours="enCours"
            :statut-actuel="a.statut"
            supprimable
            @enregistrer="enregistrer"
            @annuler="ouverte = null"
            @supprimer="supprimer(a)"
          />
        </li>
      </ul>
    </div>
  </AppPage>
</template>
