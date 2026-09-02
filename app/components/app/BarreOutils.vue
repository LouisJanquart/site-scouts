<script setup lang="ts">
// La pilule en haut à droite des maquettes : recherche, menu, profil.
// La recherche fonctionne réellement (elle balaie sections, événements, actus,
// questions pratiques et les 96 dates du planning).

const { definition } = useRole()
const recherche = ref(false)
const menu = ref(false)

const entrees = [
  { to: '/calendrier', nom: 'Calendrier', icone: 'calendrier' },
  { to: '/sections', nom: 'Sections', icone: 'lys' },
  { to: '/events', nom: 'Événements', icone: 'tente' },
  { to: '/actus', nom: 'Actus', icone: 'document' },
  { to: '/photos', nom: 'Photos', icone: 'photo' },
  { to: '/documents', nom: 'Documents', icone: 'cadenas' },
  { to: '/infos', nom: 'Infos pratiques', icone: 'info' },
  { to: '/a-propos', nom: 'À propos', icone: 'bouclier' },
]

const route = useRoute()
watch(() => route.fullPath, () => { menu.value = false; recherche.value = false })

function basculerMenu() {
  menu.value = !menu.value
  if (menu.value) recherche.value = false
}
function basculerRecherche() {
  recherche.value = !recherche.value
  if (recherche.value) menu.value = false
}
</script>

<template>
  <nav class="outils" aria-label="Outils et navigation">
    <AppRecherche v-model:ouverte="recherche" class="outils__flottant" />

    <div v-if="menu" class="outils__flottant menu">
      <ul>
        <li v-for="e in entrees" :key="e.to">
          <NuxtLink class="menu__lien" :to="e.to">
            <UiIcone :nom="e.icone" :taille="18" />
            {{ e.nom }}
          </NuxtLink>
        </li>
      </ul>
    </div>

    <button
      class="outils__bouton"
      type="button"
      aria-label="Rechercher"
      :aria-expanded="recherche"
      @click="basculerRecherche"
    >
      <UiIcone nom="recherche" :taille="20" />
    </button>

    <NuxtLink class="outils__bouton" to="/calendrier" aria-label="Calendrier de la saison">
      <UiIcone nom="calendrier" :taille="20" />
    </NuxtLink>

    <button
      class="outils__bouton"
      type="button"
      aria-label="Menu"
      :aria-expanded="menu"
      @click="basculerMenu"
    >
      <UiIcone :nom="menu ? 'croix' : 'menu'" :taille="20" />
    </button>

    <NuxtLink
      class="outils__profil"
      to="/infos"
      :title="`Vue ${definition.nom}`"
      :aria-label="`Vue ${definition.nom} — infos pratiques`"
    >
      <UiIcone :nom="definition.icone" :taille="18" />
    </NuxtLink>
  </nav>
</template>

<style lang="scss" scoped>
.outils {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.15rem;
  padding: 0.35rem;
  background: rgba($noir, 0.82);
  backdrop-filter: blur(18px) saturate(1.4);
  border: 1px solid rgba($blanc, 0.06);
  border-radius: $r-pilule;
  inline-size: fit-content;
  margin-inline-start: auto;

  &__bouton {
    display: grid;
    place-items: center;
    inline-size: 2.5rem;
    block-size: 2.5rem;
    border-radius: 50%;
    color: rgba($blanc, 0.68);
    transition:
      color $vite $courbe,
      background $vite $courbe;

    @include focus-visible;

    &:hover {
      color: $blanc;
      background: rgba($blanc, 0.08);
    }
  }

  &__profil {
    display: grid;
    place-items: center;
    inline-size: 2.5rem;
    block-size: 2.5rem;
    border-radius: 50%;
    background: var(--section-teinte);
    color: $noir;

    @include focus-visible;
  }

  &__flottant {
    position: absolute;
    inset-block-start: calc(100% + 0.5rem);
    inset-inline-end: 0;
    z-index: 30;
  }
}

.menu {
  inline-size: 14rem;
  padding: 0.4rem;
  background: rgba(#141520, 0.96);
  backdrop-filter: blur(24px);
  border: 1px solid rgba($blanc, 0.08);
  border-radius: $r-carte;
  box-shadow: 0 24px 64px -24px rgba(#000, 0.8);

  ul {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    margin: 0;
  }

  &__lien {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    padding: 0.55rem 0.7rem;
    border-radius: $r-champ;
    font-size: 0.85rem;
    color: rgba($blanc, 0.7);
    transition:
      background $vite $courbe,
      color $vite $courbe;

    @include focus-visible;

    &:hover,
    &.router-link-active {
      background: rgba($blanc, 0.06);
      color: $blanc;
    }
  }
}
</style>
