<script setup lang="ts">
import { parSlug } from '~/data/sections'

const { definition } = useRole()
const { actus } = useContenu()
const liste = computed(() => actus.value)

useHead({ title: 'Les actus — 16e Fleurus' })
</script>

<template>
  <AppPage
    titre="Ce qui bouge dans l’unité"
    surtitre="Actus"
    chapo="Les annonces qui ne tiennent pas dans un calendrier : changements d’horaire, appels à volontaires, comptes rendus."
  >
    <ul class="liste">
      <li v-for="a in liste" :key="a.slug">
        <NuxtLink class="actu" :to="`/actus/${a.slug}`">
          <span v-if="a.sections.length" class="actu__etiquettes">
            <span v-for="s in a.sections.slice(0, 4)" :key="s" class="etiquette" :data-section="s">
              {{ parSlug[s]?.nom ?? s }}
            </span>
            <span v-if="a.sections.length > 4" class="etiquette etiquette--sourde">
              +{{ a.sections.length - 4 }}
            </span>
          </span>
          <h2 class="titre titre--moyen">{{ a.titre }}</h2>
          <p class="actu__chapo">{{ a.chapo }}</p>
          <p class="actu__date mono">{{ formaterDate(a.date, true) }}</p>
        </NuxtLink>
      </li>
    </ul>

    <p class="doux note">
      Vue « {{ definition.nom }} ». Certaines annonces ne s’affichent que pour les parents, les
      animés ou les chefs.
    </p>
  </AppPage>
</template>

<style lang="scss" scoped>
.liste {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0;
}

.actu {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
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

  &__etiquettes {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  &__chapo {
    font-size: 0.9rem;
    line-height: 1.55;
    color: rgba($blanc, 0.68);
    max-inline-size: 48rem;
  }

  &__date {
    font-size: 0.7rem;
    color: rgba($blanc, 0.58);
  }
}

.note {
  font-size: 0.8rem;
}
</style>
