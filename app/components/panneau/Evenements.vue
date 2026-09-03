<script setup lang="ts">
import { parSlug } from '~/data/sections'

// Le panneau de gauche des maquettes : les trois prochains rendez-vous, puis
// un lien vers la liste complète.
//
// La liste vient de l'API, déjà filtrée selon le compte : un visiteur ne reçoit
// que les rendez-vous ouverts au dehors.

const { aujourdhui } = usePlanning()
const { evenements } = useContenu()
const liste = computed(() => evenements.value)

const prochains = computed(() =>
  liste.value
    .filter((e) => (e.dateFin ?? e.date) >= aujourdhui.value)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3),
)

// Si la saison est finie, on montre quand même les derniers passés plutôt
// qu'un panneau vide.
const aAfficher = computed(() =>
  prochains.value.length ? prochains.value : liste.value.slice(-3).reverse(),
)
const passes = computed(() => prochains.value.length === 0)
</script>

<template>
  <section class="panneau evenements" aria-labelledby="titre-evenements">
    <div class="panneau__entete">
      <h2 id="titre-evenements" class="panneau__titre">
        {{ passes ? 'Derniers events' : 'Prochains events' }}
      </h2>
    </div>

    <ul class="panneau__corps">
      <li v-for="e in aAfficher" :key="e.slug">
        <NuxtLink
          class="carte carte--cliquable"
          :to="`/events/${e.slug}`"
          :data-section="e.section ?? undefined"
        >
          <span class="carte__haut">
            <span class="carte__statut" :class="{ 'carte__statut--passe': passes }" />
            <span class="carte__titre">{{ e.titre }}</span>
            <UiIcone
              :nom="e.section ? parSlug[e.section]!.icone : 'lys'"
              :taille="18"
              class="evenements__icone"
            />
          </span>
          <span class="carte__bas">
            <span class="carte__meta">{{ formaterDate(e.date) }}</span>
            <span class="carte__meta">{{ e.lieu }}</span>
          </span>
        </NuxtLink>
      </li>
    </ul>

    <div class="panneau__pied">
      <NuxtLink class="lien-fleche lien-fleche--droite" to="/events">
        Tous les events
        <UiIcone nom="chevrons-droite" :taille="14" />
      </NuxtLink>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.evenements {
  @include console {
    flex: 1;
    min-block-size: 0;
  }

  &__icone {
    color: var(--section-teinte);
    opacity: 0.85;
  }
}
</style>
