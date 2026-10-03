<script setup lang="ts">
// Les actus, en bulles signées : qui parle, et de quoi.
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
    bento
  >
    <UiBloc :etiquette="`Les actus · ${liste.length}`">
      <ul class="bulles">
        <li v-for="a in liste" :key="a.slug">
          <UiBulleActu :a="a" />
        </li>
      </ul>
      <p class="doux note">
        Vue « {{ definition.nom }} ». Certaines annonces ne s’affichent que pour les parents, les
        animés ou les chefs.
      </p>
    </UiBloc>
  </AppPage>
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
