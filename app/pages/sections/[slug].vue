<script setup lang="ts">
// L'en-tête d'une section, commune à toutes ses pages.
//
// Une section n'est pas une page mais un petit site : présentation, agenda,
// actus, rendez-vous. Ce fichier tient ce qui ne change pas d'un onglet à
// l'autre — le bloc d'en-tête, le nom, les onglets — et « NuxtPage » affiche
// l'onglet en cours.
//
// Mise en page bento (03/10/2026) : l'en-tête est un bloc à part entière, la
// photo y est encastrée, le nom de la section déborde sur son bord bas et la
// pastille de la section est posée à cheval sur le coin.

const { slug, section } = useSectionCourante()
const { sections } = useSections()

if (!section.value) {
  throw createError({ statusCode: 404, statusMessage: 'Section inconnue', fatal: true })
}

const route = useRoute()

const onglets = computed(() => [
  { to: `/sections/${slug.value}`, texte: 'Présentation', exact: true },
  { to: `/sections/${slug.value}/agenda`, texte: 'Agenda' },
  { to: `/sections/${slug.value}/actus`, texte: 'Actus' },
  { to: `/sections/${slug.value}/rendez-vous`, texte: 'Rendez-vous' },
])

// « active-class » de NuxtLink marque aussi les parents : la présentation
// resterait allumée sur tous les onglets. On compare donc nous-mêmes.
function estActif(o: { to: string; exact?: boolean }) {
  const ici = route.path.replace(/\/$/, '')
  return o.exact ? ici === o.to : ici.startsWith(o.to)
}

const autres = computed(() => sections.value.filter((s) => s.slug !== slug.value))

const etiquette = computed(() => {
  const s = section.value
  if (!s) return ''
  const genre = s.genre === 'filles' ? 'filles' : s.genre === 'garcons' ? 'garçons' : s.genre === 'mixte' ? 'mixte' : ''
  return [s.ages, genre].filter(Boolean).join(' · ') || 'Section'
})

useHead(() => ({ title: `${section.value?.nom} — 16e Fleurus` }))
</script>

<template>
  <AppPage v-if="section" :titre="section.nom" bento>
    <template #hero>
      <UiTete
        :titre="section.nom"
        :etiquette="etiquette"
        :photo="section.photo"
        :icone="section.icone"
        :retour="{ to: '/sections', texte: 'Toutes les sections' }"
      >
        <p v-if="section.resume" class="resume">{{ section.resume }}</p>
        <nav class="onglets" aria-label="Les pages de la section">
          <NuxtLink
            v-for="o in onglets"
            :key="o.to"
            class="onglets__lien"
            :class="{ 'onglets__lien--actif': estActif(o) }"
            :to="o.to"
            :aria-current="estActif(o) ? 'page' : undefined"
          >
            {{ o.texte }}
          </NuxtLink>
        </nav>
      </UiTete>
    </template>

    <NuxtPage />

    <UiBloc etiquette="Les autres sections">
      <ul class="inventaire">
        <li v-for="s in autres" :key="s.slug" :data-section="s.slug">
          <UiTuile :to="`/sections/${s.slug}`" :icone="s.icone" :libelle="s.nom" :sous="s.ages" />
        </li>
      </ul>
    </UiBloc>
  </AppPage>
</template>

<style lang="scss" scoped>
.resume {
  flex: 1 1 22rem;
  max-inline-size: 36rem;
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.6;
  color: rgba($blanc, 0.76);
}

// Les onglets, rangés dans un puits. Sur téléphone, deux par ligne : avant,
// « Rendez-vous » partait seul sur une deuxième ligne.
.onglets {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.3rem;
  padding: 0.3rem;
  background: $ardoise-sourd;
  border-radius: $r-tuile;
  inline-size: 100%;

  @include depuis($bp-poche) {
    display: flex;
    inline-size: auto;
    border-radius: $r-pilule;
  }

  &__lien {
    padding: 0.7rem 1.1rem;
    border-radius: $r-pilule;
    font-size: 0.95rem;
    font-weight: 500;
    text-align: center;
    white-space: nowrap;
    color: rgba($blanc, 0.7);
    transition:
      background $vite $courbe,
      color $vite $courbe;

    @include focus-visible;

    @media (hover: hover) {
      &:hover {
        color: $blanc;
      }
    }

    &--actif {
      background: $ardoise;
      color: var(--section-teinte);
      font-weight: 600;
    }
  }
}
</style>
