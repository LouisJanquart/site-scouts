<script setup lang="ts">
// La rubrique ressources : les documents à imprimer, signer ou emporter, et
// l'uniforme de la section, dessiné avec des repères numérotés.
import type { CompositionSpec } from '~/utils/bento'
import type { Section } from '~/data/sections'
import { uniformeDe } from '~/data/uniformes'

const props = defineProps<{ section: Section; numero: string }>()

const { documents, contenu } = useContenu()
const categories = computed(() => contenu.value.categoriesDocuments ?? [])
const filtre = ref<string | null>(null)
const affiches = computed(() =>
  documents.value.filter((d: any) => !filtre.value || d.categorie === filtre.value),
)
const presentes = computed(() =>
  categories.value.filter((c) => documents.value.some((d: any) => d.categorie === c.cle)),
)
const uniforme = computed(() => uniformeDe(props.section.slug))

function format(d: any) {
  if (!d.disponible) return 'Bientôt'
  return d.format === 'lien' ? 'Lien' : String(d.format).toUpperCase()
}

const spec: CompositionSpec = {
  lignes: {
    v: [[0.524, 0], [0.549, 1]],
    h: [[0, 0.33], [0.54, 0.305]],
  },
  zones: {
    intro: { coins: [['gauche', 0, 'haut', 0], ['v', -1, 'haut', 0], ['v', -1, 'h', -1], ['gauche', 0, 'h', -1]] },
    uniforme: { coins: [['gauche', 0, 'h', 1], ['v', -1, 'h', 1], ['v', -1, 'bas', 0], ['gauche', 0, 'bas', 0]] },
    documents: { coins: [['v', 1, 'haut', 0], ['droite', 0, 'haut', 0], ['droite', 0, 'bas', 0], ['v', 1, 'bas', 0]] },
  },
}
</script>

<template>
  <BentoComposition :spec="spec" :marge="[26, 36]">
    <template #intro>
      <p class="rub-surtitre">Rubrique {{ numero }} · les ressources</p>
      <h2 class="rub-titre">Ressources</h2>
      <p class="rub-texte intro__texte">
        Tout ce qu’il faut imprimer, signer ou emporter, tenu à jour par le staff.
      </p>
    </template>

    <template #uniforme>
      <p class="rub-surtitre">L’uniforme des {{ section.nom }}</p>
      <div class="uniforme">
        <svg class="uniforme__dessin" viewBox="0 0 300 300" role="img" :aria-label="`L’uniforme des ${section.nom}`">
          <rect width="300" height="300" rx="24" class="uniforme__fond" />
          <path class="uniforme__pull" d="M116 58 L184 58 L250 92 L232 162 L206 152 L206 268 L94 268 L94 152 L68 162 L50 92 Z" />
          <path class="uniforme__foulard" d="M112 58 L188 58 L150 150 Z" />
          <ellipse class="uniforme__bague" cx="150" cy="98" rx="10" ry="8" />
          <circle class="uniforme__insigne" cx="84" cy="122" r="14" />
          <g class="uniforme__reperes">
            <g transform="translate(196 88)"><circle r="13" /><text dy="4.5">1</text></g>
            <g transform="translate(232 214)"><circle r="13" /><text dy="4.5">2</text></g>
            <g transform="translate(56 150)"><circle r="13" /><text dy="4.5">3</text></g>
          </g>
        </svg>
        <ol class="uniforme__liste">
          <li v-for="(p, i) in uniforme.pieces" :key="p.nom">
            <span class="uniforme__num mono" aria-hidden="true">{{ i + 1 }}</span>
            <span><b>{{ p.nom }}</b><span>{{ p.detail }}</span></span>
          </li>
          <li class="uniforme__reste">
            <span class="uniforme__num uniforme__num--vide" aria-hidden="true" />
            <span><b>Pour le reste</b><span>{{ uniforme.reste }}</span></span>
          </li>
        </ol>
      </div>
    </template>

    <template #documents>
      <div class="docs">
        <p class="rub-surtitre">{{ documents.length }} document{{ documents.length > 1 ? 's' : '' }}</p>
        <div v-if="presentes.length > 1" class="docs__filtres" role="group" aria-label="Filtrer les documents">
          <button type="button" :aria-pressed="filtre === null" @click="filtre = null">Tous</button>
          <button
            v-for="c in presentes"
            :key="c.cle"
            type="button"
            :aria-pressed="filtre === c.cle"
            @click="filtre = c.cle"
          >
            {{ c.nom }}
          </button>
        </div>
        <ul class="docs__grille">
          <li v-for="d in affiches" :key="d.titre">
            <component
              :is="d.disponible && d.url ? 'a' : 'div'"
              class="doc"
              :class="{ 'doc--bientot': !d.disponible }"
              v-bind="d.disponible && d.url ? { href: d.url, target: '_blank', rel: 'noopener' } : {}"
            >
              <span class="doc__icone"><UiIcone nom="document" :taille="18" /></span>
              <span class="doc__texte">
                <span class="doc__titre">{{ d.titre }}</span>
                <span class="doc__format mono">{{ format(d) }}</span>
              </span>
            </component>
          </li>
        </ul>
        <NuxtLink class="lien-fleche docs__tout" to="/documents">
          Tous les documents de l’unité <UiIcone nom="chevrons-droite" :taille="14" />
        </NuxtLink>
      </div>
    </template>
  </BentoComposition>
</template>

<style lang="scss" scoped>
.intro__texte {
  margin-block-start: $esp-3;
  max-inline-size: none;
}

.uniforme {
  display: flex;
  gap: $esp-5;
  align-items: center;
  flex: 1;
  min-block-size: 0;
  margin-block-start: $esp-3;

  &__dessin {
    flex: 0 1 auto;
    block-size: 100%;
    max-block-size: 16rem;
    aspect-ratio: 1;
    max-inline-size: 45%;
  }

  &__fond {
    fill: $ardoise-sourd;
  }
  &__pull {
    fill: $ardoise-clair;
  }
  &__foulard {
    fill: var(--section-teinte);
    stroke: rgba(#fff, 0.8);
    stroke-width: 3;
  }
  &__bague {
    fill: none;
    stroke: #f0a32e;
    stroke-width: 4;
  }
  &__insigne {
    fill: var(--section-teinte);
    stroke: #fff;
    stroke-width: 2;
  }
  &__reperes {
    circle {
      fill: #fff;
    }
    text {
      font-family: $police-mono;
      font-size: 13px;
      font-weight: 500;
      text-anchor: middle;
      fill: $noir-profond;
    }
  }

  &__liste {
    display: flex;
    flex-direction: column;
    gap: $esp-3;
    margin: 0;
    padding: 0;
    list-style: none;
    font-size: 0.82rem;

    li {
      display: flex;
      gap: $esp-2;
    }

    b {
      display: block;
      font-size: 0.92rem;
    }

    span span {
      color: rgba($blanc, 0.64);
    }
  }

  &__num {
    flex: none;
    display: grid;
    place-items: center;
    inline-size: 1.5rem;
    block-size: 1.5rem;
    border-radius: 50%;
    background: var(--section-teinte);
    color: $noir-profond;
    font-size: 0.72rem;

    &--vide {
      background: none;
    }
  }
}

.docs {
  display: flex;
  flex-direction: column;
  gap: $esp-3;
  block-size: 100%;

  &__filtres {
    display: flex;
    flex-wrap: wrap;
    gap: $esp-1;

    button {
      padding: 0.45rem 0.9rem;
      border: 0;
      border-radius: $r-pilule;
      background: $ardoise;
      color: $blanc;
      font: inherit;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      @include focus-visible;

      &[aria-pressed='true'] {
        background: $blanc;
        color: $noir-profond;
      }
    }
  }

  // Si la place manque en hauteur, la liste continue en colonnes vers la
  // droite et défile de côté, comme les autres rubriques.
  &__grille {
    flex: 1 1 auto;
    min-block-size: 0;
    margin: 0;
    padding: 0 0 0.5rem;
    list-style: none;
    columns: 15rem;
    column-gap: $esp-2;
    column-fill: auto;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: thin;
    scrollbar-color: rgba($blanc, 0.16) transparent;

    li {
      break-inside: avoid;
      margin-block-end: $esp-2;
    }
  }

  &__tout {
    font-size: 0.9rem;
  }
}

.doc {
  display: flex;
  align-items: center;
  gap: $esp-2;
  padding: 0.8rem;
  border-radius: 1rem;
  background: $ardoise;
  @include focus-visible;

  &__icone {
    display: grid;
    place-items: center;
    inline-size: 2.4rem;
    block-size: 2.4rem;
    border-radius: 0.75rem;
    background: $ardoise-sourd;
    color: var(--section-teinte);
  }

  &__texte {
    display: flex;
    flex-direction: column;
    min-inline-size: 0;
  }

  &__titre {
    font-size: 0.88rem;
    font-weight: 600;
  }

  &__format {
    font-size: 0.66rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba($blanc, 0.6);
  }

  &--bientot {
    opacity: 0.7;
  }

  &:is(a):hover {
    background: $ardoise-clair;
  }
}
</style>
