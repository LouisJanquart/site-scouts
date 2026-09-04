<script setup lang="ts">
// La pilule en haut à droite des maquettes : recherche, menu, profil.
// La recherche fonctionne réellement (elle balaie sections, événements, actus,
// questions pratiques et les 96 dates du planning).

const { voitLeCalendrier } = useRole()
const { moi, charger, connecte, estStaff, nomAffiche, seDeconnecter } = useCompte()
const recherche = ref(false)
const menu = ref(false)
const compte = ref(false)

// Les initiales tiennent lieu d'avatar tant qu'on n'a pas de photo de profil.
const initiales = computed(() => {
  const m = moi.value
  if (!m?.connecte) return ''
  return `${m.prenom?.[0] ?? ''}${m.nom?.[0] ?? ''}`.toUpperCase()
})

// On ne demande « qui es-tu ? » qu'une fois le navigateur en main : les pages
// publiques sont fabriquées à l'avance et ne doivent pas dépendre d'un compte.
onMounted(() => charger())

const toutesLesEntrees = [
  { to: '/calendrier', nom: 'Calendrier', icone: 'calendrier', reserve: true },
  { to: '/sections', nom: 'Sections', icone: 'lys' },
  { to: '/events', nom: 'Événements', icone: 'tente' },
  { to: '/actus', nom: 'Actus', icone: 'document' },
  { to: '/photos', nom: 'Photos', icone: 'photo' },
  { to: '/documents', nom: 'Documents', icone: 'cadenas' },
  { to: '/infos', nom: 'Infos pratiques', icone: 'info' },
  { to: '/a-propos', nom: 'À propos', icone: 'bouclier' },
]

const entrees = computed(() => {
  const liste = toutesLesEntrees.filter((e) => !e.reserve || voitLeCalendrier.value)
  return [
    ...liste,
    { to: '/inscription', nom: 'Inscrire un enfant', icone: 'plus' },
    connecte.value
      ? { to: '/mon-espace', nom: 'Mon espace', icone: 'profil' }
      : { to: '/connexion', nom: 'Se connecter', icone: 'cadenas' },
    ...(estStaff.value ? [{ to: '/staff', nom: 'Back office', icone: 'bouclier' }] : []),
  ]
})

const route = useRoute()
watch(() => route.fullPath, () => {
  menu.value = false
  recherche.value = false
  compte.value = false
})

function nEnOuvrirQuUn(lequel: 'menu' | 'recherche' | 'compte') {
  menu.value = lequel === 'menu' ? !menu.value : false
  recherche.value = lequel === 'recherche' ? !recherche.value : false
  compte.value = lequel === 'compte' ? !compte.value : false
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
      @click="nEnOuvrirQuUn('recherche')"
    >
      <UiIcone nom="recherche" :taille="20" />
    </button>

    <NuxtLink
      v-if="voitLeCalendrier"
      class="outils__bouton"
      to="/calendrier"
      aria-label="Calendrier de la saison"
    >
      <UiIcone nom="calendrier" :taille="20" />
    </NuxtLink>

    <button
      class="outils__bouton"
      type="button"
      aria-label="Menu"
      :aria-expanded="menu"
      @click="nEnOuvrirQuUn('menu')"
    >
      <UiIcone :nom="menu ? 'croix' : 'menu'" :taille="20" />
    </button>

    <!-- Le compte. Déconnecté, c'est un lien direct vers la connexion : rien à
         déplier, il n'y a qu'une chose à faire. Connecté, c'est un menu — le
         nom, l'espace, le back office s'il y a lieu, et la déconnexion, qui doit
         être atteignable de partout et pas seulement depuis une page perdue. -->
    <NuxtLink
      v-if="!connecte"
      class="outils__profil"
      to="/connexion"
      aria-label="Se connecter"
      title="Se connecter"
    >
      <UiIcone nom="cadenas" :taille="18" />
    </NuxtLink>

    <button
      v-else
      class="outils__profil outils__profil--connecte"
      type="button"
      :aria-label="`Compte de ${nomAffiche}`"
      :aria-expanded="compte"
      :title="nomAffiche"
      @click="nEnOuvrirQuUn('compte')"
    >
      <span aria-hidden="true">{{ initiales }}</span>
    </button>

    <div v-if="compte && connecte" class="outils__flottant menu menu--compte">
      <p class="menu__qui">
        <span class="menu__nom">{{ nomAffiche }}</span>
        <span class="menu__email mono">{{ moi?.email }}</span>
      </p>
      <ul>
        <li>
          <NuxtLink class="menu__lien" to="/mon-espace">
            <UiIcone nom="profil" :taille="18" />
            Mon espace
          </NuxtLink>
        </li>
        <li v-if="estStaff">
          <NuxtLink class="menu__lien" to="/staff">
            <UiIcone nom="lys" :taille="18" />
            Back office
          </NuxtLink>
        </li>
        <li>
          <button class="menu__lien menu__lien--sortie" type="button" @click="seDeconnecter()">
            <UiIcone nom="sortie" :taille="18" />
            Se déconnecter
          </button>
        </li>
      </ul>
    </div>
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
  justify-content: space-evenly;

  // Dans l'entaille du coin supérieur droit, la barre en prend toute la largeur
  // et les icônes s'y répartissent, comme dans la maquette.
  @include console {
    inline-size: 100%;
  }

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

    // Connecté, la pastille porte les initiales : c'est le seul endroit de
    // l'interface qui dit à qui appartient la session en cours.
    &--connecte {
      font-family: $police-titre;
      font-weight: 800;
      font-size: 1rem;
      letter-spacing: 0.02em;
    }
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

  &--compte {
    inline-size: 15rem;
  }

  &__qui {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    padding: 0.6rem 0.7rem 0.7rem;
    margin: 0 0 0.3rem;
    border-block-end: 1px solid rgba($blanc, 0.08);
  }

  &__nom {
    font-weight: 600;
    font-size: 1rem;
    color: $blanc;
  }

  &__email {
    font-size: 0.75rem;
    color: rgba($blanc, 0.5);
    overflow-wrap: anywhere;
  }
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
    font-size: 1rem;
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

    // La déconnexion est un bouton, pas un lien : elle change l'état du
    // serveur. Elle prend toute la largeur comme les autres entrées.
    &--sortie {
      inline-size: 100%;
      text-align: start;
    }
  }
}
</style>
