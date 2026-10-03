<script setup lang="ts">

// Le calendrier du panneau de gauche.
//
// Deux règles tenues ici :
//   1. Il ne change JAMAIS de taille. La grille affiche toujours six semaines,
//      même quand le mois en tient cinq, et le détail du jour choisi n'est pas
//      affiché ici mais dans l'encart de l'accueil, à sa droite.
//   2. Il est réservé aux familles. Un visiteur voit une invitation à la place.

const { aujourdhui } = usePlanning()
const selection = useJourSelectionne()
const { voitLeCalendrier } = useRole()
// Le planning et les événements viennent de l'API, déjà filtrés : un visiteur
// n'en reçoit que le squelette, sans le programme des sections.
const { planning, evenements } = useContenu()
const route = useRoute()
const router = useRouter()

const MOIS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
]

const parDate = computed(() => Object.fromEntries(planning.value.map((j) => [j.date, j])))

const premierMois = computed(() => planning.value[0]?.date.slice(0, 7) ?? '2026-09')
const dernierMois = computed(() => planning.value.at(-1)?.date.slice(0, 7) ?? '2027-07')

function moisDeDepart() {
  const m = aujourdhui.value.slice(0, 7)
  if (m < premierMois.value) return premierMois.value
  if (m > dernierMois.value) return dernierMois.value
  return m
}
const moisAffiche = ref(moisDeDepart())

// Si le jour choisi est dans un autre mois, on suit.
watch(selection, (v) => {
  if (v) moisAffiche.value = v.slice(0, 7)
})

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
  horsMois: boolean
}

// Toujours 42 cases, soit six semaines pleines : c'est ce qui garantit que le
// panneau ne bouge pas d'un mois à l'autre.
const grille = computed<Case[]>(() => {
  const premier = new Date(annee.value, mois.value - 1, 1)
  const decalage = (premier.getDay() + 6) % 7 // semaine commençant le lundi
  const cases: Case[] = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(annee.value, mois.value - 1, 1 + i - decalage)
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate(),
    ).padStart(2, '0')}`
    cases.push({
      jour: d.getDate(),
      iso,
      horsMois: d.getMonth() !== mois.value - 1,
    })
  }
  return cases
})

function classesJour(c: Case) {
  const j = c.iso ? parDate.value[c.iso] : undefined
  return {
    'calendrier__jour--hors': c.horsMois,
    'calendrier__jour--actif': Boolean(j) && !c.horsMois,
    'calendrier__jour--unite': Boolean(j?.evenement) && !c.horsMois,
    'calendrier__jour--aujourdhui': c.iso === aujourdhui.value,
    'calendrier__jour--choisi': c.iso === selection.value,
  }
}

function choisir(c: Case) {
  if (!c.iso || c.horsMois || !parDate.value[c.iso]) return
  selection.value = selection.value === c.iso ? null : c.iso
  // L'encart qui décrit le jour vit sur l'accueil : on y renvoie.
  if (selection.value && route.path !== '/') router.push('/')
}

// Pour l'invitation on prend le prochain rendez-vous ouvert au dehors, avec son
// titre public : le libellé du classeur contient du jargon interne
// (« Portes Ouvertes + CU ») qui ne veut rien dire pour un visiteur.
const prochainEvenement = computed(
  () =>
    evenements.value
      .filter((e: any) => (e.dateFin ?? e.date) >= aujourdhui.value)
      .sort((a: any, b: any) => a.date.localeCompare(b.date))[0] ?? null,
)
</script>

<template>
  <section class="panneau calendrier" aria-labelledby="titre-calendrier">
    <h2 id="titre-calendrier" class="lecteur-seul">Calendrier de la saison</h2>

    <template v-if="voitLeCalendrier">
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
        <span v-for="(j, i) in ['L', 'M', 'M', 'J', 'V', 'S', 'D']" :key="i">{{ j }}</span>
      </div>

      <div class="calendrier__grille">
        <button
          v-for="(c, i) in grille"
          :key="i"
          type="button"
          class="calendrier__jour"
          :class="classesJour(c)"
          :disabled="c.horsMois || !parDate[c.iso!]"
          :aria-label="
            parDate[c.iso!] && !c.horsMois
              ? `${c.jour} ${libelleMois}, activité prévue`
              : `${c.jour} ${libelleMois}`
          "
          :aria-pressed="c.iso === selection"
          @click="choisir(c)"
        >
          {{ c.jour }}
        </button>
      </div>

      <NuxtLink class="lien-fleche lien-fleche--droite calendrier__tout" to="/calendrier">
        Toute la saison
        <UiIcone nom="chevrons-droite" :taille="14" />
      </NuxtLink>
    </template>

    <!-- Vue visiteur : pas de calendrier, une invitation à la place. -->
    <div v-else class="invitation">
      <UiIcone nom="tente" :taille="26" class="invitation__icone" />
      <p class="invitation__titre">Envie de nous rejoindre ?</p>
      <p class="invitation__texte">
        Réunions le samedi après-midi, de septembre à mai.
      </p>
      <NuxtLink
        v-if="prochainEvenement"
        class="bouton bouton--principal invitation__bouton"
        :to="`/events/${prochainEvenement.slug}`"
      >
        {{ prochainEvenement.titre }}
        <span class="mono invitation__date">{{ formaterDateCourte(prochainEvenement.date) }}</span>
      </NuxtLink>
      <NuxtLink class="lien-fleche invitation__lien" to="/infos">
        Les infos pratiques
        <UiIcone nom="chevrons-droite" :taille="14" />
      </NuxtLink>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.calendrier {
  gap: 0.5rem;
  // Hauteur fixe : six semaines de grille, plus la barre et le lien. Le panneau
  // ne doit pas changer de taille quand on change de mois ou qu'on choisit un
  // jour.
  flex: 0 0 auto;

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
      color: rgba($blanc, 0.22);
      cursor: default;
    }
  }

  &__mois {
    font-size: 1rem;
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
      font-size: 0.75rem;
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
    font-size: 0.75rem;
    color: rgba($blanc, 0.55);
    cursor: default;

    @include focus-visible;

    // Les jours du mois précédent ou suivant restent visibles mais éteints :
    // c'est ce qui permet d'avoir toujours six lignes.
    &--hors {
      color: rgba($blanc, 0.14);
    }

    &--actif {
      color: rgba($blanc, 0.78);
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
        background: rgba($blanc, 0.08);
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
      background: rgba($blanc, 0.16);
      color: $blanc;

      &::after {
        background: $blanc;
      }
    }
  }

  &__tout {
    margin-block-start: 0.5rem;
  }
}

.invitation {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.5rem 0.25rem;

  &__icone {
    color: $cyan;
    margin-block-end: 0.25rem;
  }

  &__titre {
    font-family: $police-titre;
    font-weight: 700;
    font-size: 1rem;
    text-transform: uppercase;
    letter-spacing: -0.005em;
  }

  &__texte {
    font-size: 1rem;
    line-height: 1.55;
    color: rgba($blanc, 0.62);
  }

  &__bouton {
    margin-block-start: 0.35rem;
    flex-wrap: wrap;
    text-align: start;
  }

  &__date {
    font-size: 0.75rem;
    // Ni opacité ni blanc atténué : sur l'aplat rouge, la moindre transparence
    // fait passer sous le seuil. La date se distingue par sa taille.
    color: $blanc;
  }

  &__lien {
    padding-inline: 0;
  }
}
</style>
