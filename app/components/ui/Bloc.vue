<script setup lang="ts">
// Le bloc du bento : un panneau avec son étiquette posée à cheval sur le bord
// du haut, comme un onglet de classeur.
//
// L'étiquette EST le titre du bloc (un h2 par défaut) : elle n'est pas
// décorative, un lecteur d'écran la lit comme un intitulé. L'effet d'encoche
// vient de son contour, peint de la couleur du fond sur lequel le bloc est
// posé (« sur ») : on dirait qu'elle est découpée dans le bord.
withDefaults(
  defineProps<{
    etiquette?: string
    /** La couleur de l'étiquette. « section » suit la section consultée. */
    ton?: 'neutre' | 'section' | 'cyan' | 'rouge'
    /** Le niveau de titre de l'étiquette. */
    niveau?: 2 | 3
    /** Le fond sur lequel le bloc est posé, pour peindre l'encoche. */
    sur?: 'page' | 'panneau'
    /** Sans marge intérieure : pour une photo ou un tableau qui va au bord. */
    plein?: boolean
    as?: string
  }>(),
  { ton: 'neutre', niveau: 2, sur: 'page', plein: false, as: 'section' },
)
</script>

<template>
  <component
    :is="as"
    class="bloc"
    :class="[`bloc--sur-${sur}`, { 'bloc--plein': plein, 'bloc--etiquete': etiquette || $slots.etiquette }]"
  >
    <component
      :is="`h${niveau}`"
      v-if="etiquette || $slots.etiquette"
      class="bloc__etiquette"
      :class="`bloc__etiquette--${ton}`"
    >
      <slot name="etiquette">{{ etiquette }}</slot>
    </component>
    <div class="bloc__corps">
      <slot />
    </div>
    <div v-if="$slots.pied" class="bloc__pied">
      <slot name="pied" />
    </div>
  </component>
</template>

<style lang="scss" scoped>
.bloc {
  --bloc-fond: #{$noir};
  --bloc-sol: #{$noir-profond};
  position: relative;
  display: flex;
  flex-direction: column;
  gap: $esp-3;
  min-inline-size: 0;
  padding: $esp-4 $esp-3 $esp-3;
  background: var(--bloc-fond);
  border-radius: $r-bloc;

  @include depuis($bp-poche) {
    padding: $esp-5 $esp-4 $esp-4;
  }

  // Un bloc posé dans le panneau d'une page monte d'un cran.
  &--sur-panneau {
    --bloc-fond: #{$bloc};
    --bloc-sol: #{$noir};
  }

  // L'étiquette dépasse de 22 px au-dessus : on lui laisse sa place dans le
  // bloc pour que le contenu ne passe pas dessous.
  &--etiquete {
    padding-block-start: $esp-6;
  }

  &--plein {
    padding: 0;
    overflow: hidden;

    &.bloc--etiquete {
      overflow: visible;
    }
  }

  &__etiquette {
    position: absolute;
    inset-block-start: -1.375rem; // -22 px : à cheval sur le bord
    inset-inline-start: $esp-5;
    z-index: 2;
    max-inline-size: calc(100% - #{$esp-6});
    margin: 0;
    padding: 0.5rem 1.1rem;
    border: 6px solid var(--bloc-sol);
    border-radius: $r-pilule;
    font-family: $police-mono;
    font-size: 0.75rem;
    font-weight: 500;
    line-height: 1.4;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    @include depuis($bp-poche) {
      inset-inline-start: $esp-6;
    }

    &--neutre {
      background: $ardoise;
      color: $blanc;
    }
    &--section {
      background: var(--section-teinte, #{$ardoise});
      color: $noir;
    }
    &--cyan {
      background: $cyan;
      color: $noir;
    }
    &--rouge {
      background: $rouge-plein;
      color: $blanc;
    }
  }

  &__corps {
    display: flex;
    flex-direction: column;
    gap: $esp-3;
    min-inline-size: 0;
    flex: 1;
  }

  &__pied {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: $esp-2;
  }
}
</style>
