<script setup lang="ts">
// L'en-tête d'une section, commune à toutes ses pages.
//
// Une section n'est pas une page mais un petit site : présentation, agenda,
// actus, rendez-vous. Ce fichier tient ce qui ne change pas d'un onglet à
// l'autre — le bandeau, le nom, les onglets — et « NuxtPage » affiche l'onglet
// en cours. Les adresses déjà partagées continuent de tomber sur la
// présentation, qui est la page d'index de la section.
import { sections } from '~/data/sections'

const { slug, section } = useSectionCourante()

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

const autres = computed(() => sections.filter((s) => s.slug !== slug.value))

useHead(() => ({ title: `${section.value?.nom} — 16e Fleurus` }))
</script>

<template>
  <AppPage
    v-if="section"
    :titre="section.nom"
    :surtitre="section.ages ?? 'Section'"
    :chapo="section.resume"
    :retour="{ to: '/sections', texte: 'Toutes les sections' }"
  >
    <template #entete>
      <div class="bandeau">
        <img :src="section.photo" alt="" class="bandeau__photo" />
        <div class="bandeau__voile" />
        <UiIcone :nom="section.icone" :taille="52" class="bandeau__icone" />
      </div>

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
    </template>

    <NuxtPage />

    <section class="bloc">
      <h2 class="surtitre">Les autres sections</h2>
      <ul class="autres">
        <li v-for="s in autres" :key="s.slug" :data-section="s.slug">
          <NuxtLink class="autres__lien" :to="`/sections/${s.slug}`">
            <UiIcone :nom="s.icone" :taille="18" />
            {{ s.nom }}
          </NuxtLink>
        </li>
      </ul>
    </section>
  </AppPage>
</template>

<style lang="scss" scoped>
.bandeau {
  position: relative;
  block-size: 11rem;
  margin-block: 1.25rem 0.5rem;
  border-radius: $r-carte;
  overflow: hidden;

  &__photo {
    inline-size: 100%;
    block-size: 100%;
    object-fit: cover;
    filter: contrast(1.2) saturate(0.7) brightness(0.5);
  }

  &__voile {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      100deg,
      color-mix(in srgb, var(--section-teinte) 28%, transparent),
      transparent 60%
    );
  }

  &__icone {
    position: absolute;
    inset-block-end: 1.25rem;
    inset-inline-start: 1.25rem;
    color: var(--section-teinte);
  }
}

.onglets {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-block-start: 0.75rem;
  padding-block-end: 0.25rem;

  &__lien {
    padding: 0.5rem 0.9rem;
    border-radius: $r-pilule;
    font-size: 1rem;
    font-weight: 500;
    color: rgba($blanc, 0.62);
    transition:
      background $vite $courbe,
      color $vite $courbe;

    @include focus-visible;

    &:hover {
      background: rgba($blanc, 0.06);
      color: $blanc;
    }

    &--actif {
      background: color-mix(in srgb, var(--section-teinte) 16%, transparent);
      color: var(--section-teinte);
    }
  }
}

.bloc {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.autres {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin: 0;

  &__lien {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.8rem;
    background: rgba($blanc, 0.04);
    border-radius: $r-pilule;
    font-size: 1rem;
    color: var(--section-teinte);
    transition: background $vite $courbe;

    @include focus-visible;
    &:hover {
      background: rgba($blanc, 0.09);
    }
  }
}
</style>
