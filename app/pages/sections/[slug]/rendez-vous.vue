<script setup lang="ts">
// Les rendez-vous propres à la section : hikes, week-ends, camp. Les grands
// rendez-vous d'unité gardent leur page, un lien y renvoie en bas.
const { slug, section } = useSectionCourante()
const { evenements } = useContenu()
const { aujourdhui } = usePlanning()

const deLaSection = computed(() => evenements.value.filter((e: any) => e.section === slug.value))
const aVenir = computed(() => deLaSection.value.filter((e: any) => (e.dateFin ?? e.date) >= aujourdhui.value))
const passes = computed(() =>
  deLaSection.value.filter((e: any) => (e.dateFin ?? e.date) < aujourdhui.value).reverse(),
)

useHead(() => ({ title: `Rendez-vous ${section.value?.nom ?? ''} — 16e Fleurus` }))
</script>

<template>
  <div class="bento">
    <UiBloc :etiquette="`À venir · ${aVenir.length}`" ton="section">
      <ul v-if="aVenir.length" class="cartes">
        <li v-for="e in aVenir" :key="e.slug">
          <UiCarteEvent :e="e" />
        </li>
      </ul>
      <p v-else class="doux">
        Aucun rendez-vous propre à la section pour le moment. Le programme des réunions est dans
        l’agenda.
      </p>
      <template #pied>
        <NuxtLink class="lien-fleche" to="/events">
          Les rendez-vous de toute l’unité
          <UiIcone nom="chevrons-droite" :taille="14" />
        </NuxtLink>
      </template>
    </UiBloc>

    <UiBloc v-if="passes.length" :etiquette="`Déjà passés · ${passes.length}`">
      <ul class="cartes">
        <li v-for="e in passes" :key="e.slug">
          <UiCarteEvent :e="e" :resume="false" passe />
        </li>
      </ul>
    </UiBloc>
  </div>
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
