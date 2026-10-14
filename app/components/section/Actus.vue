<script setup lang="ts">
// La rubrique actus : la plus récente à la une, sur photo, deux à côté, et le
// fil de la saison qui défile en bas. Les actus de la section d'abord, puis
// celles de toute l'unité.
import type { CompositionSpec } from '~/utils/bento'
import type { Section } from '~/data/sections'

const props = defineProps<{ section: Section; numero: string }>()

const { actus } = useContenu()

const PHOTOS = [
  '/images/camp-constructions.jpg',
  '/images/foret-sentier.jpg',
  '/images/camp-prairie.jpg',
  '/images/foret-lumiere.jpg',
  '/images/foret-brume.jpg',
  '/images/camp-crepuscule.jpg',
]

const liste = computed(() => {
  const toutes = [...actus.value].sort((a: any, b: any) => (b.date ?? '').localeCompare(a.date ?? ''))
  const siennes = toutes.filter((a: any) => a.sections?.includes(props.section.slug))
  const unite = toutes.filter((a: any) => !a.sections?.length)
  return [...siennes, ...unite.filter((a) => !siennes.includes(a))].map((a: any, i: number) => ({
    ...a,
    photo: a.photo ?? PHOTOS[i % PHOTOS.length],
    deLaSection: a.sections?.includes(props.section.slug),
  }))
})
const une = computed(() => liste.value[0] ?? null)
const cote = computed(() => liste.value.slice(1, 3))
const fil = computed(() => liste.value.slice(3))

const spec: CompositionSpec = {
  lignes: {
    v: [[0.524, 0], [0.488, 0.66]],
    hr: [[0.5, 0.265], [1, 0.292]],
    h: [[0, 0.648], [1, 0.672]],
  },
  zones: {
    une: { coins: [['gauche', 0, 'haut', 0], ['v', -1, 'haut', 0], ['v', -1, 'h', -1], ['gauche', 0, 'h', -1]] },
    a2: { coins: [['v', 1, 'haut', 0], ['droite', 0, 'haut', 0], ['droite', 0, 'hr', -1], ['v', 1, 'hr', -1]] },
    a3: { coins: [['v', 1, 'hr', 1], ['droite', 0, 'hr', 1], ['droite', 0, 'h', -1], ['v', 1, 'h', -1]] },
    fil: { coins: [['gauche', 0, 'h', 1], ['droite', 0, 'h', 1], ['droite', 0, 'bas', 0], ['gauche', 0, 'bas', 0]] },
  },
}
</script>

<template>
  <BentoComposition
    :spec="spec"
    :fonds="une ? { une: { image: une.photo, voile: 'bas' } } : {}"
    :marge="[26, 36]"
  >
    <template #une>
      <p class="rub-surtitre une__surtitre">Rubrique {{ numero }} · les actus</p>
      <div v-if="une" class="une">
        <span class="une__etiquette mono">À la une · {{ formaterDateCourte(une.date) }}</span>
        <h2 class="une__titre">{{ une.titre }}</h2>
        <p v-if="une.chapo" class="une__chapo">{{ une.chapo }}</p>
        <NuxtLink class="rub-bouton rub-bouton--plein" :to="`/actus/${une.slug}`">Lire l’actu</NuxtLink>
      </div>
      <p v-else class="rub-texte">Pas encore d’actu cette saison.</p>
    </template>

    <template #a2>
      <NuxtLink v-if="cote[0]" class="cote" :to="`/actus/${cote[0].slug}`">
        <span class="cote__texte">
          <span class="cote__date mono">{{ formaterDate(cote[0].date) }}</span>
          <span class="cote__titre">{{ cote[0].titre }}</span>
          <span v-if="cote[0].chapo" class="cote__chapo">{{ cote[0].chapo }}</span>
        </span>
        <img class="cote__photo" :src="cote[0].photo" alt="" loading="lazy" />
      </NuxtLink>
      <NuxtLink v-else class="lien-fleche" to="/actus">
        Toutes les actus de l’unité <UiIcone nom="chevrons-droite" :taille="14" />
      </NuxtLink>
    </template>
    <template #a3>
      <NuxtLink v-if="cote[1]" class="cote" :to="`/actus/${cote[1].slug}`">
        <span class="cote__texte">
          <span class="cote__date mono">{{ formaterDate(cote[1].date) }}</span>
          <span class="cote__titre">{{ cote[1].titre }}</span>
          <span v-if="cote[1].chapo" class="cote__chapo">{{ cote[1].chapo }}</span>
        </span>
        <img class="cote__photo" :src="cote[1].photo" alt="" loading="lazy" />
      </NuxtLink>
      <NuxtLink v-else class="lien-fleche" to="/actus">
        Toutes les actus de l’unité <UiIcone nom="chevrons-droite" :taille="14" />
      </NuxtLink>
    </template>

    <template #fil>
      <BentoPiste
        v-if="fil.length"
        titre="Le fil de la saison"
        :total="fil.length"
        etiquette-liste="Les actus plus anciennes"
        class="fil"
      >
        <li v-for="a in fil" :key="a.slug">
          <NuxtLink class="vignette" :to="`/actus/${a.slug}`">
            <img :src="a.photo" alt="" loading="lazy" />
            <span class="vignette__texte">
              <span class="vignette__date mono">{{ formaterDateCourte(a.date) }}</span>
              <span class="vignette__titre">{{ a.titre }}</span>
            </span>
          </NuxtLink>
        </li>
      </BentoPiste>
      <div v-else class="fil-vide">
        <p class="rub-surtitre">Le fil de la saison</p>
        <NuxtLink class="lien-fleche" to="/actus">
          Toutes les actus de l’unité <UiIcone nom="chevrons-droite" :taille="14" />
        </NuxtLink>
      </div>
    </template>
  </BentoComposition>
</template>

<style lang="scss" scoped>
.une__surtitre {
  color: $blanc;
}
.une {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: $esp-2;
  margin-block-start: auto;

  &__etiquette {
    padding: 0.3rem 0.8rem;
    border-radius: $r-pilule;
    background: var(--section-teinte);
    color: $noir-profond;
    font-size: 0.7rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  &__titre {
    margin: 0;
    max-inline-size: 22ch;
    font-family: $police-titre;
    font-weight: 800;
    font-variation-settings: 'wdth' 118;
    font-size: clamp(1.6rem, 2.4vw, 2.2rem);
    line-height: 1.05;
    text-transform: uppercase;
    text-wrap: balance;
    @include sur-photo;
  }

  &__chapo {
    margin: 0;
    max-inline-size: 48ch;
    font-size: 0.92rem;
    line-height: 1.5;
    @include sur-photo;
  }
}

.cote {
  display: flex;
  align-items: center;
  gap: $esp-4;
  block-size: 100%;
  @include focus-visible;

  &__texte {
    flex: 1;
    min-inline-size: 0;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  &__date {
    font-size: 0.7rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba($blanc, 0.6);
  }

  &__titre {
    font-size: 1.05rem;
    font-weight: 600;
    line-height: 1.3;
  }

  &__chapo {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    font-size: 0.82rem;
    color: rgba($blanc, 0.64);
  }

  &__photo {
    flex: none;
    inline-size: 6.5rem;
    block-size: 6.5rem;
    border-radius: 1.25rem;
    object-fit: cover;
  }

  &:hover .cote__titre {
    color: var(--section-teinte);
  }
}

.fil {
  --marge-droite: 36px;
  block-size: 100%;
}

.vignette {
  display: flex;
  inline-size: 18.5rem;
  block-size: 100%;
  min-block-size: 7rem;
  border-radius: 1.25rem;
  background: $ardoise;
  overflow: hidden;
  @include focus-visible;

  img {
    flex: none;
    inline-size: 7rem;
    object-fit: cover;
  }

  &__texte {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    padding: 1rem;
  }

  &__date {
    font-size: 0.7rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba($blanc, 0.6);
  }

  &__titre {
    font-size: 0.92rem;
    font-weight: 600;
    line-height: 1.3;
  }

  &:hover {
    background: $ardoise-clair;
  }
}

.fil-vide {
  display: flex;
  flex-direction: column;
  gap: $esp-2;
}
</style>
