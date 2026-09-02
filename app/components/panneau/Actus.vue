<script setup lang="ts">
import { parSlug } from '~/data/sections'
import { actusVisibles } from '~/data/actus'

// Le panneau de droite : les actus visibles pour le rôle courant, avec leurs
// étiquettes de section, séparées par des filets fins comme dans la maquette.

const { role } = useRole()
const liste = computed(() => actusVisibles(role.value).slice(0, 4))
</script>

<template>
  <section class="panneau actus" aria-labelledby="titre-actus">
    <div class="panneau__entete">
      <h2 id="titre-actus" class="panneau__titre">Actus</h2>
    </div>

    <ul class="panneau__corps actus__liste">
      <li v-for="a in liste" :key="a.slug" class="actus__item">
        <NuxtLink :to="`/actus/${a.slug}`" class="actus__lien">
          <span v-if="a.sections.length" class="actus__etiquettes">
            <span
              v-for="s in a.sections.slice(0, 3)"
              :key="s"
              class="etiquette"
              :data-section="s"
            >{{ parSlug[s]?.nom ?? s }}</span>
            <span v-if="a.sections.length > 3" class="etiquette etiquette--sourde">
              +{{ a.sections.length - 3 }}
            </span>
          </span>
          <span class="actus__titre">{{ a.titre }}</span>
          <span class="actus__date mono">{{ formaterDate(a.date, true) }}</span>
        </NuxtLink>
      </li>
    </ul>

    <div class="panneau__pied">
      <NuxtLink class="lien-fleche lien-fleche--droite" to="/actus">
        Toutes les actus
        <UiIcone nom="chevrons-droite" :taille="14" />
      </NuxtLink>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.actus {
  @include console {
    block-size: 100%;
  }

  &__liste {
    gap: 0;
  }

  &__item + &__item {
    border-block-start: 1px solid rgba($blanc, 0.08);
  }

  &__lien {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    padding: 0.85rem 0.5rem;
    border-radius: $r-champ;

    @include focus-visible;

    &:hover .actus__titre {
      color: $cyan;
    }
  }

  &__etiquettes {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  &__titre {
    font-size: 0.9rem;
    font-weight: 600;
    line-height: 1.35;
    transition: color $vite $courbe;
  }

  &__date {
    font-size: 0.68rem;
    color: rgba($blanc, 0.6);
  }
}
</style>
