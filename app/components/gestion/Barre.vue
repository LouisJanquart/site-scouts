<script setup lang="ts">
// La barre du back office : les modules à gauche, la portée à droite.
// Elle est la même sur tous les modules, c'est ce qui en fait un back office
// plutôt qu'une collection de pages.
const { estCU, aLeRole, mesSections } = useCompte()
// Un trésorier sans section n'a rien à publier : on ne lui montre pas les
// modules qu'il ne pourrait que lire.
const estPublieur = computed(() => estCU.value || mesSections.value.length > 0)
const { portee, sectionsPossibles, nomDeSection, choisir } = usePortee()

const modules = computed(() =>
  [
    { to: '/gestion', texte: 'Tableau de bord', icone: 'bouclier', exact: true, pour: true },
    { to: '/gestion/dossiers', texte: 'Dossiers', icone: 'document', pour: true },
    { to: '/gestion/actus', texte: 'Actus', icone: 'cloche', pour: estPublieur.value },
    { to: '/gestion/events', texte: 'Événements', icone: 'calendrier', pour: estPublieur.value },
    { to: '/gestion/sections', texte: 'Pages des sections', icone: 'crayon', pour: true },
    { to: '/gestion/argent', texte: 'Argent', icone: 'euro', pour: aLeRole('cu', 'tresorier') },
    { to: '/gestion/comptes', texte: 'Comptes et rôles', icone: 'groupe', pour: estCU.value },
    { to: '/gestion/rgpd', texte: 'RGPD', icone: 'cadenas', pour: estCU.value },
  ].filter((m) => m.pour),
)

const route = useRoute()

// La portée voyage avec le lien : passer d'un module à l'autre ne doit pas la
// perdre, et une adresse copiée doit rouvrir la même vue chez quelqu'un
// d'autre.
function lien(to: string) {
  return portee.value ? { path: to, query: { section: portee.value } } : to
}

function estActif(m: { to: string; exact?: boolean }) {
  const ici = route.path.replace(/\/$/, '')
  return m.exact ? ici === m.to : ici.startsWith(m.to)
}
</script>

<template>
  <div class="barre">
    <nav class="modules" aria-label="Les modules de la gestion">
      <NuxtLink
        v-for="m in modules"
        :key="m.to"
        class="modules__lien"
        :class="{ 'modules__lien--actif': estActif(m) }"
        :aria-current="estActif(m) ? 'page' : undefined"
        :to="lien(m.to)"
      >
        <UiIcone :nom="m.icone" :taille="15" />
        {{ m.texte }}
      </NuxtLink>
    </nav>

    <div v-if="sectionsPossibles.length > 1" class="portee">
      <span class="portee__nom">Portée</span>
      <div class="portee__puces">
        <button
          class="puce"
          :class="{ 'puce--actif': !portee }"
          type="button"
          @click="choisir('')"
        >
          {{ estCU ? 'Toute l’unité' : 'Mes sections' }}
        </button>
        <button
          v-for="s in sectionsPossibles"
          :key="s"
          class="puce"
          :class="{ 'puce--actif': portee === s }"
          :data-section="s"
          type="button"
          @click="choisir(s)"
        >
          {{ nomDeSection(s) }}
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.barre {
  display: flex;
  flex-direction: column;
  gap: $esp-3;
  margin-block-start: $esp-2;
}

// Les modules, rangés dans un puits comme les onglets d'une section.
.modules {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  align-self: flex-start;
  max-inline-size: 100%;
  padding: 0.3rem;
  background: $ardoise-sourd;
  border-radius: $r-tuile;

  &__lien {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    min-block-size: 2.75rem;
    padding: 0.5rem 0.95rem;
    border-radius: $r-pilule;
    font-size: 0.95rem;
    font-weight: 500;
    color: rgba($blanc, 0.7);
    transition:
      background $vite $courbe,
      color $vite $courbe;

    @include focus-visible;

    // Le survol seulement là où il existe : au doigt, il restait collé et on
    // croyait voir deux modules actifs à la fois.
    @media (hover: hover) {
      &:hover {
        color: $blanc;
      }
    }

    &--actif {
      background: $ardoise;
      color: $cyan;
      font-weight: 600;
    }
  }
}

.portee {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: $esp-1 $esp-2;

  &__nom {
    @include surtitre;
    font-size: 0.75rem;
    color: rgba($blanc, 0.6);
  }

  &__puces {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
  }
}

.puce {
  min-block-size: 2.25rem;
  padding: 0.35rem 0.8rem;
  border-radius: $r-pilule;
  background: rgba($blanc, 0.05);
  color: rgba($blanc, 0.7);
  font-size: 0.95rem;
  font-weight: 500;
  @include focus-visible;

  @media (hover: hover) {
    &:hover {
      background: rgba($blanc, 0.1);
      color: $blanc;
    }
  }

  &--actif {
    background: color-mix(in srgb, var(--section-teinte) 20%, transparent);
    color: var(--section-teinte);
    box-shadow: inset 0 0 0 1.5px currentColor;
  }

  // « Toute l'unité » n'a pas de section : elle prend le cyan de l'unité,
  // partout, au lieu d'hériter de ce qui traîne autour.
  &--actif:not([data-section]) {
    --section-teinte: #{$cyan};
  }
}
</style>
