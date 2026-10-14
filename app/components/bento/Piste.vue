<script setup lang="ts">
// Une piste qui défile à l'horizontale : quand une rubrique manque de place
// en hauteur, on ne la tasse pas, on la fait défiler de côté.
//
// Deux flèches, un compteur facultatif et un rail qui montre où l'on est.
// La piste déborde jusqu'au bord de sa zone, et un fondu dit qu'il y a une
// suite.
const props = withDefaults(
  defineProps<{
    titre?: string
    /** Le nombre d'éléments, pour le compteur « 02 / 07 ». */
    total?: number
    /** L'espace vertical réservé autour des éléments (cartes qui flottent). */
    respiration?: string
    etiquetteListe?: string
  }>(),
  { respiration: '0.5rem' },
)

const voie = ref<HTMLElement | null>(null)
const debut = ref(true)
const fin = ref(false)
const position = ref(0)
const largeurPouce = ref(100)
const index = ref(0)

function pas() {
  const el = voie.value
  const premier = el?.firstElementChild as HTMLElement | null
  if (!el || !premier) return 300
  const gap = parseFloat(getComputedStyle(el).columnGap) || 0
  return premier.offsetWidth + gap
}

function maj() {
  const el = voie.value
  if (!el) return
  const max = el.scrollWidth - el.clientWidth
  debut.value = el.scrollLeft <= 2
  fin.value = el.scrollLeft >= max - 2
  largeurPouce.value = el.scrollWidth > 0 ? Math.min(100, (el.clientWidth / el.scrollWidth) * 100) : 100
  position.value = max > 0 ? (el.scrollLeft / max) * (100 - largeurPouce.value) : 0
  index.value = Math.round(el.scrollLeft / pas())
}

function aller(sens: 1 | -1) {
  voie.value?.scrollBy({ left: sens * pas(), behavior: 'smooth' })
}

const compteur = computed(() => {
  if (!props.total) return ''
  const z = (n: number) => String(n).padStart(2, '0')
  return `${z(Math.min(props.total, index.value + 1))} / ${z(props.total)}`
})

let ro: ResizeObserver | null = null
onMounted(() => {
  maj()
  ro = new ResizeObserver(maj)
  if (voie.value) ro.observe(voie.value)
})
onBeforeUnmount(() => ro?.disconnect())
</script>

<template>
  <div class="piste">
    <div class="piste__tete">
      <p v-if="titre" class="surtitre piste__titre">{{ titre }}</p>
      <slot name="tete" />
      <div class="piste__nav">
        <span v-if="compteur" class="piste__compteur mono" aria-hidden="true">{{ compteur }}</span>
        <button
          type="button"
          class="piste__fleche"
          :disabled="debut"
          aria-label="Précédent"
          @click="aller(-1)"
        >
          <UiIcone nom="chevrons-gauche" :taille="18" />
        </button>
        <button
          type="button"
          class="piste__fleche piste__fleche--suite"
          :disabled="fin"
          aria-label="Suivant"
          @click="aller(1)"
        >
          <UiIcone nom="chevrons-droite" :taille="18" />
        </button>
      </div>
    </div>

    <div class="piste__cadre" :class="{ 'piste__cadre--fin': fin }">
      <ul
        ref="voie"
        class="piste__voie"
        :style="{ '--respiration': respiration }"
        :aria-label="etiquetteListe ?? titre"
        tabindex="0"
        @scroll.passive="maj"
      >
        <slot />
      </ul>
    </div>

    <div class="piste__rail" aria-hidden="true">
      <i :style="{ inlineSize: `${largeurPouce}%`, insetInlineStart: `${position}%` }" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.piste {
  display: flex;
  flex-direction: column;
  gap: $esp-3;
  min-block-size: 0;
  flex: 1 1 auto;

  &__tete {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $esp-3;
  }

  &__titre {
    margin: 0;
  }

  &__nav {
    display: flex;
    align-items: center;
    gap: $esp-2;
    margin-inline-start: auto;
  }

  &__compteur {
    font-size: 0.8rem;
    font-variant-numeric: tabular-nums;
    margin-inline-end: $esp-1;
  }

  &__fleche {
    display: grid;
    place-items: center;
    inline-size: 2.75rem;
    block-size: 2.75rem;
    border: 0;
    border-radius: 50%;
    background: $ardoise;
    color: $blanc;
    cursor: pointer;
    transition: background $vite $courbe, opacity $vite $courbe;

    @include focus-visible;

    &--suite {
      background: $ardoise-clair;
    }

    &:disabled {
      opacity: 0.35;
      cursor: default;
    }
  }

  // Le cadre déborde jusqu'au bord droit de la zone : la piste se coupe sur
  // le bord, pas avant.
  &__cadre {
    position: relative;
    flex: 1 1 auto;
    min-block-size: 0;
    margin-inline-end: calc(-1 * var(--marge-droite, 2.25rem));

    &::after {
      content: '';
      position: absolute;
      inset-block: 0;
      inset-inline-end: 0;
      inline-size: 5rem;
      background: linear-gradient(90deg, rgba($noir, 0), $noir);
      pointer-events: none;
      transition: opacity $vite $courbe;
    }

    &--fin::after {
      opacity: 0;
    }
  }

  &__voie {
    display: flex;
    gap: $esp-4;
    block-size: 100%;
    margin: 0;
    padding: var(--respiration) 5rem var(--respiration) 0.25rem;
    list-style: none;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
    align-items: center;

    &::-webkit-scrollbar {
      display: none;
    }

    &:focus-visible {
      outline: 2px solid $cyan;
      outline-offset: 4px;
      border-radius: $r-tuile;
    }

    > :deep(*) {
      flex: 0 0 auto;
      scroll-snap-align: start;
    }
  }

  &__rail {
    position: relative;
    block-size: 4px;
    border-radius: 2px;
    background: $ardoise;

    i {
      position: absolute;
      inset-block: 0;
      border-radius: 2px;
      background: var(--section-teinte, $cyan);
      transition: inset-inline-start 120ms linear;
    }
  }
}
</style>
