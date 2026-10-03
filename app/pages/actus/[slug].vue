<script setup lang="ts">
import { parSlug } from '~/data/sections'

const route = useRoute()
// Déjà filtrée par le serveur : une actu réservée n'arrive pas jusqu'ici pour
// un visiteur, et la page affiche alors la même chose qu'une actu inexistante.
const { actus } = useContenu()
const actu = computed(() => actus.value.find((a: any) => a.slug === String(route.params.slug)))
const uneSection = computed(() => (actu.value?.sections.length === 1 ? actu.value.sections[0] : null))

useHead(() => ({ title: `${actu.value?.titre} — 16e Fleurus` }))
</script>

<template>
  <AppPage v-if="actu" :titre="actu.titre" bento>
    <template #hero>
      <UiTete
        :titre="actu.titre"
        :etiquette="majuscule(formaterDate(actu.date, true))"
        :icone="uneSection ? parSlug[uneSection]?.icone : 'lys'"
        :retour="{ to: '/actus', texte: 'Toutes les actus' }"
        :data-section="uneSection ?? undefined"
      >
        <p v-if="actu.chapo" class="chapo">{{ actu.chapo }}</p>
        <div v-if="actu.sections.length" class="etiquettes">
          <span v-for="s in actu.sections" :key="s" class="etiquette" :data-section="s">
            {{ parSlug[s]?.nom ?? s }}
          </span>
        </div>
      </UiTete>
    </template>

    <UiBloc etiquette="L’annonce">
      <div class="prose">
        <p v-for="(p, i) in actu.corps" :key="i">{{ p }}</p>
      </div>
      <p v-if="actu.aRelire" class="brouillon">
        <UiIcone nom="info" :taille="16" />
        Texte rédigé à partir du planning et des comptes rendus de réunion. À relire par le staff
        d’unité avant publication.
      </p>
    </UiBloc>
  </AppPage>
</template>

<style lang="scss" scoped>
.chapo {
  flex: 1 1 100%;
  max-inline-size: 40rem;
  margin: 0;
  font-size: 1.1rem;
  line-height: 1.6;
  color: rgba($blanc, 0.78);
}

.etiquettes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.brouillon {
  display: flex;
  align-items: flex-start;
  gap: $esp-1;
  max-inline-size: 60ch;
  padding: $esp-2 $esp-3;
  background: rgba(#f0a32e, 0.08);
  border: 1px solid rgba(#f0a32e, 0.2);
  border-radius: $r-champ;
  color: rgba(#f0a32e, 0.9);
  line-height: 1.5;

  svg {
    flex: none;
    margin-block-start: 0.2rem;
  }
}
</style>
