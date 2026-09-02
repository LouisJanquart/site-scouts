<script setup lang="ts">
// L'enveloppe des pages intérieures : un panneau qui défile en interne sur
// grand écran, pour que la coque « console » ne bouge jamais.

defineProps<{
  titre: string
  surtitre?: string
  chapo?: string
  retour?: { to: string; texte: string }
}>()
</script>

<template>
  <article class="page panneau panneau--plein">
    <div class="page__defilement">
      <header class="page__entete">
        <NuxtLink v-if="retour" class="page__retour" :to="retour.to">
          <UiIcone nom="chevrons-gauche" :taille="14" />
          {{ retour.texte }}
        </NuxtLink>
        <p v-if="surtitre" class="surtitre page__surtitre">{{ surtitre }}</p>
        <h1 class="titre titre--grand">{{ titre }}</h1>
        <p v-if="chapo" class="page__chapo">{{ chapo }}</p>
        <slot name="entete" />
      </header>

      <div class="page__corps">
        <slot />
      </div>
    </div>
  </article>
</template>

<style lang="scss" scoped>
.page {
  block-size: 100%;

  &__defilement {
    block-size: 100%;
    padding: 1.25rem;
    @include defilement-discret;

    @include console {
      // On laisse passer le rail et la barre d'outils flottants.
      padding-block-start: 5.5rem;
      padding-inline: clamp(1.5rem, 4vw, 3rem);
      padding-block-end: 3rem;
    }
  }

  &__entete {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-inline-size: 46rem;
    margin-block-end: 2rem;
  }

  &__retour {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    inline-size: fit-content;
    margin-block-end: 0.5rem;
    font-size: 0.78rem;
    color: rgba($blanc, 0.62);

    @include focus-visible;
    &:hover {
      color: $cyan;
    }
  }

  &__surtitre {
    color: var(--section-teinte);
  }

  &__chapo {
    margin-block-start: 0.5rem;
    font-size: 1.05rem;
    line-height: 1.6;
    color: rgba($blanc, 0.68);
    max-inline-size: 44rem;
  }

  &__corps {
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
  }
}
</style>
