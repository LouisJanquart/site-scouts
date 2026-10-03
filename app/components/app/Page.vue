<script setup lang="ts">
// L'enveloppe des pages intérieures.
//
// Deux mises en page :
//   - le panneau (par défaut) : un seul grand panneau qui défile en interne sur
//     grand écran. Pour les outils — formulaires, back office — où l'on veut
//     un plan de travail, pas une composition.
//   - le bento (« bento ») : la page n'a plus de fond, ce sont ses blocs qui
//     flottent sur le sol de la page, chacun avec son étiquette, comme sur
//     l'accueil. L'en-tête devient le premier bloc.
//
// Dans les deux cas, une seule largeur pour tout le corps : finies les
// listes à 68rem sous un encadré à 44rem sous une image à 46rem.

withDefaults(
  defineProps<{
    titre: string
    surtitre?: string
    chapo?: string
    retour?: { to: string; texte: string }
    bento?: boolean
  }>(),
  { bento: false },
)
</script>

<template>
  <article class="page" :class="bento ? 'page--bento' : 'panneau panneau--plein'">
    <div class="page__defilement">
      <slot v-if="$slots.hero" name="hero" />
      <header v-else class="page__entete">
        <NuxtLink v-if="retour" class="page__retour" :to="retour.to">
          <UiIcone nom="chevrons-gauche" :taille="14" />
          {{ retour.texte }}
        </NuxtLink>
        <p v-if="surtitre" class="surtitre page__surtitre">{{ surtitre }}</p>
        <h1 class="titre titre--grand page__titre">{{ titre }}</h1>
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

  // Le grand panneau commence à la même hauteur que le premier bloc d'une
  // page en bento (qui garde 32 px au-dessus pour son étiquette).
  &:not(.page--bento) {
    @include console {
      block-size: calc(100% - #{$esp-5});
      margin-block-start: $esp-5;
    }
  }

  &__defilement {
    block-size: 100%;
    padding: $esp-4 $esp-3;
    @include defilement-discret;

    @include depuis($bp-poche) {
      padding: $esp-5;
    }

    @include console {
      padding: $esp-6 clamp(#{$esp-5}, 4vw, #{$esp-6});
    }
  }

  &__entete {
    display: flex;
    flex-direction: column;
    gap: $esp-1;
    margin-block-end: $esp-5;
  }

  &__retour {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    inline-size: fit-content;
    margin-block-end: $esp-1;
    font-size: 1rem;
    color: rgba($blanc, 0.62);

    @include focus-visible;
    &:hover {
      color: $cyan;
    }
  }

  &__surtitre {
    color: var(--section-teinte);
  }

  &__titre {
    overflow-wrap: anywhere;
  }

  // Le chapô et le texte courant partagent une seule mesure de lecture.
  &__chapo {
    margin-block-start: $esp-1;
    max-inline-size: 42rem;
    font-size: 1.05rem;
    line-height: 1.6;
    color: rgba($blanc, 0.7);
  }

  &__corps {
    display: flex;
    flex-direction: column;
    gap: $esp-5;
  }

  // --- Le bento ------------------------------------------------------------
  &--bento {
    .page__defilement {
      // Plus de fond, donc plus de marge intérieure sur les côtés : les blocs
      // vont jusqu'au bord de la scène, alignés sur le rail. En haut, de quoi
      // loger l'étiquette du premier bloc.
      padding: $esp-5 0 $esp-6;

      @include console {
        padding: $esp-5 0 $esp-6;
      }
    }

    .page__entete {
      margin: 0 0 $esp-blocs;
      padding: $esp-5 $esp-4;
      background: $noir;
      border-radius: $r-panneau;
      box-shadow: $ombre-panneau;

      @include depuis($bp-poche) {
        padding: $esp-6 $esp-6 $esp-5;
      }
    }

    .page__corps {
      gap: $esp-blocs;
    }
  }
}
</style>
