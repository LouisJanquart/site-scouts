<script setup lang="ts">
// Outil de démonstration, pas une fonctionnalité du site fini.
// Il permet de voir, sans authentification, ce que chacun des quatre publics
// verra une fois les comptes en place. Il s'affiche donc volontairement comme
// un élément de chantier, et non comme un composant de l'interface.

const { role, definirRole } = useRole()
const ouvert = ref(false)
</script>

<template>
  <aside class="chantier" :class="{ 'chantier--ouvert': ouvert }" aria-label="Outil de démonstration">
    <button
      class="chantier__poignee"
      type="button"
      :aria-expanded="ouvert"
      @click="ouvert = !ouvert"
    >
      <span class="chantier__pastille" />
      <span class="chantier__etiquette mono">Vue&nbsp;: {{ role }}</span>
      <UiIcone nom="chevron" :taille="14" class="chantier__chevron" />
    </button>

    <div v-if="ouvert" class="chantier__tiroir">
      <p class="chantier__note">
        Sélecteur de démonstration. Il change ce qui est <em>affiché</em>, pas ce qui est
        <em>protégé</em> : tant qu’il n’y a pas d’authentification, tout ce que contient le site
        est téléchargé par n’importe quel visiteur. Aucune coordonnée personnelle n’a donc été
        mise dans le code.
      </p>
      <ul class="chantier__liste">
        <li v-for="r in rolesDisponibles" :key="r.cle">
          <button
            class="chantier__option"
            :class="{ 'chantier__option--actif': role === r.cle }"
            type="button"
            @click="definirRole(r.cle)"
          >
            <UiIcone :nom="r.icone" :taille="18" />
            <span>
              <strong>{{ r.nom }}</strong>
              <span class="chantier__desc">{{ r.description }}</span>
            </span>
          </button>
        </li>
      </ul>
    </div>
  </aside>
</template>

<style lang="scss" scoped>
.chantier {
  position: fixed;
  inset-block-end: 1rem;
  inset-inline-start: 1rem;
  z-index: 60;
  inline-size: min(21rem, calc(100vw - 2rem));
  font-family: $police-ui;

  &__poignee {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.45rem 0.8rem 0.45rem 0.6rem;
    background: repeating-linear-gradient(
      -45deg,
      rgba(#f0a32e, 0.16) 0 8px,
      rgba(#f0a32e, 0.05) 8px 16px
    );
    border: 1px solid rgba(#f0a32e, 0.35);
    border-radius: $r-pilule;
    color: #f0a32e;
    backdrop-filter: blur(12px);

    @include focus-visible;
  }

  &__pastille {
    inline-size: 0.5rem;
    block-size: 0.5rem;
    border-radius: 50%;
    background: #f0a32e;
    box-shadow: 0 0 0 3px rgba(#f0a32e, 0.2);
  }

  &__etiquette {
    font-size: 0.68rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  &__chevron {
    transform: rotate(-90deg);
    transition: transform $vite $courbe;

    .chantier--ouvert & {
      transform: rotate(90deg);
    }
  }

  &__tiroir {
    margin-block-end: 0.5rem;
    order: -1;
    padding: 0.9rem;
    background: rgba(#141520, 0.97);
    border: 1px solid rgba($blanc, 0.08);
    border-radius: $r-carte;
    box-shadow: 0 24px 64px -24px rgba(#000, 0.8);
  }

  &--ouvert {
    display: flex;
    flex-direction: column-reverse;
    align-items: flex-start;
  }

  &__note {
    font-size: 0.72rem;
    line-height: 1.5;
    color: rgba($blanc, 0.64);
    margin-block-end: 0.75rem;

    em {
      color: rgba($blanc, 0.85);
      font-style: normal;
      font-weight: 600;
    }
  }

  &__liste {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    margin: 0;
  }

  &__option {
    inline-size: 100%;
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    padding: 0.5rem 0.6rem;
    border-radius: $r-champ;
    text-align: start;
    color: rgba($blanc, 0.68);
    transition: background $vite $courbe;

    @include focus-visible;

    &:hover {
      background: rgba($blanc, 0.05);
      color: $blanc;
    }

    &--actif {
      background: rgba($cyan, 0.12);
      color: $cyan;
    }

    strong {
      display: block;
      font-size: 0.85rem;
      font-weight: 600;
    }
  }

  &__desc {
    display: block;
    font-size: 0.7rem;
    line-height: 1.45;
    color: rgba($blanc, 0.6);
  }
}
</style>
