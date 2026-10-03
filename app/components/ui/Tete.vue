<script setup lang="ts">
// L'en-tête d'une page en bento : un bloc à part entière, avec son étiquette
// à cheval sur le bord, la photo encastrée, le titre qui déborde sur le bas de
// la photo et, s'il y en a une, la pastille posée à cheval sur le coin.
//
// Sert aux sections et aux événements. Sans photo, le titre reste simplement
// en haut du bloc.
const props = defineProps<{
  titre: string
  etiquette?: string
  photo?: string | null
  icone?: string | null
  retour?: { to: string; texte: string }
}>()

// Un nom de section tient en un mot ; un titre d'événement, en plusieurs.
// Au-delà de 14 caractères, le titre descend d'un cran pour ne pas couper
// « OUVERTE / S » au milieu d'un mot sur téléphone.
const long = computed(() => props.titre.length > 14)
</script>

<template>
  <header class="tete" :class="{ 'tete--sans-photo': !photo, 'tete--long': long }">
    <p v-if="etiquette" class="tete__etiquette">{{ etiquette }}</p>
    <NuxtLink v-if="retour" class="tete__retour" :to="retour.to">
      <UiIcone nom="chevrons-gauche" :taille="14" />
      {{ retour.texte }}
    </NuxtLink>

    <div class="tete__scene">
      <div v-if="photo" class="tete__photo">
        <img :src="photo" alt="" />
      </div>
      <h1 class="tete__nom titre">{{ titre }}</h1>
      <span v-if="icone" class="tete__pastille" aria-hidden="true">
        <UiIcone :nom="icone" :taille="40" />
      </span>
    </div>

    <div v-if="$slots.default" class="tete__pied">
      <slot />
    </div>
  </header>
</template>

<style lang="scss" scoped>
.tete {
  position: relative;
  margin-block-end: $esp-blocs;
  padding: $esp-3 $esp-3 $esp-4;
  background: $noir;
  border-radius: $r-panneau;
  box-shadow: $ombre-panneau;

  @include depuis($bp-poche) {
    padding: $esp-3 $esp-3 $esp-5;
  }

  &__etiquette {
    position: absolute;
    inset-block-start: -1.375rem;
    inset-inline-start: $esp-6;
    z-index: 3;
    margin: 0;
    padding: 0.5rem 1.1rem;
    background: var(--section-teinte);
    color: $noir;
    border: 6px solid $noir-profond;
    border-radius: $r-pilule;
    font-family: $police-mono;
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  &__retour {
    position: absolute;
    inset-block-start: $esp-6;
    inset-inline-start: $esp-6;
    z-index: 2;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.4rem 0.8rem;
    background: rgba($noir, 0.72);
    backdrop-filter: blur(12px);
    border-radius: $r-pilule;
    font-size: 0.875rem;
    color: rgba($blanc, 0.85);

    @include focus-visible;
    &:hover {
      color: $cyan;
    }

    @include jusqua($bp-poche) {
      inset-block-start: 2.25rem;
      inset-inline-start: $esp-4;
    }
  }

  &__scene {
    position: relative;
  }

  &__photo {
    block-size: clamp(12rem, 28vw, 22rem);
    border-radius: calc(#{$r-panneau} - #{$esp-3});
    overflow: hidden;

    img {
      inline-size: 100%;
      block-size: 100%;
      object-fit: cover;
      filter: contrast(1.1) saturate(0.85) brightness(0.72);
    }
  }

  // Le nom déborde du bas de la photo : une moitié dessus, une moitié sur le
  // panneau. C'est la superposition qui fait l'en-tête.
  &__nom {
    position: absolute;
    inset-inline-start: $esp-4;
    inset-block-end: -0.42em;
    margin: 0;
    // Le nom ne doit jamais passer sous la pastille, à droite.
    max-inline-size: calc(100% - 6rem);
    font-size: clamp(2.25rem, 9vw, 7.5rem);
    font-variation-settings: 'wdth' 125;
    line-height: 0.95;
    overflow-wrap: normal;
    hyphens: manual;
    text-wrap: balance;
    text-shadow: 0 2px 32px rgba(#000, 0.4);

    @include depuis($bp-poche) {
      inset-inline-start: $esp-6;
    }
  }

  &__pastille {
    position: absolute;
    inset-inline-end: $esp-3;
    inset-block-end: -1.75rem;
    display: grid;
    place-items: center;
    inline-size: 3.75rem;
    block-size: 3.75rem;
    border-radius: 50%;
    background: var(--section-teinte);
    color: $noir;
    border: 6px solid $noir;

    :deep(svg) {
      inline-size: 55%;
      block-size: 55%;
    }

    @include depuis($bp-poche) {
      border-width: 8px;
      inset-inline-end: $esp-6;
      inline-size: 6rem;
      block-size: 6rem;
      inset-block-end: -3rem;
    }
  }

  &__pied {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: space-between;
    gap: $esp-4;
    padding: 4.5rem $esp-2 0;

    @include depuis($bp-poche) {
      padding: 5.5rem $esp-5 0;
    }
  }

  &__resume {
    flex: 1 1 22rem;
    max-inline-size: 36rem;
    margin: 0;
    font-size: 1.05rem;
    line-height: 1.6;
    color: rgba($blanc, 0.76);
  }
}


.tete--long .tete__nom {
  font-size: clamp(1.75rem, 6vw, 4.5rem);
  line-height: 1;
}

// Sans photo : le titre reprend sa place dans le flux, et le retour avec lui.
.tete--sans-photo {
  padding: $esp-6 $esp-4 $esp-5;

  @include depuis($bp-poche) {
    padding: $esp-6 $esp-6 $esp-5;
  }

  .tete__retour {
    position: static;
    margin-block-end: $esp-3;
    padding: 0;
    background: none;
    backdrop-filter: none;
    color: rgba($blanc, 0.65);
  }

  .tete__nom {
    position: static;
    max-inline-size: none;
    font-size: clamp(1.6rem, 5vw, 3.25rem);
    padding-inline-end: 4.5rem;
  }

  .tete__pastille {
    inset-block-start: 0;
    inset-block-end: auto;
  }

  .tete__pied {
    padding: $esp-4 0 0;
  }
}
</style>
