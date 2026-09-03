<script setup lang="ts">
import { sections } from '~/data/sections'

const { prochaineReunion } = usePlanning()
const { chefsDeSection } = useContenu()
const { voitLeStaff, voitLeCalendrier } = useRole()

useHead({ title: 'Les sections — 16e Fleurus' })
</script>

<template>
  <AppPage
    titre="Six sections, une route, un staff"
    surtitre="L’unité"
    chapo="On entre chez les Nutons à cinq ans et on peut y rester trente ans. Six sections animées se partagent les âges, la Route porte les événements, le staff d’unité coordonne l’ensemble."
  >
    <ul class="grille">
      <li v-for="s in sections" :key="s.slug" :data-section="s.slug">
        <NuxtLink class="tuile" :to="`/sections/${s.slug}`">
          <div class="tuile__photo">
            <img :src="s.photo" :alt="''" loading="lazy" />
          </div>
          <div class="tuile__texte">
            <div class="tuile__haut">
              <UiIcone :nom="s.icone" :taille="20" class="tuile__icone" />
              <h2 class="titre titre--moyen">{{ s.nom }}</h2>
            </div>
            <p v-if="s.ages" class="tuile__ages mono">{{ s.ages }}</p>
            <p class="tuile__resume">{{ s.resume }}</p>
            <p class="tuile__pied mono">
              <template v-if="voitLeStaff">{{ chefsDeSection(s.slug).length }} chefs</template>
              <template v-if="voitLeStaff && voitLeCalendrier && prochaineReunion(s.slug)"> · </template>
              <template v-if="prochaineReunion(s.slug)">
                prochaine réunion&nbsp;: {{ formaterDateCourte(prochaineReunion(s.slug)!.date) }}
              </template>
            </p>
          </div>
        </NuxtLink>
      </li>
    </ul>
  </AppPage>
</template>

<style lang="scss" scoped>
.grille {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  gap: 1rem;
  margin: 0;
}

.tuile {
  display: flex;
  flex-direction: column;
  block-size: 100%;
  background: $ardoise;
  border-radius: $r-carte;
  overflow: hidden;
  transition: transform $normal $courbe;

  @include focus-visible;

  &:hover {
    transform: translateY(-3px);

    .tuile__photo img {
      transform: scale(1.05);
    }
  }

  &__photo {
    aspect-ratio: 16 / 9;
    overflow: hidden;
    background: $noir;

    img {
      inline-size: 100%;
      block-size: 100%;
      object-fit: cover;
      filter: contrast(1.15) saturate(0.75) brightness(0.6);
      transition: transform $lent $courbe;
    }
  }

  &__texte {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    padding: 1rem;
    flex: 1;
  }

  &__haut {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__icone {
    color: var(--section-teinte);
  }

  &__ages {
    font-size: 0.7rem;
    color: var(--section-teinte);
  }

  &__resume {
    flex: 1;
    font-size: 0.82rem;
    line-height: 1.5;
    color: rgba($blanc, 0.66);
  }

  &__pied {
    font-size: 0.68rem;
    color: rgba($blanc, 0.58);
  }
}
</style>
