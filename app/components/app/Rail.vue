<script setup lang="ts">
const { sections } = useSections()

// La pilule de navigation, reprise du composant « side » des maquettes (six
// positions à l'origine, huit ici pour inclure la Route et le staff d'unité).
//
// Elle commence par le retour à l'accueil : c'est le seul élément présent sur
// toutes les pages, donc le seul endroit où ce bouton est toujours au même
// endroit.

const route = useRoute()
const actif = computed(() => route.path.match(/^\/sections\/([a-z-]+)/)?.[1] ?? null)
const surAccueil = computed(() => route.path === '/')
</script>

<template>
  <nav class="rail" aria-label="Navigation de l’unité">
    <ul class="rail__liste">
      <li class="rail__element rail__element--accueil">
        <NuxtLink
          class="rail__lien rail__lien--accueil"
          :class="{ 'rail__lien--actif': surAccueil }"
          to="/"
          :aria-current="surAccueil ? 'page' : undefined"
        >
          <UiIcone nom="lys" :taille="22" class="rail__icone" />
          <span class="rail__nom">Accueil</span>
        </NuxtLink>
      </li>

      <li class="rail__separateur" aria-hidden="true"></li>

      <li v-for="s in sections" :key="s.slug" class="rail__element">
        <NuxtLink
          class="rail__lien"
          :class="{ 'rail__lien--actif': actif === s.slug }"
          :to="`/sections/${s.slug}`"
          :data-section="s.slug"
          :aria-current="actif === s.slug ? 'page' : undefined"
        >
          <UiIcone :nom="s.icone" :taille="22" class="rail__icone" />
          <span class="rail__nom">{{ s.nomCourt ?? s.nom }}</span>
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<style lang="scss" scoped>
.rail {
  display: flex;

  // Relevé sur Desktop-7 : fond gris 2 plein, rayon 64, 54 px de réserve de
  // chaque côté, 96 de haut, et les entrées réparties d'un bord à l'autre.
  // C'était une pilule noire translucide, ce qui ne ressemblait à rien de la
  // maquette — le rail est un bloc du bento, pas une barre flottante.
  &__liste {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.25rem;
    margin: 0;
    // 54 px de réserve sur grand écran, comme la maquette. Sur téléphone, ces
    // 54 px ne faisaient que pousser « Accueil » vers le milieu.
    padding: 0.4rem;
    background: $ardoise;
    border-radius: $r-panneau;
    overflow-x: auto;
    scrollbar-width: none;
    max-inline-size: 100%;

    @include jusqua($bp-console) {
      // Le rail défile à l'horizontale : un fondu sur le bord droit dit qu'il
      // y a une suite, au lieu de couper « Guides » net.
      mask-image: linear-gradient(90deg, #000 calc(100% - 2.5rem), transparent);
      padding-inline-end: 2.5rem;
    }

    @include console {
      block-size: 6rem; // 96 px
      padding-block: 0;
      padding-inline: 3.375rem; // 54 px
      overflow: visible;
    }

    &::-webkit-scrollbar {
      display: none;
    }
  }

  // Pas de séparateur dans la maquette : les entrées respirent d'elles-mêmes.
  &__separateur {
    display: none;
  }

  &__lien {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem; // 4 px
    inline-size: 4.1rem;
    padding: 0.5rem 0.25rem 0.45rem;
    border-radius: $r-champ;
    color: $blanc;
    transition:
      color $vite $courbe,
      background $vite $courbe;

    @include focus-visible;

    @media (hover: hover) {
      &:hover {
        color: $blanc;
        background: rgba($blanc, 0.06);
      }
    }

    // Le rail est maintenant en gris 2 : une étiquette teintée dessus ne passe
    // plus les 4,5:1. C'est donc la pastille qui s'assombrit et l'icône qui
    // porte la couleur, le mot restant blanc.
    &--actif {
      color: $blanc;
      background: rgba($noir-profond, 0.5);

      .rail__icone {
        color: var(--section-teinte);
      }
    }

    // Le retour à l'accueil porte la couleur de l'unité par son icône
    // seulement. Le mot en rouge se lisait comme l'onglet actif : sur la page
    // des Lutins, on croyait voir deux onglets allumés.
    &--accueil {
      .rail__icone {
        color: $rouge-texte;
      }

      &.rail__lien--actif {
        color: $blanc;
        background: rgba($noir-profond, 0.55);

        .rail__icone {
          color: $rouge-texte;
        }
      }
    }
  }

  &__icone {
    transition: transform $normal $courbe;

    .rail__lien:hover & {
      transform: translateY(-2px);
    }
  }

  &__nom {
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.01em;
    white-space: nowrap;
  }
}
</style>
