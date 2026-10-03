<script setup lang="ts">
const { aujourdhui } = usePlanning()
const { voitLesEvenementsInternes } = useRole()
// Déjà filtrée par le serveur : un visiteur ne reçoit que les rendez-vous
// ouverts au dehors.
const { evenements } = useContenu()

const aVenir = computed(() =>
  evenements.value.filter((e) => (e.dateFin ?? e.date) >= aujourdhui.value),
)
const passes = computed(() =>
  evenements.value.filter((e) => (e.dateFin ?? e.date) < aujourdhui.value).reverse(),
)

useHead({ title: 'Les événements — 16e Fleurus' })
</script>

<template>
  <AppPage
    titre="Les rendez-vous de l’année"
    surtitre="Événements"
    chapo="Portes ouvertes, souper dias, marche Adeps, cavalcade. Les dates qui concernent toute l’unité, en plus des réunions du samedi."
    bento
  >
    <UiBloc v-if="!voitLesEvenementsInternes" etiquette="Réservé aux familles">
      <p class="reserve">
        <UiIcone nom="cadenas" :taille="18" />
        <span>
          Seuls les rendez-vous ouverts au public sont affichés. Les temps d’unité, la
          Saint-Nicolas et la veillée de Noël ne concernent que les familles de l’unité.
        </span>
      </p>
    </UiBloc>

    <UiBloc v-if="aVenir.length" :etiquette="`À venir · ${aVenir.length}`" ton="cyan">
      <ul class="cartes">
        <li v-for="e in aVenir" :key="e.slug">
          <UiCarteEvent :e="e" />
        </li>
      </ul>
    </UiBloc>

    <UiBloc v-if="passes.length" :etiquette="`Déjà passés · ${passes.length}`">
      <ul class="cartes">
        <li v-for="e in passes" :key="e.slug">
          <UiCarteEvent :e="e" :resume="false" passe />
        </li>
      </ul>
    </UiBloc>
  </AppPage>
</template>

<style lang="scss" scoped>
.cartes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 24rem), 1fr));
  gap: $esp-2;
  margin: 0;
  padding: 0;
  list-style: none;

  > li {
    display: grid;
  }
}
</style>
