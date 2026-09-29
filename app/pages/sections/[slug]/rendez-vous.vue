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
  <section class="bloc">
    <h2 class="surtitre">À venir</h2>

    <ul v-if="aVenir.length" class="liste">
      <li v-for="e in aVenir" :key="e.slug">
        <NuxtLink class="event" :to="`/events/${e.slug}`">
          <span class="event__date mono">
            {{ formaterDate(e.date, true) }}
            <template v-if="e.dateFin"> → {{ formaterDate(e.dateFin, true) }}</template>
          </span>
          <h3 class="titre titre--moyen">{{ e.titre }}</h3>
          <p class="event__resume">{{ e.resume }}</p>
          <span class="event__lieu doux">
            <UiIcone nom="lieu" :taille="14" />
            {{ e.lieu }}
          </span>
        </NuxtLink>
      </li>
    </ul>

    <p v-else class="doux">
      Aucun rendez-vous propre à la section pour le moment. Le programme des réunions est dans
      l’agenda.
    </p>

    <template v-if="passes.length">
      <h2 class="surtitre surtitre--espace">Déjà passés</h2>
      <ul class="liste liste--passe">
        <li v-for="e in passes" :key="e.slug">
          <NuxtLink class="event" :to="`/events/${e.slug}`">
            <span class="event__date mono">{{ formaterDate(e.date, true) }}</span>
            <h3 class="titre titre--moyen">{{ e.titre }}</h3>
          </NuxtLink>
        </li>
      </ul>
    </template>

    <NuxtLink class="lien-fleche" to="/events">
      Les rendez-vous de toute l’unité
      <UiIcone nom="chevrons-droite" :taille="14" />
    </NuxtLink>
  </section>
</template>

<style lang="scss" scoped>
.bloc {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.surtitre--espace {
  margin-block-start: 1rem;
}

.liste {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0;

  &--passe {
    opacity: 0.72;
  }
}

.event {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 1.15rem 1.25rem;
  background: $ardoise;
  border-radius: $r-carte;
  transition:
    background $vite $courbe,
    transform $vite $courbe;

  @include focus-visible;

  &:hover {
    background: $ardoise-clair;
    transform: translateX(2px);
  }

  &__date {
    font-size: 0.75rem;
    color: var(--section-teinte);
    text-transform: capitalize;
  }

  &__resume {
    font-size: 1rem;
    line-height: 1.55;
    color: rgba($blanc, 0.72);
  }

  &__lieu {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.75rem;
  }
}
</style>
