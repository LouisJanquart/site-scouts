<script setup lang="ts">
// La première rubrique : l'accueil de la section. La photo en L, le nom qui
// prend toute la place, puis la prochaine réunion, les rendez-vous, la
// section en deux mots et un aperçu du staff.
import type { CompositionSpec } from '~/utils/bento'
import type { Section } from '~/data/sections'

const props = defineProps<{
  section: Section
  rubriques: { id: string; nom: string }[]
}>()

const { prochaineReunion, prochainSamedi, planningDeSection, aujourdhui } = usePlanning()
const { voitLeCalendrier, voitLeStaff } = useRole()
const { chefsDeSection, evenements } = useContenu()

const slug = computed(() => props.section.slug)
const prochaine = computed(() => prochaineReunion(slug.value))
const samedi = computed(() => prochaine.value ?? prochainSamedi())
const ensuite = computed(() =>
  voitLeCalendrier.value
    ? planningDeSection(slug.value)
        .filter((j) => j.date > (samedi.value?.date ?? aujourdhui.value) && j.type !== 'relache')
        .slice(0, 2)
    : [],
)
const rendezVous = computed(() =>
  evenements.value
    .filter((e: any) => e.section === slug.value && (e.dateFin ?? e.date) >= aujourdhui.value)
    .slice(0, 2),
)
const staff = computed(() => chefsDeSection(slug.value))

const etiquette = computed(() => {
  const s = props.section
  const genre = s.genre === 'filles' ? 'filles' : s.genre === 'garcons' ? 'garçons' : s.genre === 'mixte' ? 'mixte' : ''
  return [s.ages, genre].filter(Boolean).join(' · ') || 'Section'
})
const composition = computed(() =>
  props.section.genre === 'mixte' ? 'Mixte' : props.section.genre === 'filles' ? 'Filles' : props.section.genre === 'garcons' ? 'Garçons' : null,
)

function horaire(h: string | null | undefined) {
  return h === 'hiver' ? '14h – 17h' : '14h – 17h30'
}
function initiales(c: { totem: string | null; prenom: string }) {
  return (c.totem || c.prenom).slice(0, 2).toUpperCase()
}

// La grille de Louise : la photo en L à gauche, deux zones empilées à droite,
// deux zones en bas. Trois lignes intérieures inclinées.
const spec: CompositionSpec = {
  lignes: {
    v8: [[0.699, 0], [0.64, 0.57]],
    v8b: [[0.635, 0.57], [0.663, 1]],
    h1: [[0.64, 0.3], [1, 0.33]],
    h2: [[0, 0.57], [1, 0.57]],
    v3: [[0.256, 0.57], [0.232, 1]],
  },
  zones: {
    heros: {
      coins: [
        ['gauche', 0, 'haut', 0],
        ['v8', -1, 'haut', 0],
        ['v8', -1, 'h2', -1],
        ['v3', -1, 'h2', -1],
        ['v3', -1, 'bas', 0],
        ['gauche', 0, 'bas', 0],
      ],
      boites: {
        haut: [
          ['gauche', 0, 'haut', 0],
          ['v8', -1, 'haut', 0],
          ['v8', -1, 'h2', -1],
          ['gauche', 0, 'h2', -1],
        ],
        bas: [
          ['gauche', 0, 'h2', -1],
          ['v3', -1, 'h2', -1],
          ['v3', -1, 'bas', 0],
          ['gauche', 0, 'bas', 0],
        ],
      },
    },
    prochaine: {
      coins: [
        ['v8', 1, 'haut', 0],
        ['droite', 0, 'haut', 0],
        ['droite', 0, 'h1', -1],
        ['v8', 1, 'h1', -1],
      ],
    },
    rdv: {
      coins: [
        ['v8', 1, 'h1', 1],
        ['droite', 0, 'h1', 1],
        ['droite', 0, 'h2', -1],
        ['v8', 1, 'h2', -1],
      ],
    },
    section: {
      coins: [
        ['v3', 1, 'h2', 1],
        ['v8b', -1, 'h2', 1],
        ['v8b', -1, 'bas', 0],
        ['v3', 1, 'bas', 0],
      ],
    },
    staff: {
      coins: [
        ['v8b', 1, 'h2', 1],
        ['droite', 0, 'h2', 1],
        ['droite', 0, 'bas', 0],
        ['v8b', 1, 'bas', 0],
      ],
    },
  },
}
</script>

<template>
  <BentoComposition
    class="accueil"
    :spec="spec"
    :fonds="{ heros: { image: section.photo, voile: 'bas' } }"
    :marge="[26, 34]"
  >
    <template #heros-haut>
      <div class="heros">
        <NuxtLink class="heros__retour" to="/sections">
          <UiIcone nom="chevrons-gauche" :taille="14" /> Toutes les sections
        </NuxtLink>
        <div class="heros__bas">
          <span class="heros__etiquette mono">{{ etiquette }}</span>
          <h1 class="heros__titre">{{ section.nom }}</h1>
          <nav class="heros__liens" aria-label="Les rubriques de la section">
            <a v-for="r in rubriques.slice(1)" :key="r.id" :href="`#${r.id}`">{{ r.nom }}</a>
          </nav>
        </div>
      </div>
    </template>
    <template #heros-bas>
      <p class="heros__resume">{{ section.resume }}</p>
    </template>

    <template #prochaine>
      <p class="rub-surtitre">Prochaine réunion</p>
      <div v-if="samedi" class="prochaine">
        <span class="rub-ticket" aria-hidden="true">
          <span>{{ nomJour(samedi.date).slice(0, 3) }}</span>
          <strong>{{ Number(samedi.date.slice(8)) }}</strong>
          <span>{{ formaterDateCourte(samedi.date).split(' ')[1] }}</span>
        </span>
        <div class="prochaine__texte">
          <span class="lecteur-seul">{{ formaterDate(samedi.date, true) }}</span>
          <span class="prochaine__quoi">
            {{ voitLeCalendrier && prochaine ? sansCode(prochaine.libelle) : 'Réunion au local' }}
          </span>
          <span class="prochaine__horaire mono">{{ horaire(samedi.horaire) }}</span>
          <span v-if="ensuite.length" class="prochaine__suite">
            puis {{ ensuite.map((j) => formaterDateCourte(j.date)).join(' et ') }}
          </span>
        </div>
      </div>
      <p v-else class="rub-texte">Plus de réunion prévue cette saison.</p>
      <a class="lien-fleche prochaine__lien" href="#l-agenda">
        {{ voitLeCalendrier ? 'Tout l’agenda' : 'Les dates de réunion' }}
        <UiIcone nom="chevrons-droite" :taille="14" />
      </a>
    </template>

    <template #rdv>
      <p class="rub-surtitre">Rendez-vous</p>
      <ul v-if="rendezVous.length" class="rdv">
        <li v-for="e in rendezVous" :key="e.slug">
          <NuxtLink :to="`/events/${e.slug}`" class="rdv__ligne">
            <UiIcone nom="calendrier" :taille="16" />
            <span class="rdv__titre">{{ e.titre }}</span>
            <span class="rdv__date mono">{{ formaterDateCourte(e.date) }}</span>
          </NuxtLink>
        </li>
      </ul>
      <p v-else class="rub-texte rdv__vide">
        Rien d’annoncé pour la section.
        <NuxtLink to="/events">Les events de l’unité</NuxtLink>
      </p>
    </template>

    <template #section>
      <p class="rub-surtitre">La section</p>
      <p class="rub-texte section__texte">{{ section.description }}</p>
      <ul class="tuiles">
        <li v-if="section.ages">
          <UiIcone nom="profil" :taille="20" />
          <b>{{ section.ages }}</b><span>les âges</span>
        </li>
        <li v-if="composition">
          <UiIcone nom="groupe" :taille="20" />
          <b>{{ composition }}</b><span>la section</span>
        </li>
        <li>
          <UiIcone nom="calendrier" :taille="20" />
          <b>Samedi</b><span>14h – 17h30</span>
        </li>
      </ul>
    </template>

    <template #staff>
      <p class="rub-surtitre">Le staff</p>
      <ul v-if="voitLeStaff && staff.length" class="equipe">
        <li v-for="c in staff.slice(0, 3)" :key="c.prenom + c.totem">
          <span class="equipe__pastille" aria-hidden="true">{{ initiales(c) }}</span>
          <span class="equipe__nom">{{ c.totem ?? c.prenom }}</span>
        </li>
      </ul>
      <p v-else class="rub-texte">
        {{ voitLeStaff ? 'Le staff de la saison n’est pas encore en ligne.' : 'Les noms du staff se voient une fois connecté.' }}
      </p>
      <a class="lien-fleche equipe__lien" href="#le-staff">
        {{ voitLeStaff && staff.length > 3 ? `+ ${staff.length - 3} · tout le staff` : 'Les cartes du staff' }}
        <UiIcone nom="chevrons-droite" :taille="14" />
      </a>
    </template>
  </BentoComposition>
</template>

<style lang="scss" scoped>
.heros {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: $esp-4;
  block-size: 100%;

  &__retour {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    inline-size: fit-content;
    padding: 0.45rem 0.9rem;
    border-radius: $r-pilule;
    background: rgba($noir-profond, 0.55);
    backdrop-filter: blur(6px);
    font-size: 0.85rem;
    @include focus-visible;
  }

  &__bas {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: $esp-2;
  }

  &__etiquette {
    padding: 0.3rem 0.8rem;
    border-radius: $r-pilule;
    border: 3px solid $noir-profond;
    background: var(--section-teinte);
    color: $noir-profond;
    font-size: 0.72rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  &__titre {
    margin: 0;
    font-family: $police-titre;
    font-weight: 900;
    font-variation-settings: 'wdth' 125;
    font-size: clamp(3.5rem, 9vw, 9rem);
    line-height: 0.88;
    letter-spacing: -0.02em;
    text-transform: uppercase;
    @include sur-photo;
  }

  &__liens {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    padding: 0.3rem;
    border-radius: $r-pilule;
    background: rgba($noir-profond, 0.6);
    backdrop-filter: blur(6px);

    a {
      padding: 0.5rem 0.9rem;
      border-radius: $r-pilule;
      font-size: 0.85rem;
      font-weight: 600;
      @include focus-visible;

      &:hover {
        background: rgba($blanc, 0.1);
      }
    }
  }

  &__resume {
    margin: auto 0 0;
    font-size: 0.9rem;
    line-height: 1.5;
    @include sur-photo;
  }
}

:deep(.zone__boite--bas) {
  justify-content: flex-end;
}

.prochaine {
  display: flex;
  gap: $esp-4;
  align-items: center;
  margin-block-start: $esp-3;

  &__texte {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  &__quoi {
    font-family: $police-titre;
    font-weight: 800;
    font-variation-settings: 'wdth' 112;
    font-size: 1.25rem;
    text-transform: uppercase;
  }

  &__horaire {
    font-size: 0.85rem;
  }

  &__suite {
    font-size: 0.8rem;
    color: rgba($blanc, 0.6);
  }

  &__lien {
    margin-block-start: auto;
    align-self: flex-end;
    min-block-size: 2rem;
    font-size: 0.9rem;
  }
}

.rdv {
  display: flex;
  flex-direction: column;
  gap: $esp-1;
  margin: $esp-2 0 0;
  padding: 0;
  list-style: none;

  &__ligne {
    display: flex;
    align-items: center;
    gap: $esp-2;
    padding: 0.55rem 0.9rem;
    border-radius: 0.9rem;
    background: $ardoise;
    color: var(--section-teinte);
    @include focus-visible;

    &:hover {
      background: $ardoise-clair;
    }
  }

  &__titre {
    flex: 1;
    min-inline-size: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: $blanc;
    font-size: 0.88rem;
    font-weight: 600;
  }

  &__date {
    font-size: 0.72rem;
    color: rgba($blanc, 0.6);
  }

  &__vide a {
    color: $cyan;
  }
}

.section__texte {
  margin-block: $esp-2 auto;
  max-inline-size: none;
  font-size: 0.86rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tuiles {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: $esp-2;
  margin: $esp-3 0 0;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    flex-direction: column;
    gap: 0.05rem;
    padding: 0.6rem 0.8rem;
    border-radius: 1rem;
    background: $ardoise;
    color: var(--section-teinte);
  }

  b {
    margin-block-start: 0.2rem;
    color: $blanc;
    font-size: 0.86rem;
  }

  span {
    font-size: 0.75rem;
    color: rgba($blanc, 0.6);
  }
}

.equipe {
  display: flex;
  flex-direction: column;
  gap: $esp-1;
  margin: $esp-2 0 0;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    align-items: center;
    gap: $esp-2;
  }

  &__pastille {
    display: grid;
    place-items: center;
    inline-size: 2rem;
    block-size: 2rem;
    border-radius: 50%;
    background: var(--section-teinte);
    color: $noir-profond;
    font-size: 0.72rem;
    font-weight: 700;
  }

  &__nom {
    font-size: 0.9rem;
    font-weight: 600;
  }

  &__lien {
    margin-block-start: auto;
    align-self: flex-end;
    min-block-size: 2rem;
    font-size: 0.9rem;
  }
}
</style>
