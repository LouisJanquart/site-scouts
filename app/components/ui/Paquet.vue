<script setup lang="ts">
import { NuxtLink } from '#components'
// Un paquet de cartes : la carte du dessus en entier, et sous elle, les
// suivantes qui dépassent en languettes, de plus en plus étroites. On voit
// d'un coup d'œil qu'il y a une suite, et ce qu'elle contient.
defineProps<{
  /** Les cartes du dessous, du plus proche au plus lointain (trois au plus). */
  dessous?: { titre: string; detail?: string; to?: string }[]
}>()
</script>

<template>
  <div class="paquet">
    <div class="paquet__dessus">
      <slot />
    </div>
    <template v-for="(c, i) in (dessous ?? []).slice(0, 3)" :key="i">
      <component
        :is="c.to ? NuxtLink : 'div'"
        :to="c.to"
        class="paquet__languette"
        :style="{ '--rang': i + 1 }"
      >
        <span class="paquet__titre">{{ c.titre }}</span>
        <span v-if="c.detail" class="paquet__detail mono">{{ c.detail }}</span>
      </component>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.paquet {
  display: flex;
  flex-direction: column;

  &__dessus {
    position: relative;
    z-index: 4;
    border-radius: $r-carte;
    box-shadow: 0 16px 32px -16px rgba(#000, 0.9);
  }

  // Chaque languette passe sous la précédente (marge négative) et rentre d'un
  // cran de chaque côté : c'est ce retrait qui dessine l'épaisseur du paquet.
  &__languette {
    position: relative;
    z-index: calc(4 - var(--rang));
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: $esp-2;
    margin-block-start: -1rem;
    margin-inline: calc(var(--rang) * 0.75rem);
    padding: 1.6rem 1.1rem 0.75rem;
    background: color-mix(in srgb, $ardoise-sourd calc(100% - var(--rang) * 20%), $noir);
    border-radius: 0 0 $r-tuile $r-tuile;
    font-size: 0.875rem;
    color: rgba($blanc, 0.8);
  }

  a.paquet__languette {
    @include focus-visible;
    @media (hover: hover) {
      &:hover {
        color: $blanc;
      }
    }
  }

  &__titre {
    min-inline-size: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__detail {
    flex: none;
    font-size: 0.75rem;
    color: rgba($blanc, 0.6);
  }
}
</style>
