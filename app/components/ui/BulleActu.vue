<script setup lang="ts">
// Une actu en bulle, signée en dessous par qui parle : le staff d'une
// section, ou celui de l'unité. La queue de la bulle pointe vers la
// signature : on lit une annonce de quelqu'un, pas un article anonyme.
import { parSlug } from '~/data/sections'

const props = defineProps<{
  a: { slug: string; titre: string; date: string; chapo?: string; sections?: string[] }
}>()

const signataire = computed(() => {
  const s = props.a.sections ?? []
  if (s.length === 1) return { nom: `Staff ${parSlug[s[0]!]?.nom ?? s[0]}`, section: s[0] }
  return { nom: 'Staff d’unité', section: null }
})
</script>

<template>
  <article class="bulle-actu" :data-section="signataire.section ?? undefined">
    <NuxtLink class="bulle-actu__bulle" :to="`/actus/${a.slug}`">
      <span class="bulle-actu__date mono">{{ formaterDate(a.date) }}</span>
      <h3 class="bulle-actu__titre">{{ a.titre }}</h3>
      <p v-if="a.chapo" class="bulle-actu__chapo">{{ a.chapo }}</p>
    </NuxtLink>
    <p class="bulle-actu__signature">
      <span class="bulle-actu__avatar" aria-hidden="true">
        <UiIcone :nom="signataire.section ? parSlug[signataire.section]?.icone ?? 'lys' : 'lys'" :taille="16" />
      </span>
      {{ signataire.nom }}
    </p>
  </article>
</template>

<style lang="scss" scoped>
.bulle-actu {
  display: flex;
  flex-direction: column;
  gap: $esp-2;
  block-size: 100%;

  &__bulle {
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    padding: $esp-3 $esp-4;
    background: $ardoise;
    border-radius: $r-carte $r-carte $r-carte 0.5rem;
    color: $blanc;
    transition: background $vite $courbe;

    @include focus-visible;

    @media (hover: hover) {
      &:hover {
        background: $ardoise-clair;
      }
    }

    // La queue de la bulle, en bas à gauche, au-dessus de la signature.
    &::after {
      content: '';
      position: absolute;
      inset-inline-start: 0;
      inset-block-end: -0.8rem;
      inline-size: 1.4rem;
      block-size: 0.85rem;
      background: inherit;
      clip-path: polygon(0 0, 100% 0, 0 100%);
    }
  }

  &__date {
    font-size: 0.75rem;
    color: rgba($blanc, 0.6);
  }

  &__titre {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 600;
    line-height: 1.35;
    text-wrap: balance;
  }

  &__chapo {
    font-size: 0.95rem;
    line-height: 1.55;
    color: rgba($blanc, 0.72);
  }

  &__signature {
    display: flex;
    align-items: center;
    gap: $esp-1;
    margin: 0 0 0 0.15rem;
    padding-block-start: 0.25rem;
    font-size: 0.85rem;
    color: rgba($blanc, 0.65);
  }

  &__avatar {
    display: grid;
    place-items: center;
    inline-size: 2rem;
    block-size: 2rem;
    border-radius: 50%;
    background: var(--section-teinte, #{$rouge-plein});
    color: $noir;
  }
}

// Sans section, la pastille porte le rouge de l'unité, avec une icône blanche.
.bulle-actu:not([data-section]) .bulle-actu__avatar {
  background: $rouge-plein;
  color: $blanc;
}
</style>
