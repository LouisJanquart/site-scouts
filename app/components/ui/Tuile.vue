<script setup lang="ts">
import { NuxtLink } from '#components'
// Une tuile d'inventaire : une icône, un libellé, parfois une pastille sur le
// coin. Carrée si on le lui demande, sinon à la hauteur de son contenu.
//
// La pastille déborde du coin, c'est voulu : elle sort de la tuile comme une
// note collée dessus. Le puits garde assez de marge pour qu'elle ne soit pas
// rognée.
withDefaults(
  defineProps<{
    libelle: string
    icone?: string
    sous?: string
    pastille?: string
    actif?: boolean
    carre?: boolean
    to?: string
  }>(),
  { actif: false, carre: false },
)
</script>

<template>
  <component
    :is="to ? NuxtLink : 'div'"
    :to="to"
    class="tuile"
    :class="{ 'tuile--actif': actif, 'tuile--carre': carre, 'tuile--lien': to }"
  >
    <span v-if="pastille" class="tuile__pastille">{{ pastille }}</span>
    <UiIcone v-if="icone" :nom="icone" :taille="32" class="tuile__icone" />
    <span class="tuile__libelle">{{ libelle }}</span>
    <span v-if="sous" class="tuile__sous">{{ sous }}</span>
  </component>
</template>

<style lang="scss" scoped>
.tuile {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $esp-1;
  min-inline-size: 0;
  padding: $esp-3 $esp-2;
  background: $ardoise;
  border-radius: $r-tuile;
  text-align: center;
  color: $blanc;

  &--carre {
    aspect-ratio: 1;
  }

  &--actif {
    box-shadow: inset 0 0 0 2px var(--section-teinte, #{$cyan});
  }

  &--lien {
    transition: background $vite $courbe;
    @include focus-visible;

    @media (hover: hover) {
      &:hover {
        background: $ardoise-clair;
      }
    }
  }

  &__icone {
    color: var(--section-teinte, #{$cyan});
  }

  &__libelle {
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1.3;
  }

  &__sous {
    font-size: 0.75rem;
    color: rgba($blanc, 0.64);
  }

  &__pastille {
    position: absolute;
    inset-block-start: -0.6rem;
    inset-inline-end: -0.4rem;
    padding: 0.15rem 0.55rem;
    background: var(--section-teinte, #{$cyan});
    color: $noir;
    border: 4px solid $ardoise-sourd;
    border-radius: $r-pilule;
    font-family: $police-mono;
    font-size: 0.7rem;
    font-weight: 500;
    white-space: nowrap;
  }
}
</style>
