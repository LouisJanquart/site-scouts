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
  <UiBloc :etiquette="`Les actus · ${liste.length}`">
    <ul v-if="liste.length" class="bulles">
      <li v-for="a in liste" :key="a.slug">
        <UiBulleActu :a="a" />
      </li>
    </ul>

    <p v-else class="doux">
      Rien pour cette section pour l’instant. Les annonces de l’unité restent sur la page des
      actus.
    </p>

    <p class="doux note">
      Vue « {{ definition.nom }} ». Certaines annonces ne s’affichent que pour les parents, les
      animés ou les chefs.
    </p>

    <template #pied>
      <NuxtLink class="lien-fleche" to="/actus">
        Toutes les actus de l’unité
        <UiIcone nom="chevrons-droite" :taille="14" />
      </NuxtLink>
    </template>
  </UiBloc>
</template>

<style lang="scss" scoped>
.bulles {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 20rem), 1fr));
  gap: $esp-4 $esp-3;
  margin: 0;
  padding: 0;
  list-style: none;

  > li {
    display: grid;
  }
}

.note {
  font-size: 0.8rem;
}
</style>
