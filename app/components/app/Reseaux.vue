<script setup lang="ts">
import { reseaux } from '~/data/unite'

// Les quatre icônes de la maquette. Les URL ne sont pas connues : tant qu'elles
// ne sont pas renseignées, les icônes restent inertes et signalées comme telles
// plutôt que de pointer vers le vide.
</script>

<template>
  <ul class="reseaux">
    <li v-for="r in reseaux" :key="r.nom">
      <a
        v-if="r.url"
        class="reseaux__lien"
        :href="r.url"
        target="_blank"
        rel="noopener noreferrer"
        :aria-label="r.nom"
      >
        <UiIcone :nom="r.icone" :taille="18" plein />
      </a>
      <span v-else class="reseaux__lien reseaux__lien--inactif" :title="`${r.nom} — adresse à renseigner`">
        <UiIcone :nom="r.icone" :taille="18" plein />
      </span>
    </li>
  </ul>
</template>

<style lang="scss" scoped>
.reseaux {
  display: flex;
  gap: 0.25rem;
  margin: 0;

  &__lien {
    display: grid;
    place-items: center;
    inline-size: 2.1rem;
    block-size: 2.1rem;
    border-radius: 50%;
    color: rgba($blanc, 0.66);
    transition:
      color $vite $courbe,
      background $vite $courbe;

    @include focus-visible;

    &:hover {
      color: $blanc;
      background: rgba($blanc, 0.08);
    }

    &--inactif {
      color: rgba($blanc, 0.18);
      cursor: not-allowed;

      &:hover {
        color: rgba($blanc, 0.18);
        background: none;
      }
    }
  }
}
</style>
