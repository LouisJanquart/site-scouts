<script setup lang="ts">
import { parSlug } from '~/data/sections'

const route = useRoute()
// Déjà filtrée par le serveur : une actu réservée n'arrive pas jusqu'ici pour
// un visiteur, et la page affiche alors la même chose qu'une actu inexistante.
const { actus, chargement } = useContenu()
const actu = computed(() => actus.value.find((a: any) => a.slug === String(route.params.slug)))

useHead(() => ({ title: `${actu.value?.titre} — 16e Fleurus` }))
</script>

<template>
  <AppPage
    v-if="actu"
    :titre="actu.titre"
    :surtitre="formaterDate(actu.date, true)"
    :chapo="actu.chapo"
    :retour="{ to: '/actus', texte: 'Toutes les actus' }"
  >
    <template #entete>
      <div v-if="actu.sections.length" class="etiquettes">
        <span v-for="s in actu.sections" :key="s" class="etiquette" :data-section="s">
          {{ parSlug[s]?.nom ?? s }}
        </span>
      </div>
    </template>

    <div class="prose">
      <p v-for="(p, i) in actu.corps" :key="i">{{ p }}</p>
    </div>

    <p class="brouillon">
      <UiIcone nom="info" :taille="16" />
      Texte rédigé à partir du planning et des comptes rendus de réunion. À relire par le staff
      d’unité avant publication.
    </p>
  </AppPage>
</template>

<style lang="scss" scoped>
.etiquettes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-block-start: 0.75rem;
}

.brouillon {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 0.9rem;
  background: rgba(#f0a32e, 0.08);
  border: 1px solid rgba(#f0a32e, 0.2);
  border-radius: $r-champ;
  color: rgba(#f0a32e, 0.85);
  font-size: 1rem;
  inline-size: fit-content;
}
</style>
