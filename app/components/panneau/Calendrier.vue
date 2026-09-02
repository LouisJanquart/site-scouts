<script setup lang="ts">
import { planning } from '~/data/planning'
import { sections, parSlug } from '~/data/sections'

// Le calendrier du panneau de gauche. Il lit le planning réel de la saison :
// un point sous chaque dimanche où il se passe quelque chose, la couleur du
// point suivant le type dominant (réunion d'unité en rouge, sinon cyan).

const { aujourdhui } = usePlanning()

const MOIS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
]

const parDate = computed(() => Object.fromEntries(planning.map((j) => [j.date, j])))

// Le mois affiché démarre sur celui d'aujourd'hui, borné à la saison.
const premierMois = computed(() => planning[0]?.date.slice(0, 7) ?? '2026-09')
const dernierMois = computed(() => planning.at(-1)?.date.slice(0, 7) ?? '2027-07')

const moisAffiche = ref('')
onMounted(() => {
  const m = aujourdhui.value.slice(0, 7)
  moisAffiche.value = m < premierMois.value ? premierMois.value : m > dernierMois.value ? dernierMois.value : m
})
// Valeur de départ pour le rendu serveur, pour éviter un décalage d'hydratation.
if (!moisAffiche.value) {
  const m = aujourdhui.value.slice(0, 7)
  moisAffiche.value = m < premierMois.value ? premierMois.value : m > dernierMois.value ? dernierMois.value : m
}

const annee = computed(() => Number(moisAffiche.value.slice(0, 4)))
const mois = computed(() => Number(moisAffiche.value.slice(5, 7)))
const libelleMois = computed(() => `${MOIS[mois.value - 1]} ${annee.value}`)

const peutReculer = computed(() => moisAffiche.value > premierMois.value)
const peutAvancer = computed(() => moisAffiche.value < dernierMois.value)

function decaler(pas: number) {
  const d = new Date(annee.value, mois.value - 1 + pas, 1)
  moisAffiche.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

interface Case {
  jour: number | null
  iso: string | null
}

const grille = computed<Case[]>(() => {
  const premier = new Date(annee.value, mois.value - 1, 1)
  const nbJours = new Date(annee.value, mois.value, 0).getDate()
  // getDay() : 0 = dimanche. On veut une semaine qui commence le lundi.
  const decalage = (premier.getDay() + 6) % 7
  const cases: Case[] = []
  for (let i = 0; i < decalage; i++) cases.push({ jour: null, iso: null })
  for (let j = 1; j <= nbJours; j++) {
    cases.push({
      jour: j,
      iso: `${annee.value}-${String(mois.value).padStart(2, '0')}-${String(j).padStart(2, '0')}`,
    })
  }
  return cases
})

const selection = ref<string | null>(null)
const jourSelectionne = computed(() => (selection.value ? parDate.value[selection.value] : null))

function classesJour(c: Case) {
  if (!c.iso) return {}
  const j = parDate.value[c.iso]
  const estUnite = Boolean(j?.evenement)
  return {
    'calendrier__jour--actif': Boolean(j),
    'calendrier__jour--unite': estUnite,
    'calendrier__jour--aujourdhui': c.iso === aujourdhui.value,
    'calendrier__jour--choisi': c.iso === selection.value,
  }
}

function choisir(c: Case) {
  if (!c.iso || !parDate.value[c.iso]) return
  selection.value = selection.value === c.iso ? null : c.iso
}

const sectionsDuJour = computed(() => {
  const j = jourSelectionne.value
  if (!j) return []
  return sections
    .filter((s) => s.cleplanning && j.sections[s.cleplanning])
    .map((s) => ({ section: s, entree: j.sections[s.cleplanning!]! }))
})
</script>

<template>
  <section class="panneau calendrier" aria-labelledby="titre-calendrier">
    <h2 id="titre-calendrier" class="lecteur-seul">Calendrier de la saison</h2>

    <div class="calendrier__barre">
      <button
        class="calendrier__nav"
        type="button"
        :disabled="!peutReculer"
        aria-label="Mois précédent"
        @click="decaler(-1)"
      >
        <UiIcone nom="chevrons-gauche" :taille="16" />
      </button>
      <span class="calendrier__mois">{{ libelleMois }}</span>
      <button
        class="calendrier__nav"
        type="button"
        :disabled="!peutAvancer"
        aria-label="Mois suivant"
        @click="decaler(1)"
      >
        <UiIcone nom="chevrons-droite" :taille="16" />
      </button>
    </div>

    <div class="calendrier__semaine" aria-hidden="true">
      <span v-for="j in ['L', 'M', 'M', 'J', 'V', 'S', 'D']" :key="j">{{ j }}</span>
    </div>

    <div class="calendrier__grille">
      <template v-for="(c, i) in grille" :key="i">
        <span v-if="!c.jour" class="calendrier__vide" />
        <button
          v-else
          type="button"
          class="calendrier__jour"
          :class="classesJour(c)"
          :disabled="!parDate[c.iso!]"
          :aria-label="parDate[c.iso!] ? `${c.jour} ${libelleMois}, activité prévue` : `${c.jour} ${libelleMois}`"
          @click="choisir(c)"
        >
          {{ c.jour }}
        </button>
      </template>
    </div>

    <div v-if="jourSelectionne" class="calendrier__detail">
      <p class="calendrier__detail-date mono">{{ formaterDate(jourSelectionne.date, true) }}</p>
      <p v-if="jourSelectionne.evenement" class="calendrier__detail-event">
        {{ jourSelectionne.evenement }}
      </p>
      <p v-if="jourSelectionne.remarque" class="calendrier__detail-note">
        {{ jourSelectionne.remarque }}
      </p>
      <ul v-if="sectionsDuJour.length" class="calendrier__detail-liste">
        <li v-for="d in sectionsDuJour" :key="d.section.slug" :data-section="d.section.slug">
          <NuxtLink :to="`/sections/${d.section.slug}`" class="calendrier__detail-ligne">
            <span class="etiquette">{{ d.section.nom }}</span>
            <span class="calendrier__detail-libelle">{{ d.entree.libelle }}</span>
          </NuxtLink>
        </li>
      </ul>
    </div>

    <NuxtLink v-else class="lien-fleche lien-fleche--droite calendrier__tout" to="/calendrier">
      Toute la saison
      <UiIcone nom="chevrons-droite" :taille="14" />
    </NuxtLink>
  </section>
</template>

<style lang="scss" scoped>
.calendrier {
  gap: 0.5rem;

  &__barre {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding-inline: 0.25rem;
  }

  &__nav {
    display: grid;
    place-items: center;
    inline-size: 1.75rem;
    block-size: 1.75rem;
    border-radius: 50%;
    color: $cyan;
    transition: background $vite $courbe;

    @include focus-visible;

    &:hover:not(:disabled) {
      background: rgba($cyan, 0.12);
    }
    &:disabled {
      color: rgba($blanc, 0.15);
      cursor: default;
    }
  }

  &__mois {
    font-size: 0.8rem;
    font-weight: 500;
    color: $cyan;
    text-transform: lowercase;
  }

  &__semaine,
  &__grille {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.1rem;
  }

  &__semaine {
    padding-block-end: 0.15rem;

    span {
      text-align: center;
      font-family: $police-mono;
      font-size: 0.6rem;
      color: rgba($blanc, 0.55);
    }
  }

  &__jour {
    position: relative;
    aspect-ratio: 1;
    display: grid;
    place-items: center;
    border-radius: 50%;
    font-family: $police-mono;
    font-size: 0.7rem;
    color: rgba($blanc, 0.55);
    cursor: default;

    @include focus-visible;

    &--actif {
      color: rgba($blanc, 0.75);
      cursor: pointer;

      &::after {
        content: '';
        position: absolute;
        inset-block-end: 0.1rem;
        inline-size: 0.2rem;
        block-size: 0.2rem;
        border-radius: 50%;
        background: $cyan;
      }

      &:hover {
        background: rgba($blanc, 0.07);
      }
    }

    &--unite::after {
      background: $rouge;
    }

    &--aujourdhui {
      background: $cyan;
      color: $noir;
      font-weight: 600;

      &::after {
        background: $noir;
      }
    }

    &--choisi:not(.calendrier__jour--aujourdhui) {
      background: rgba($blanc, 0.14);
      color: $blanc;
    }
  }

  &__vide {
    aspect-ratio: 1;
  }

  &__detail {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    margin-block-start: 0.5rem;
    padding-block-start: 0.7rem;
    border-block-start: 1px solid rgba($blanc, 0.07);
    max-block-size: 11rem;
    @include defilement-discret;
  }

  &__detail-date {
    font-size: 0.66rem;
    color: rgba($blanc, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  &__detail-event {
    font-size: 0.85rem;
    font-weight: 600;
    color: $rouge-texte;
  }

  &__detail-note {
    font-size: 0.72rem;
    color: rgba($blanc, 0.62);
  }

  &__detail-liste {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    margin-block-start: 0.2rem;
  }

  &__detail-ligne {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    align-items: flex-start;

    @include focus-visible;
    &:hover .calendrier__detail-libelle {
      color: $blanc;
    }
  }

  &__detail-libelle {
    font-size: 0.72rem;
    color: rgba($blanc, 0.66);
    line-height: 1.4;
  }

  &__tout {
    margin-block-start: 0.4rem;
  }
}
</style>
