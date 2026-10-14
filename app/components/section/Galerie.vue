<script setup lang="ts">
// La rubrique galerie : les albums de la section, en photos papier empilées
// qui défilent de côté.
//
// Le stockage des photos n'est pas encore tranché (lot 5) : en attendant, la
// rubrique montre les trois familles d'albums à venir, sans inventer d'album.
import type { CompositionSpec } from '~/utils/bento'
import type { Section } from '~/data/sections'

defineProps<{ section: Section; numero: string }>()

const { voitLesPhotos } = useRole()

const albums = [
  { titre: 'Le camp', sous: 'Chaque été', photos: ['/images/camp-prairie-large.jpg', '/images/camp-prairie.jpg', '/images/camp-crepuscule.jpg'], r: -2 },
  { titre: 'Les week-ends', sous: 'Hikes et sorties', photos: ['/images/camp-constructions.jpg', '/images/foret-clairiere.jpg', '/images/foret-sentier.jpg'], r: 1.5 },
  { titre: 'Les samedis', sous: 'Réunions au local', photos: ['/images/foret-lumiere.jpg', '/images/foret-brume.jpg', '/images/camp-prairie-large.jpg'], r: -1 },
]

const spec: CompositionSpec = {
  lignes: {
    v: [[0.314, 0], [0.3445, 1]],
    h: [[0, 0.518], [0.34, 0.548]],
  },
  zones: {
    intro: { coins: [['gauche', 0, 'haut', 0], ['v', -1, 'haut', 0], ['v', -1, 'h', -1], ['gauche', 0, 'h', -1]] },
    acces: { coins: [['gauche', 0, 'h', 1], ['v', -1, 'h', 1], ['v', -1, 'bas', 0], ['gauche', 0, 'bas', 0]] },
    albums: { coins: [['v', 1, 'haut', 0], ['droite', 0, 'haut', 0], ['droite', 0, 'bas', 0], ['v', 1, 'bas', 0]] },
  },
}
</script>

<template>
  <BentoComposition :spec="spec" :marge="[30, 36]">
    <template #intro>
      <p class="rub-surtitre">Rubrique {{ numero }} · la galerie</p>
      <h2 class="rub-titre">La galerie</h2>
      <p class="rub-texte intro__texte">
        Les photos des réunions, des week-ends et du camp, rangées par album. Les premiers albums
        arrivent bientôt.
      </p>
    </template>

    <template #acces>
      <UiIcone nom="profil" :taille="24" class="acces__icone" />
      <p class="acces__titre">Réservé aux familles</p>
      <p class="rub-texte">
        {{
          voitLesPhotos
            ? 'Les albums de la section se verront ici, avec le compte de la famille.'
            : 'Les albums se voient une fois connecté, avec le compte de la famille.'
        }}
      </p>
      <NuxtLink v-if="!voitLesPhotos" class="rub-bouton acces__bouton" to="/connexion">Se connecter</NuxtLink>
    </template>

    <template #albums>
      <BentoPiste titre="Les albums" respiration="1.5rem" etiquette-liste="Les albums" class="albums">
        <li v-for="a in albums" :key="a.titre" class="album" :style="{ '--r': `${a.r}deg` }">
          <span class="album__feuille album__feuille--2" aria-hidden="true">
            <img :src="a.photos[2]" alt="" loading="lazy" />
          </span>
          <span class="album__feuille album__feuille--1" aria-hidden="true">
            <img :src="a.photos[1]" alt="" loading="lazy" />
          </span>
          <span class="album__dessus">
            <img :src="a.photos[0]" alt="" loading="lazy" />
            <span class="album__titre">{{ a.titre }}</span>
            <span class="album__pied">
              <span>{{ a.sous }}</span>
              <span class="album__bientot mono">Bientôt</span>
            </span>
          </span>
        </li>
      </BentoPiste>
    </template>
  </BentoComposition>
</template>

<style lang="scss" scoped>
.intro__texte {
  margin-block-start: $esp-3;
}
.acces__icone {
  color: var(--section-teinte);
}
.acces__titre {
  margin: $esp-3 0 $esp-1;
  font-weight: 600;
  font-size: 1.05rem;
}
.acces__bouton {
  margin-block-start: $esp-3;
}

.albums {
  --marge-droite: 36px;
  block-size: 100%;
}

.album {
  position: relative;
  inline-size: 15rem;
  block-size: min(100%, 22rem);
  transform: rotate(var(--r));

  &__feuille,
  &__dessus {
    position: absolute;
    inset: 0;
    padding: 0.6rem;
    border-radius: 0.6rem;
    background: $ardoise-clair;
  }

  &__feuille {
    opacity: 0.85;

    img {
      filter: brightness(0.7) saturate(0.7);
    }

    &--2 {
      transform: translateX(0.9rem) rotate(6deg);
    }
    &--1 {
      transform: translateX(-0.6rem) rotate(-5deg);
    }
  }

  &__dessus {
    display: flex;
    flex-direction: column;
    background: $ardoise;
    box-shadow: 0 14px 28px rgba(#000, 0.5);
  }

  img {
    display: block;
    inline-size: 100%;
    block-size: 75%;
    border-radius: 0.4rem;
    object-fit: cover;
  }

  &__titre {
    margin-block-start: 0.7rem;
    padding-inline: 0.25rem;
    font-weight: 600;
    font-size: 0.95rem;
  }

  &__pied {
    display: flex;
    justify-content: space-between;
    padding-inline: 0.25rem;
    font-size: 0.78rem;
    color: rgba($blanc, 0.6);
  }

  &__bientot {
    font-size: 0.66rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--section-teinte);
  }
}
</style>
