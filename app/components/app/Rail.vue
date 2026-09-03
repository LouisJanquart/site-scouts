<script setup lang="ts">
import { sections } from '~/data/sections'

// La pilule de navigation, reprise du composant « side » des maquettes (six
// positions à l'origine, huit ici pour inclure la Route et le staff d'unité).
//
// Elle commence par le retour à l'accueil : c'est le seul élément présent sur
// toutes les pages, donc le seul endroit où ce bouton est toujours au même
// endroit.

const route = useRoute()
const actif = computed(() => route.path.match(/^\/sections\/([a-z-]+)/)?.[1] ?? null)
const surAccueil = computed(() => route.path === '/')
</script>

<template>
  <nav class="rail" aria-label="Navigation de l’unité">
    <ul class="rail__liste">
      <li class="rail__element rail__element--accueil">
        <NuxtLink
          class="rail__lien rail__lien--accueil"
          :class="{ 'rail__lien--actif': surAccueil }"
          to="/"
          :aria-current="surAccueil ? 'page' : undefined"
        >
          <UiIcone nom="lys" :taille="22" class="rail__icone" />
          <span class="rail__nom">Accueil</span>
        </NuxtLink>
      </li>

      <li class="rail__separateur" aria-hidden="true"></li>

      <li v-for="s in sections" :key="s.slug" class="rail__element">
        <NuxtLink
          class="rail__lien"
          :class="{ 'rail__lien--actif': actif === s.slug }"
          :to="`/sections/${s.slug}`"
          :data-section="s.slug"
          :aria-current="actif === s.slug ? 'page' : undefined"
        >
          <UiIcone :nom="s.icone" :taille="22" class="rail__icone" />
          <span class="rail__nom">{{ s.nomCourt ?? s.nom }}</span>
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
    align-items: center;
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

  &__separateur {
    flex: 0 0 auto;
    inline-size: 1px;
    block-size: 2rem;
    background: rgba($blanc, 0.12);
    margin-inline: 0.2rem;
  }

  &__lien {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.15rem;
    inline-size: 4.1rem;
    padding: 0.5rem 0.25rem 0.45rem;
    border-radius: $r-pilule;
    color: rgba($blanc, 0.62);
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

    // Le retour à l'accueil porte la couleur de l'unité, pas celle de la
    // section consultée : il doit se distinguer du reste du rail.
    &--accueil {
      color: $rouge-texte;

      &:hover {
        color: $blanc;
      }

      &.rail__lien--actif {
        color: $rouge-texte;
        background: rgba($rouge, 0.14);
      }
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
