<script setup lang="ts">
import { parSlug } from '~/data/sections'

// Le panneau de droite : les actus auxquelles le compte a droit, avec leurs
// étiquettes de section, séparées par des filets fins comme dans la maquette.
//
// Le filtrage ne se fait plus ici mais sur le serveur : les actus réservées ne
// sont jamais envoyées au navigateur d'un visiteur.

const { actus } = useContenu()
const liste = computed(() => actus.value.slice(0, 4))
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
  // Relevé sur Desktop-7 : le panneau des actus est en gris 2, pas en noir, il
  // est posé SUR la photo et il est à fleur de son bord droit — d'où deux coins
  // arrondis seulement, les deux de gauche. Les deux autres n'existent pas :
  // ils sont sur l'arête du panneau.
  @include console {
    background: $ardoise;
    border-start-start-radius: $r-panneau;
    border-end-start-radius: $r-panneau;
    border-start-end-radius: 0;
    border-end-end-radius: 0;
    padding: 2rem;
  }

  &__liste {
    gap: 0;

    // Sur grand écran le panneau a une hauteur fixe : la dernière actu qui ne
    // tient pas s'efface en fondu au lieu d'être coupée net au milieu d'une
    // ligne.
    @include console {
      mask-image: linear-gradient(180deg, #000 calc(100% - 3rem), transparent);
      padding-block-end: 2rem;
    }
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
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.35;
    transition: color $vite $courbe;
  }

  &__date {
    font-size: 0.75rem;
    color: rgba($blanc, 0.6);
  }
}
</style>
