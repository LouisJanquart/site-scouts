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
        <!-- Les actus ne forment pas une colonne : dans la maquette elles sont
             POSÉES sur la photo, alignées sous la barre d'outils. C'est ce qui
             donne au panneau central sa largeur — il court jusqu'au bord droit
             de la page et passe derrière elles. -->
        <PanneauActus v-if="surAccueil" class="coque__actus" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.coque {
  min-block-size: 100dvh;
  padding: $marge-page;

  @include console {
    block-size: 100dvh;
    overflow: hidden;
    padding: $marge-console;
  }

  &__grille {
    display: flex;
    flex-direction: column;
    gap: $gouttiere;

    @include console {
      display: grid;
      // Deux colonnes, pas trois : le flanc gauche, puis la scène jusqu'au bord.
      // Le flanc garde sa largeur : c'est la scène qui s'étire.
      grid-template-columns: 14.5rem minmax(0, 1fr);
      gap: $gouttiere-console;
      block-size: 100%;
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

    @include console {
      gap: $gouttiere-console;

      // Le bloc du bas garde sa hauteur naturelle, celui du haut prend le
      // reste. Sur un écran plus court que les 1024 de la maquette, c'est donc
      // la liste des events qui se réduit — d'une carte entière à la fois,
      // jamais d'une demie (voir PanneauEvenements).
      > :first-child {
        flex: 1 1 0;
        min-block-size: 0;
        overflow: hidden;
      }
      > :last-child {
        flex: 0 0 auto;
      }
    }

    &--gauche {
      order: 2;
    }

    @include console {
      &--gauche {
        order: 0;
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

    // Hors accueil, le rail flotte au-dessus du contenu : sans réserve en haut,
    // il recouvre le surtitre de la page. L'accueil, lui, n'en veut pas — c'est
    // la photo qui passe sous le rail, c'est le principe.
    // Le rail y est calé dans le coin, à fleur du bord : 96 px de haut, plus
    // une gouttière. Avant, il était posé à 32 px du bord et mordait de 8 px
    // sur le haut du panneau, sans s'aligner ni sur lui ni sur son contenu.
    @include console {
      .coque__grille--seule & {
        padding-block-start: calc(6rem + #{$gouttiere-console});
      }
    }
  }

  &__rail {
    @include console {
      position: absolute;
      // 32 du haut et de la gauche du panneau, comme la maquette. La largeur
      // reste souple : la maquette a huit sections, le site en a neuf avec
      // « Accueil ».
      inset-block-start: 2rem;
      inset-inline-start: 2rem;
      inline-size: fit-content;
      min-inline-size: 43.5rem; // 696 px, la largeur de la maquette
      max-inline-size: calc(100% - 22rem); // on ne mord pas dans l'entaille
      z-index: 20;
      justify-content: flex-start;

      // Hors accueil, pas de photo sous le rail : il se range dans le coin,
      // aligné sur le bord des blocs en dessous.
      .coque__grille--seule & {
        inset-block-start: 0;
        inset-inline-start: 0;
      }
    }

    @media (min-width: $bp-large) {
      justify-content: center;
    }
  }

  // La barre d'outils ne flotte pas sur la photo : elle se loge dans l'entaille
  // du coin supérieur droit, à fleur du panneau. C'est cette entaille, creusée
  // d'une gouttière autour d'elle, qui lui fait sa place. Sa largeur est celle
  // de l'entaille, sinon l'entaille bâille.
  &__outils {
    @include console {
      position: absolute;
      inset-block-start: 0;
      inset-inline-end: 0;
      inline-size: 16rem; // 256 px, comme l'entaille qui l'accueille
      block-size: 4rem; // 64 px
      z-index: 21;
    }
  }

  // Les actus, posées sur la photo et alignées sur la barre d'outils : même
  // largeur, même bord droit. Les proportions sont celles de la maquette.
  &__actus {
    @include console {
      position: absolute;
      // Taille fixe, comme les autres blocs du bento : 256×592, posé à 160 du
      // haut et à fleur du bord droit du panneau.
      inset-block-start: 10rem; // 160 px
      inset-inline-end: 0;
      inline-size: 16rem; // 256 px
      block-size: 37rem; // 592 px
      max-block-size: calc(100% - 12rem);
      z-index: 15;
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
  .coque__actus {
    order: 3;
  }
}
</style>
