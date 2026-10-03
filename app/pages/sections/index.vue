<script setup lang="ts">
const { sections } = useSections()

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
    bento
  >
    <UiBloc :etiquette="`Les sections · ${sections.length}`">
      <ul class="grille">
        <li v-for="s in sections" :key="s.slug" :data-section="s.slug">
          <NuxtLink class="carte" :to="`/sections/${s.slug}`">
            <div class="carte__photo">
              <img :src="s.photo" alt="" loading="lazy" />
              <span v-if="s.ages" class="carte__ages mono">{{ s.ages }}</span>
            </div>
            <div class="carte__texte">
              <span class="carte__pastille" aria-hidden="true">
                <UiIcone :nom="s.icone" :taille="24" />
              </span>
              <h2 class="carte__nom titre">{{ s.nom }}</h2>
              <p class="carte__resume">{{ s.resume }}</p>
              <p v-if="voitLeStaff || prochaineReunion(s.slug)" class="carte__pied mono">
                <template v-if="voitLeStaff">{{ chefsDeSection(s.slug).length }} chefs</template>
                <template v-if="voitLeStaff && prochaineReunion(s.slug)"> · </template>
                <template v-if="prochaineReunion(s.slug)">
                  prochaine réunion&nbsp;: {{ formaterDateCourte(prochaineReunion(s.slug)!.date) }}
                </template>
              </p>
            </div>
          </NuxtLink>
        </li>
      </ul>
    </UiBloc>
  </AppPage>
</template>

<style lang="scss" scoped>
.grille {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 17rem), 1fr));
  gap: $esp-3;
  margin: 0;
  padding: 0;
  list-style: none;
}

// La carte d'une section : la photo encastrée, la pastille de la section à
// cheval sur son bord bas, le nom en dessous.
.carte {
  position: relative;
  display: flex;
  flex-direction: column;
  block-size: 100%;
  padding: $esp-1;
  background: $ardoise;
  border-radius: $r-carte;
  transition: background $vite $courbe;

  @include focus-visible;

  @media (hover: hover) {
    &:hover {
      background: $ardoise-clair;

      .carte__photo img {
        transform: scale(1.04);
      }
    }
  }

  &__photo {
    position: relative;
    aspect-ratio: 16 / 9;
    overflow: hidden;
    border-radius: calc(#{$r-carte} - #{$esp-1});
    background: $noir;

    img {
      inline-size: 100%;
      block-size: 100%;
      object-fit: cover;
      filter: contrast(1.1) saturate(0.8) brightness(0.65);
      transition: transform $lent $courbe;
    }
  }

  &__ages {
    position: absolute;
    inset-block-start: $esp-2;
    inset-inline-start: $esp-2;
    padding: 0.2rem 0.6rem;
    background: rgba($noir, 0.75);
    border-radius: $r-pilule;
    font-size: 0.72rem;
    color: var(--section-teinte);
  }

  &__pastille {
    // En haut du bloc texte, donc sur le bas de la photo, à moitié dessus.
    position: absolute;
    inset-block-start: 0;
    inset-inline-end: $esp-3;
    display: grid;
    place-items: center;
    inline-size: 3.25rem;
    block-size: 3.25rem;
    border-radius: 50%;
    background: var(--section-teinte);
    color: $noir;
    border: 5px solid $ardoise;
    transform: translateY(-50%);
  }

  &__texte {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    flex: 1;
    padding: $esp-3 $esp-2 $esp-2;
  }

  &__nom {
    margin: 0;
    padding-inline-end: 3.5rem;
    font-size: 1.35rem;
    overflow-wrap: anywhere;
  }

  &__resume {
    flex: 1;
    font-size: 0.95rem;
    line-height: 1.5;
    color: rgba($blanc, 0.7);
  }

  &__pied {
    font-size: 0.75rem;
    color: rgba($blanc, 0.6);
  }
}
</style>
