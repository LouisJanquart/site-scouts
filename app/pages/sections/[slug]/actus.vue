<script setup lang="ts">
// Les actus qui concernent la section, filtrées sur ses étiquettes. Une actu
// d'unité porte toutes les sections : elle apparaît donc ici aussi, ce qui est
// voulu — un parent de Lutins veut lire « le souper est déplacé ».
const { slug, section } = useSectionCourante()
const { actus } = useContenu()
const { definition } = useRole()

const liste = computed(() => actus.value.filter((a: any) => a.sections?.includes(slug.value)))

useHead(() => ({ title: `Actus ${section.value?.nom ?? ''} — 16e Fleurus` }))
</script>

<template>
  <section class="bloc">
    <h2 class="surtitre">Les actus de la section</h2>

    <ul v-if="liste.length" class="liste">
      <li v-for="a in liste" :key="a.slug">
        <NuxtLink class="actu" :to="`/actus/${a.slug}`">
          <h3 class="titre titre--moyen">{{ a.titre }}</h3>
          <p class="actu__chapo">{{ a.chapo }}</p>
          <p class="actu__date mono">{{ formaterDate(a.date, true) }}</p>
        </NuxtLink>
      </li>
    </ul>

    <p v-else class="doux">
      Rien pour cette section pour l’instant. Les annonces de l’unité restent sur la page des
      actus.
    </p>

    <NuxtLink class="lien-fleche" to="/actus">
      Toutes les actus de l’unité
      <UiIcone nom="chevrons-droite" :taille="14" />
    </NuxtLink>

    <p class="doux note">
      Vue « {{ definition.nom }} ». Certaines annonces ne s’affichent que pour les parents, les
      animés ou les chefs.
    </p>
  </section>
</template>

<style lang="scss" scoped>
.bloc {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

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

  &__chapo {
    font-size: 1rem;
    line-height: 1.55;
    color: rgba($blanc, 0.72);
  }

  &__date {
    font-size: 0.75rem;
    color: rgba($blanc, 0.55);
  }
}

.note {
  font-size: 0.75rem;
}
</style>
