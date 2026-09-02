<script setup lang="ts">
// La coquille « console » : trois colonnes de panneaux flottants sur grand
// écran, une pile qui défile en dessous. C'est la transposition directe de
// l'écran Desktop-7 des maquettes.

const route = useRoute()

// Le rail colore toute l'interface en fonction de la section consultée.
const sectionCourante = computed(() => {
  const m = route.path.match(/^\/sections\/([a-z-]+)/)
  return m?.[1] ?? null
})
</script>

<template>
  <div class="coque" :data-section="sectionCourante ?? undefined">
    <a class="saut-contenu" href="#contenu">Aller au contenu</a>

    <div class="coque__grille">
      <div class="coque__flanc coque__flanc--gauche">
        <PanneauEvenements />
        <PanneauCalendrier />
      </div>

      <div class="coque__scene">
        <main id="contenu" class="coque__contenu">
          <slot />
        </main>
        <AppRail class="coque__rail" />
        <AppBarreOutils class="coque__outils" />
      </div>

      <div class="coque__flanc coque__flanc--droite">
        <PanneauActus />
      </div>
    </div>

    <AppSelecteurRole />
  </div>
</template>

<style lang="scss" scoped>
.coque {
  min-block-size: 100dvh;
  padding: $marge-page;
  // Place pour le bandeau « vue : rôle », fixé en bas à gauche.
  padding-block-end: 4rem;

  @include console {
    block-size: 100dvh;
    overflow: hidden;
    padding-block-end: $marge-page;
  }

  &__grille {
    display: flex;
    flex-direction: column;
    gap: $gouttiere;

    @include console {
      display: grid;
      grid-template-columns: 15.5rem minmax(0, 1fr) 16.5rem;
      gap: $gouttiere;
      block-size: 100%;
    }

    @media (min-width: $bp-large) {
      grid-template-columns: 18rem minmax(0, 1fr) 20rem;
    }
  }

  &__flanc {
    display: flex;
    flex-direction: column;
    gap: $gouttiere;
    min-block-size: 0;

    &--gauche {
      order: 2;
    }
    &--droite {
      order: 3;
    }

    @include console {
      &--gauche,
      &--droite {
        order: 0;
      }

      // Le bandeau « vue : rôle » est fixé en bas à gauche : on lui laisse
      // sa place plutôt que de le laisser recouvrir le calendrier.
      &--gauche {
        padding-block-end: 2.75rem;
      }
    }
  }

  &__scene {
    position: relative;
    min-block-size: 0;
    order: 1;

    @include console {
      order: 0;
    }
  }

  &__contenu {
    block-size: 100%;
    min-block-size: 26rem;
  }

  &__rail {
    @include console {
      position: absolute;
      inset-block-start: 1rem;
      // On réserve la place de la barre d'outils à droite, sinon les deux
      // pilules se chevauchent sur les écrans les plus étroits.
      inset-inline: 1rem 13.5rem;
      z-index: 20;
      justify-content: flex-start;
    }

    @media (min-width: $bp-large) {
      inset-inline: 1rem 14rem;
      justify-content: center;
    }
  }

  &__outils {
    @include console {
      position: absolute;
      inset-block-start: 1rem;
      inset-inline-end: 1rem;
      z-index: 21;
    }
  }
}

// Sur petit écran le rail passe avant le contenu et défile horizontalement.
@include jusqua($bp-console) {
  .coque__scene {
    display: flex;
    flex-direction: column;
    gap: $gouttiere;
  }
  .coque__rail {
    order: -2;
  }
  .coque__outils {
    order: -1;
  }
}
</style>
