<script setup lang="ts">
// La coque « console ».
//
// Sur l'accueil : trois colonnes de panneaux flottants, comme dans la maquette
// Desktop-7. Les events, le calendrier et les actus sont des panneaux de
// l'accueil, pas du site : ailleurs, la page occupe toute la largeur.
//
// En dessous du point de rupture « console », tout redevient une pile.

const route = useRoute()

const surAccueil = computed(() => route.path === '/')

// Le rail colore toute l'interface en fonction de la section consultée.
const sectionCourante = computed(() => {
  const m = route.path.match(/^\/sections\/([a-z-]+)/)
  return m?.[1] ?? null
})
</script>

<template>
  <div class="coque" :data-section="sectionCourante ?? undefined">
    <a class="saut-contenu" href="#contenu">Aller au contenu</a>

    <div class="coque__grille" :class="{ 'coque__grille--seule': !surAccueil }">
      <div v-if="surAccueil" class="coque__flanc coque__flanc--gauche">
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

      <div v-if="surAccueil" class="coque__flanc coque__flanc--droite">
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

    // Hors accueil : une seule colonne, la page prend toute la largeur.
    &--seule {
      @include console {
        grid-template-columns: minmax(0, 1fr);
      }
      @media (min-width: $bp-large) {
        grid-template-columns: minmax(0, 1fr);
      }
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
      inset-block-start: 1.75rem;
      // Le rail se pose SUR la photo, à gauche de l'entaille du coin supérieur
      // droit : on lui interdit d'aller y mordre.
      inset-inline: 2rem max(13.5rem, 29%);
      z-index: 20;
      justify-content: flex-start;
    }

    @media (min-width: $bp-large) {
      justify-content: center;
    }
  }

  // La barre d'outils ne flotte pas sur la photo : elle se loge dans l'entaille
  // du coin supérieur droit, à fleur du panneau. C'est cette entaille, creusée
  // d'une gouttière autour d'elle, qui lui fait sa place.
  &__outils {
    @include console {
      position: absolute;
      inset-block-start: 0;
      inset-inline-end: 0;
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
