<script setup lang="ts">
// L'agenda de la section : un bloc par mois, une tuile par samedi.
// Réservé aux familles — un visiteur ne voit que le prochain jour de réunion.
//
// La tuile dit le type de samedi par sa forme autant que par sa couleur
// (pleine pour un hike, cerclée pour une spéciale, en pointillés pour une
// relâche) : la couleur seule ne se distingue pas pour tout le monde.
import { typesReunion } from '~/composables/usePlanning'

const { slug, section } = useSectionCourante()
const { planningDeSection, prochainSamedi, aujourdhui } = usePlanning()
const { voitLeCalendrier } = useRole()

const MOIS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
]

const tout = computed(() => planningDeSection(slug.value))
const aVenir = computed(() => tout.value.filter((j) => j.date >= aujourdhui.value))
const passes = computed(() => tout.value.filter((j) => j.date < aujourdhui.value).reverse())
const montrerPasse = ref(false)

const parMois = computed(() => {
  const groupes: { cle: string; nom: string; jours: typeof aVenir.value }[] = []
  for (const j of aVenir.value) {
    const cle = j.date.slice(0, 7)
    let g = groupes.find((x) => x.cle === cle)
    if (!g) {
      const [a, m] = cle.split('-')
      g = { cle, nom: `${MOIS[Number(m) - 1]} ${a}`, jours: [] }
      groupes.push(g)
    }
    g.jours.push(j)
  }
  return groupes
})

// Combien de fois chaque type de samedi revient dans l'année : une manière
// simple de dire à un parent à quoi ressemble une saison.
const repartition = computed(() => {
  const compte = new Map<string, number>()
  for (const j of tout.value) if (j.type) compte.set(j.type, (compte.get(j.type) ?? 0) + 1)
  return [...compte.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([type, n]) => ({ type, n, nom: typesReunion[type as keyof typeof typesReunion].nom }))
})

function forme(type: string | null) {
  if (type === 'hike' || type === 'grande-sortie') return 'pleine'
  if (type === 'speciale') return 'cerclee'
  if (type === 'unite' || type === 'bar') return 'unite'
  if (type === 'relache') return 'creuse'
  return 'normale'
}

const visiteurSamedi = computed(() => prochainSamedi())

useHead(() => ({ title: `Agenda ${section.value?.nom ?? ''} — 16e Fleurus` }))
</script>

<template>
  <div v-if="voitLeCalendrier" class="bento">
    <UiBloc v-if="repartition.length" etiquette="Une saison, en gros">
      <ul class="inventaire saison">
        <li v-for="r in repartition" :key="r.type">
          <div class="compte" :class="`compte--${forme(r.type)}`">
            <span class="compte__n">{{ r.n }}</span>
            <span class="compte__nom">{{ r.nom }}</span>
          </div>
        </li>
      </ul>
    </UiBloc>

    <UiBloc
      v-for="(m, i) in parMois"
      :key="m.cle"
      :etiquette="m.nom"
      :ton="i === 0 ? 'section' : 'neutre'"
    >
      <UiPuits as="ol" class="mois">
        <li
          v-for="(j, k) in m.jours"
          :key="j.date"
          class="samedi"
          :class="[`samedi--${forme(j.type)}`, { 'samedi--prochain': i === 0 && k === 0 }]"
        >
          <span v-if="i === 0 && k === 0" class="samedi__pastille">Prochain</span>
          <span class="samedi__jour">{{ j.date.slice(8) }}</span>
          <span class="samedi__quoi">{{ sansCode(j.libelle) }}</span>
          <span class="samedi__meta mono">
            {{ j.type === 'relache' ? 'pas de réunion' : j.horaire === 'hiver' ? '14:00 – 17:00' : j.horaire === 'ete' ? '14:00 – 17:30' : 'horaire à venir' }}
          </span>
          <span v-if="j.evenement" class="samedi__event">{{ j.evenement }}</span>
        </li>
      </UiPuits>
    </UiBloc>

    <UiBloc v-if="!parMois.length" etiquette="Cette saison">
      <p class="doux">Plus de date à venir cette saison. Le calendrier reprend à la rentrée.</p>
    </UiBloc>

    <UiBloc v-if="passes.length" etiquette="Déjà passés">
      <button
        class="bouton bouton--fantome bascule"
        type="button"
        :aria-expanded="montrerPasse"
        @click="montrerPasse = !montrerPasse"
      >
        {{ montrerPasse ? 'Masquer' : 'Voir' }} les {{ passes.length }} samedis passés
      </button>
      <UiPuits v-if="montrerPasse" as="ol" class="passes">
        <li v-for="j in passes" :key="j.date" class="passes__ligne">
          <span class="mono">{{ formaterDateCourte(j.date) }}</span>
          <span>{{ sansCode(j.libelle) }}</span>
        </li>
      </UiPuits>
    </UiBloc>
  </div>

  <div v-else class="bento bento--etire">
    <UiBloc class="bento__5" etiquette="Prochaine réunion" ton="cyan">
      <div v-if="visiteurSamedi" class="samedi samedi--normale samedi--seul">
        <span class="samedi__jour">{{ visiteurSamedi.date.slice(8) }}</span>
        <span class="samedi__quoi">{{ majuscule(formaterDate(visiteurSamedi.date, true)) }}</span>
        <span class="samedi__meta mono">
          {{ visiteurSamedi.horaire === 'hiver' ? '14:00 – 17:00' : '14:00 – 17:30' }}
        </span>
      </div>
    </UiBloc>
    <UiBloc class="bento__7" etiquette="Réservé aux familles">
      <div class="reserve">
        <UiIcone nom="cadenas" :taille="20" />
        <div>
          <p class="reserve__titre">Le programme est réservé aux familles</p>
          <p class="reserve__texte">
            Les dates et les horaires sont publics, ce que chaque section y fait ne l’est pas.
            Connectez-vous pour voir le calendrier complet.
          </p>
          <NuxtLink class="lien-fleche reserve__lien" to="/connexion">
            Se connecter
            <UiIcone nom="chevrons-droite" :taille="14" />
          </NuxtLink>
        </div>
      </div>
    </UiBloc>
  </div>
</template>

<style lang="scss" scoped>
.saison {
  grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));
}

.compte {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: $esp-2 $esp-3;
  background: $ardoise;
  border-radius: $r-tuile;

  &__n {
    font-family: $police-titre;
    font-variation-settings: 'wdth' 125;
    font-weight: 800;
    font-size: 1.75rem;
    line-height: 1;
  }

  &__nom {
    font-size: 0.85rem;
    color: rgba($blanc, 0.75);
  }

  &--pleine {
    background: var(--section-teinte);
    color: $noir;
    .compte__nom { color: $noir; }
  }
  &--cerclee { box-shadow: inset 0 0 0 2px $cyan; }
  &--unite {
    background: $rouge-plein;
    .compte__nom { color: $blanc; }
  }
  &--creuse {
    background: transparent;
    border: 2px dashed rgba($blanc, 0.2);
  }
}

// Cinq colonnes, parce qu'un mois a au plus cinq samedis : la grille se
// remplit au lieu de laisser un trou à droite des mois courts.
.mois {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @include depuis($bp-poche) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  @include depuis($bp-tablette) {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }

  gap: $esp-1;
  // De la place pour la pastille « Prochain » qui déborde du coin.
  padding-block-start: $esp-3;
}

.samedi {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-block-size: 8.5rem;
  min-inline-size: 0;
  padding: $esp-3;
  background: $ardoise;
  border-radius: $r-tuile;

  &__jour {
    font-family: $police-titre;
    font-variation-settings: 'wdth' 125;
    font-weight: 800;
    font-size: 2rem;
    line-height: 1;
    margin-block-end: $esp-1;
  }

  &__quoi {
    font-size: 0.9rem;
    font-weight: 600;
    line-height: 1.3;
    overflow-wrap: anywhere;
  }

  &__meta {
    font-size: 0.72rem;
    color: rgba($blanc, 0.65);
  }

  &__event {
    font-size: 0.78rem;
    color: var(--section-teinte);
  }

  &__pastille {
    position: absolute;
    inset-block-start: -0.7rem;
    inset-inline-end: -0.3rem;
    padding: 0.15rem 0.6rem;
    background: var(--section-teinte);
    color: $noir;
    border: 4px solid $ardoise-sourd;
    border-radius: $r-pilule;
    font-family: $police-mono;
    font-size: 0.68rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  &--prochain {
    box-shadow: inset 0 0 0 2px var(--section-teinte);
  }

  &--pleine {
    background: var(--section-teinte);
    color: $noir;

    .samedi__meta,
    .samedi__event {
      color: $noir;
    }
  }

  &--cerclee {
    box-shadow: inset 0 0 0 2px $cyan;
  }

  &--unite {
    background: $rouge-plein;

    .samedi__meta,
    .samedi__event {
      color: rgba($blanc, 0.9);
    }
  }

  &--creuse {
    background: transparent;
    border: 2px dashed rgba($blanc, 0.18);

    .samedi__jour,
    .samedi__quoi {
      color: rgba($blanc, 0.55);
    }
  }

  &--seul {
    min-block-size: 0;
  }
}

.bascule {
  align-self: flex-start;
}

.passes__ligne {
  display: grid;
  grid-template-columns: 4.5rem minmax(0, 1fr);
  gap: $esp-2;
  padding: $esp-1 $esp-2;
  font-size: 0.9rem;
  color: rgba($blanc, 0.7);
}
</style>
