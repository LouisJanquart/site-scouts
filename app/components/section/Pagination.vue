<script setup lang="ts">
// La pagination des rubriques, fixée au bord droit de l'écran. Un trait par
// rubrique, celui de la rubrique affichée est plus long et prend la couleur de
// la section. Au survol, une bulle donne le nom ; au clic, on y va.
defineProps<{
  rubriques: { id: string; nom: string }[]
  active: string
}>()
const emit = defineEmits<{ aller: [id: string] }>()
</script>

<template>
  <nav class="pagination" aria-label="Les rubriques de la page">
    <ol>
      <li v-for="(r, i) in rubriques" :key="r.id">
        <a
          :href="`#${r.id}`"
          class="pagination__lien"
          :class="{ 'pagination__lien--active': r.id === active }"
          :aria-current="r.id === active ? 'true' : undefined"
          @click.prevent="emit('aller', r.id)"
        >
          <span class="pagination__bulle">
            <span v-if="i > 0" class="pagination__num mono">{{ String(i).padStart(2, '0') }}</span>
            {{ r.nom }}
          </span>
          <span class="pagination__trait" aria-hidden="true" />
        </a>
      </li>
    </ol>
  </nav>
</template>

<style lang="scss" scoped>
.pagination {
  display: none;

  @include console {
    display: block;
    position: fixed;
    inset-block-start: 50%;
    inset-inline-end: calc((#{$marge-console} - 1.75rem) / 2);
    transform: translateY(-50%);
    z-index: 30;
  }

  ol {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__lien {
    position: relative;
    display: grid;
    place-items: center;
    inline-size: 1.75rem;
    min-block-size: 2.25rem;
    border-radius: $r-pilule;

    &:focus-visible {
      outline: 2px solid $cyan;
    }
  }

  &__trait {
    inline-size: 5px;
    block-size: 1.75rem;
    border-radius: 3px;
    background: $ardoise-clair;
    transition:
      block-size $normal $courbe,
      background $vite $courbe;
  }

  &__lien--active &__trait {
    block-size: 4rem;
    background: var(--section-teinte);
  }

  &__lien:hover &__trait {
    background: $blanc;
  }

  &__bulle {
    position: absolute;
    inset-inline-end: calc(100% + 0.5rem);
    inset-block-start: 50%;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.5rem 1rem 0.5rem 0.85rem;
    border-radius: $r-pilule;
    background: $ardoise-clair;
    box-shadow: 0 8px 20px rgba(#000, 0.45);
    font-size: 0.85rem;
    font-weight: 600;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transform: translate(6px, -50%);
    transition:
      opacity $vite $courbe,
      transform $vite $courbe;
  }

  &__lien:hover &__bulle,
  &__lien:focus-visible &__bulle {
    opacity: 1;
    transform: translate(0, -50%);
  }

  &__num {
    font-size: 0.7rem;
    color: var(--section-teinte);
  }
}
</style>
