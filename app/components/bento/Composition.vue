<script setup lang="ts">
// Une composition bento à lignes obliques (voir app/utils/bento.ts).
//
// Sur grand écran, chaque zone est un polygone dessiné en SVG, et son contenu
// est posé dans le plus grand rectangle droit qui tient dedans : rien ne
// déborde d'une zone déformée. Sur téléphone et tablette, les obliques n'ont
// plus de sens : les zones redeviennent des blocs arrondis empilés, dans
// l'ordre où elles sont déclarées.
//
// Chaque zone a un emplacement nommé comme elle (« intro », « cartes »…).
// Une zone en L déclare plusieurs boîtes : leurs emplacements s'appellent
// « zone-boite » (« heros-haut », « heros-bas »).
import type { CompositionSpec, ZoneCalculee } from '~/utils/bento'

const props = defineProps<{
  spec: CompositionSpec
  /** Le fond de chaque zone. Par défaut, la couleur des panneaux. */
  fonds?: Record<string, { image?: string; voile?: 'bas' | 'gauche' | 'leger' }>
  /** La marge intérieure des boîtes, en pixels : [vertical, horizontal]. */
  marge?: [number, number]
}>()

const racine = ref<HTMLElement | null>(null)
const oblique = ref(false)
const taille = reactive({ l: 0, h: 0 })
const uid = useId()

const zones = computed<ZoneCalculee[]>(() =>
  oblique.value && taille.l > 0 && taille.h > 0 ? calculerComposition(props.spec, taille.l, taille.h) : [],
)

// L'ordre des zones et de leurs boîtes, valable dans les deux modes.
const plan = computed(() =>
  Object.entries(props.spec.zones).map(([nom, z]) => ({
    nom,
    boites: Object.keys(z.boites ?? { contenu: true }),
  })),
)

function slotDe(zone: string, boite: string) {
  return boite === 'contenu' ? zone : `${zone}-${boite}`
}

function calcul(nom: string) {
  return zones.value.find((z) => z.nom === nom)
}

const [mv, mh] = props.marge ?? [32, 36]

function styleZone(nom: string) {
  const z = calcul(nom)
  if (!z) return undefined
  return {
    left: `${z.boite.x}px`,
    top: `${z.boite.y}px`,
    width: `${z.boite.l}px`,
    height: `${z.boite.h}px`,
  }
}

function styleBoite(nom: string, boite: string) {
  const r = calcul(nom)?.boites[boite]
  if (!r) return undefined
  return {
    left: `${r.x}px`,
    top: `${r.y}px`,
    width: `${r.l}px`,
    height: `${r.h}px`,
    padding: `${mv}px ${mh}px`,
  }
}

function fondDe(nom: string) {
  return props.fonds?.[nom] ?? {}
}

let ro: ResizeObserver | null = null
let mq: MediaQueryList | null = null
const suivreMedia = () => {
  oblique.value = !!mq?.matches
}

onMounted(() => {
  mq = window.matchMedia('(min-width: 75rem) and (min-height: 44rem)')
  suivreMedia()
  mq.addEventListener('change', suivreMedia)
  ro = new ResizeObserver(([e]) => {
    if (!e) return
    taille.l = e.contentRect.width
    taille.h = e.contentRect.height
  })
  if (racine.value) ro.observe(racine.value)
})
onBeforeUnmount(() => {
  ro?.disconnect()
  mq?.removeEventListener('change', suivreMedia)
})
</script>

<template>
  <div ref="racine" class="compo" :class="{ 'compo--oblique': oblique && zones.length }">
    <div
      v-for="z in plan"
      :key="z.nom"
      class="zone"
      :class="[`zone--${z.nom}`, { 'zone--photo': fondDe(z.nom).image }]"
      :style="oblique ? styleZone(z.nom) : fondDe(z.nom).image ? { '--photo': `url(${fondDe(z.nom).image})` } : undefined"
    >
      <svg
        v-if="oblique && calcul(z.nom)"
        class="zone__fond"
        :viewBox="`0 0 ${calcul(z.nom)!.boite.l} ${calcul(z.nom)!.boite.h}`"
        aria-hidden="true"
      >
        <template v-if="fondDe(z.nom).image">
          <defs>
            <clipPath :id="`${uid}-${z.nom}`"><path :d="calcul(z.nom)!.chemin" /></clipPath>
            <linearGradient
              :id="`${uid}-${z.nom}-voile`"
              :x1="fondDe(z.nom).voile === 'gauche' ? 0 : 0"
              :y1="fondDe(z.nom).voile === 'gauche' ? 0 : 0"
              :x2="fondDe(z.nom).voile === 'gauche' ? 1 : 0"
              :y2="fondDe(z.nom).voile === 'gauche' ? 0 : 1"
            >
              <template v-if="fondDe(z.nom).voile === 'gauche'">
                <stop offset="0" stop-color="#08090f" stop-opacity="0.9" />
                <stop offset="0.55" stop-color="#08090f" stop-opacity="0.5" />
                <stop offset="1" stop-color="#08090f" stop-opacity="0.1" />
              </template>
              <template v-else-if="fondDe(z.nom).voile === 'leger'">
                <stop offset="0" stop-color="#08090f" stop-opacity="0.15" />
                <stop offset="1" stop-color="#08090f" stop-opacity="0.45" />
              </template>
              <template v-else>
                <stop offset="0" stop-color="#08090f" stop-opacity="0.1" />
                <stop offset="0.45" stop-color="#08090f" stop-opacity="0.35" />
                <stop offset="1" stop-color="#08090f" stop-opacity="0.9" />
              </template>
            </linearGradient>
          </defs>
          <image
            :href="fondDe(z.nom).image"
            x="0"
            y="0"
            :width="calcul(z.nom)!.boite.l"
            :height="calcul(z.nom)!.boite.h"
            preserveAspectRatio="xMidYMid slice"
            :clip-path="`url(#${uid}-${z.nom})`"
          />
          <path :d="calcul(z.nom)!.chemin" :fill="`url(#${uid}-${z.nom}-voile)`" />
        </template>
        <path v-else :d="calcul(z.nom)!.chemin" class="zone__aplat" />
      </svg>

      <div
        v-for="b in z.boites"
        :key="b"
        class="zone__boite"
        :class="`zone__boite--${b}`"
        :style="oblique ? styleBoite(z.nom, b) : undefined"
      >
        <slot :name="slotDe(z.nom, b)" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.compo {
  display: flex;
  flex-direction: column;
  gap: $gouttiere;

  // Sur grand écran, le temps de mesurer, on ne montre pas la pile.
  @include console {
    position: relative;
    display: block;
    block-size: 100%;
    visibility: hidden;
  }

  &--oblique {
    visibility: visible;
  }
}

.zone {
  position: relative;
  border-radius: 2.25rem;
  background: $noir;
  overflow: hidden;

  &--photo {
    background:
      linear-gradient(180deg, rgba($noir-profond, 0.15), rgba($noir-profond, 0.85)),
      var(--photo) center / cover;
    min-block-size: 20rem;
  }

  .compo--oblique & {
    position: absolute;
    border-radius: 0;
    background: none;
    overflow: visible;
    min-block-size: 0;
  }

  &__fond {
    position: absolute;
    inset: 0;
    inline-size: 100%;
    block-size: 100%;
    overflow: visible;
  }

  &__aplat {
    fill: $noir;
  }

  &__boite {
    position: relative;
    padding: $esp-4 $esp-4;

    @include depuis($bp-poche) {
      padding: $esp-5;
    }

    .compo--oblique & {
      position: absolute;
      display: flex;
      flex-direction: column;
      min-block-size: 0;
    }
  }
}
</style>
