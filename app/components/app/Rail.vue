<script setup lang="ts">
import { sections } from '~/data/sections'

// La pilule de navigation des huit sections, reprise du composant « side » des
// maquettes (six positions à l'origine, huit ici pour inclure la Route et le
// staff d'unité).

const route = useRoute()
const actif = computed(() => route.path.match(/^\/sections\/([a-z-]+)/)?.[1] ?? null)
</script>

<template>
  <nav class="rail" aria-label="Sections de l’unité">
    <ul class="rail__liste">
      <li v-for="s in sections" :key="s.slug" class="rail__element">
        <NuxtLink
          class="rail__lien"
          :class="{ 'rail__lien--actif': actif === s.slug }"
          :to="`/sections/${s.slug}`"
          :data-section="s.slug"
          :aria-current="actif === s.slug ? 'page' : undefined"
        >
          <UiIcone :nom="s.icone" :taille="22" class="rail__icone" />
          <span class="rail__nom">{{ s.nom }}</span>
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<style lang="scss" scoped>
.rail {
  display: flex;

  &__liste {
    display: flex;
    gap: 0.25rem;
    margin: 0;
    padding: 0.4rem;
    background: rgba($noir, 0.82);
    backdrop-filter: blur(18px) saturate(1.4);
    border: 1px solid rgba($blanc, 0.06);
    border-radius: $r-pilule;
    overflow-x: auto;
    scrollbar-width: none;
    max-inline-size: 100%;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  &__lien {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.15rem;
    inline-size: 4.4rem;
    padding: 0.5rem 0.25rem 0.45rem;
    border-radius: $r-pilule;
    color: rgba($blanc, 0.66);
    transition:
      color $vite $courbe,
      background $vite $courbe;

    @include focus-visible;

    &:hover {
      color: $blanc;
      background: rgba($blanc, 0.06);
    }

    &--actif {
      color: var(--section-teinte);
      background: rgba($blanc, 0.07);
    }
  }

  &__icone {
    transition: transform $normal $courbe;

    .rail__lien:hover & {
      transform: translateY(-2px);
    }
  }

  &__nom {
    font-size: 0.6875rem;
    font-weight: 500;
    letter-spacing: 0.01em;
    white-space: nowrap;
  }
}
</style>
