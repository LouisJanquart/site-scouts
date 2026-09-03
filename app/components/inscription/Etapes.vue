<script setup lang="ts">
// Le fil des étapes. Il sert à trois choses : dire où l'on en est, dire ce qui
// reste, et permettre de revenir en arrière sans perdre ce qu'on a saisi.

defineProps<{ etapes: { cle: string; titre: string }[]; courante: number }>()
const emit = defineEmits<{ aller: [n: number] }>()
</script>

<template>
  <nav class="etapes" aria-label="Étapes de l’inscription">
    <ol>
      <li
        v-for="(e, i) in etapes"
        :key="e.cle"
        class="etapes__item"
        :class="{
          'etapes__item--faite': i < courante,
          'etapes__item--courante': i === courante,
        }"
      >
        <button
          type="button"
          class="etapes__bouton"
          :disabled="i > courante"
          :aria-current="i === courante ? 'step' : undefined"
          @click="emit('aller', i)"
        >
          <span class="etapes__pastille" aria-hidden="true">
            <UiIcone v-if="i < courante" nom="check" :taille="12" />
            <template v-else>{{ i + 1 }}</template>
          </span>
          <span class="etapes__titre">{{ e.titre }}</span>
        </button>
      </li>
    </ol>
  </nav>
</template>

<style lang="scss" scoped>
.etapes {
  ol {
    display: flex;
    flex-wrap: wrap;
    gap: 0.15rem 0.35rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__bouton {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.35rem 0.7rem 0.35rem 0.35rem;
    border-radius: $r-pilule;
    font-size: 0.76rem;
    font-weight: 500;
    color: rgba($blanc, 0.45);
    transition: background $vite $courbe, color $vite $courbe;

    @include focus-visible;

    &:disabled {
      cursor: default;
    }
    &:not(:disabled):hover {
      background: rgba($blanc, 0.06);
      color: $blanc;
    }
  }

  &__pastille {
    display: grid;
    place-items: center;
    inline-size: 1.45rem;
    block-size: 1.45rem;
    border-radius: 50%;
    background: rgba($blanc, 0.08);
    font-family: $police-mono;
    font-size: 0.68rem;
  }

  &__item--faite &__bouton {
    color: rgba($blanc, 0.72);
  }
  &__item--faite &__pastille {
    background: rgba($cyan, 0.2);
    color: $cyan;
  }

  &__item--courante &__bouton {
    color: $blanc;
    background: rgba($blanc, 0.07);
  }
  &__item--courante &__pastille {
    background: $cyan;
    color: $noir;
    font-weight: 600;
  }
}
</style>
