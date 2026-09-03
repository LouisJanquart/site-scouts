<script setup lang="ts">
import { sections } from '~/data/sections'
import { unite } from '~/data/unite'
import { evenementPublicDuJour } from '~/data/evenements'

// L'accueil reprend l'écran Desktop-7 des maquettes : une photo plein cadre, le
// logotype par-dessus, et un encart incrusté en bas à gauche. L'illustration
// manga est remplacée par une photo de camp.
//
// Deux points de forme repris de la maquette :
//   - l'encart n'est pas un rectangle : son bord droit est une longue pente,
//     avec des joints arrondis (voir le clipPath « forme-encart » ci-dessous) ;
//   - c'est lui, et pas le calendrier de gauche, qui décrit le jour choisi.

const jour = useJourAffiche()
const selection = useJourSelectionne()
const { aujourdhui } = usePlanning()
const { meteoPour } = useMeteo()
const { voitLeCalendrier } = useRole()

const meteo = computed(() => meteoPour(jour.value?.date))

const horaire = computed(() =>
  jour.value?.horaire === 'hiver' ? '14h00 – 17h00' : '14h00 – 17h30',
)

const sectionsDuJour = computed(() =>
  sections
    .filter((s) => s.cleplanning && jour.value?.sections[s.cleplanning])
    .map((s) => ({ s, entree: jour.value!.sections[s.cleplanning!]! })),
)

// Un visiteur ne voit un intitulé d'événement que s'il s'agit d'un rendez-vous
// ouvert au dehors. Les Saint-Nicolas et veillées de Noël ne le regardent pas.
const evenementAffiche = computed(() => {
  if (!jour.value) return null
  if (voitLeCalendrier.value) return jour.value.evenement
  return evenementPublicDuJour(jour.value.date)?.titre ?? null
})

const estChoisi = computed(() => Boolean(selection.value))
const estPasse = computed(() => Boolean(jour.value && jour.value.date < aujourdhui.value))

useHead({ title: `${unite.numero} ${unite.ville} — unité scoute et guide` })
</script>

<template>
  <div class="accueil">
    <!-- La forme de l'encart, en coordonnées relatives : elle suit la taille
         du panneau sans qu'on ait à la recalculer. -->
    <svg class="accueil__defs" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="forme-encart" clipPathUnits="objectBoundingBox">
          <path
            d="M0,0.18 C0,0.06 0.03,0 0.09,0 L0.58,0 C0.645,0 0.665,0.03 0.695,0.10 L0.955,0.87 C0.985,0.955 0.99,1 1,1 L0,1 Z"
          />
        </clipPath>
      </defs>
    </svg>

    <div class="accueil__photo">
      <picture>
        <source srcset="/images/camp-crepuscule.webp" type="image/webp" />
        <img
          src="/images/camp-crepuscule.jpg"
          alt="Constructions de camp en bois au crépuscule, sous un ciel bleu nuit"
          fetchpriority="high"
        />
      </picture>
      <span class="accueil__voile" />
    </div>

    <div class="accueil__marque">
      <h1 class="accueil__logotype">
        <span class="accueil__logotype-haut">Scouts</span>
        <span class="accueil__logotype-bas">Fleurus</span>
      </h1>
      <p class="accueil__baseline">
        {{ unite.paroisse }} · {{ unite.numero }} {{ unite.region }} · depuis {{ unite.fondation }}
      </p>
    </div>

    <div class="accueil__encart">
      <div class="accueil__jour">
        <!-- Pas d'icône météo au-delà de la fenêtre de prévision : mieux vaut
             ne rien montrer qu'un nuage par défaut. -->
        <div v-if="meteo" class="accueil__meteo">
          <UiIcone :nom="meteo.icone" :taille="34" />
          <span class="accueil__temp mono">{{ meteo.tempMax }}°</span>
        </div>

        <p class="accueil__jour-nom titre titre--grand">{{ nomJour(jour.date) }}</p>
        <p class="accueil__jour-date">
          {{ formaterDate(jour.date) }} · {{ horaire }}
          <span v-if="estPasse" class="accueil__passe">passé</span>
        </p>
        <p v-if="meteo" class="accueil__jour-meteo doux">
          {{ meteo.libelle }}, {{ meteo.pluie }}% de risque de pluie
        </p>
        <button v-if="estChoisi" class="accueil__retour" type="button" @click="selection = null">
          <UiIcone nom="croix" :taille="12" />
          Revenir au prochain rendez-vous
        </button>
        <p v-if="evenementAffiche" class="accueil__jour-event">
          <span class="accueil__pastille" />{{ evenementAffiche }}
        </p>
      </div>

      <!-- Le programme de chaque section : réservé aux familles. -->
      <ul v-if="voitLeCalendrier && sectionsDuJour.length" class="accueil__sections">
        <li v-for="d in sectionsDuJour" :key="d.s.slug" :data-section="d.s.slug">
          <NuxtLink class="accueil__section" :to="`/sections/${d.s.slug}`">
            <UiIcone :nom="d.s.icone" :taille="16" />
            <span class="accueil__section-nom">{{ d.s.nom }}</span>
            <span class="accueil__section-quoi">{{ d.entree.libelle }}</span>
          </NuxtLink>
        </li>
      </ul>
      <p v-else-if="!voitLeCalendrier" class="accueil__reserve">
        Le programme de chaque section est réservé aux familles de l’unité.
      </p>

      <AppReseaux class="accueil__reseaux" />
    </div>

    <NuxtLink class="accueil__apropos" to="/a-propos">
      À propos
      <span class="accueil__apropos-rond"><UiIcone nom="chevrons-droite" :taille="16" /></span>
    </NuxtLink>
  </div>
</template>

<style lang="scss" scoped>
.accueil {
  position: relative;
  block-size: 100%;
  min-block-size: 34rem;
  border-radius: $r-panneau;
  overflow: hidden;
  background: $noir;
  isolation: isolate;

  // En dessous de la mise en page « console », l'accueil redevient une pile
  // normale : la photo passe en fond et tout le reste s'empile.
  @include jusqua($bp-console) {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    min-block-size: 32rem;
  }

  &__defs {
    position: absolute;
    inline-size: 0;
    block-size: 0;
    pointer-events: none;
  }

  &__photo {
    position: absolute;
    inset: 0;
    z-index: -2;

    picture {
      display: block;
      block-size: 100%;
    }

    img {
      inline-size: 100%;
      block-size: 100%;
      object-fit: cover;
      // Le traitement dur dont parle la direction visuelle : contraste poussé,
      // désaturation légère, pour que la photo tienne le rôle que tenait
      // l'illustration dans les maquettes.
      filter: contrast(1.18) saturate(0.82) brightness(0.72);
    }
  }

  &__voile {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(120% 90% at 78% 15%, transparent 30%, rgba($noir, 0.75) 100%),
      linear-gradient(to top, rgba($noir, 0.92) 0%, rgba($noir, 0.12) 55%);
  }

  &__marque {
    position: absolute;
    inset-block-start: clamp(4.5rem, 12vh, 8rem);
    inset-inline-start: clamp(1.5rem, 5vw, 4rem);
    max-inline-size: min(28rem, 70%);

    @include jusqua($bp-console) {
      position: static;
      max-inline-size: none;
      padding: 3.5rem 1.5rem 2.5rem;
      margin-block-end: auto;
    }
  }

  &__logotype {
    display: flex;
    flex-direction: column;
    margin: 0;
    font-family: $police-titre;
    font-weight: 800;
    text-transform: uppercase;
    line-height: 0.82;
    letter-spacing: -0.02em;
    font-variation-settings: 'wdth' 125;
  }

  &__logotype-haut {
    font-size: clamp(3rem, 8.5vw, 6.5rem);
    color: $rouge;
    text-shadow: 0 4px 40px rgba($rouge, 0.35);
  }

  &__logotype-bas {
    font-size: clamp(2.1rem, 6vw, 4.6rem);
    color: $blanc;
    padding-inline-start: clamp(1rem, 4vw, 3rem);
    font-variation-settings: 'wdth' 112;
  }

  &__baseline {
    margin-block-start: 1rem;
    padding-inline-start: 0.25rem;
    font-family: $police-mono;
    font-size: 0.7rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: rgba($blanc, 0.62);
  }

  // ------------------------------------------------------------------------
  // L'encart du jour. Sa forme n'est pas un rectangle : le bord droit descend
  // en pente, avec des joints arrondis, comme dans la maquette. Le chemin est
  // défini en coordonnées relatives, donc il suit la taille du panneau.
  // ------------------------------------------------------------------------
  &__encart {
    position: absolute;
    inset-block-end: 0;
    inset-inline-start: 0;
    inline-size: min(30rem, 66%);
    padding: 1.75rem 6.5rem 1.75rem 1.75rem;
    background: rgba($noir, 0.9);
    backdrop-filter: blur(20px);
    display: flex;
    flex-direction: column;
    gap: 1rem;
    clip-path: url('#forme-encart');

    // La saignée : la même forme, un peu plus grande, remplie de la couleur du
    // fond de page. Elle dessine la gouttière entre l'encart et la photo, comme
    // si c'étaient deux panneaux séparés.
    &::before {
      content: '';
      position: absolute;
      inset: -0.7rem -0.7rem 0 0;
      background: $noir-profond;
      clip-path: url('#forme-encart');
      z-index: -1;
    }

    @include jusqua($bp-console) {
      position: static;
      inline-size: 100%;
      padding: 1.5rem;
      clip-path: none;

      &::before {
        display: none;
      }
    }
  }

  &__jour {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  &__meteo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: $cyan;
    margin-block-end: 0.4rem;
  }

  &__temp {
    font-size: 1.1rem;
    font-weight: 500;
  }

  &__retour {
    display: inline-flex;
    align-items: center;
    align-self: flex-start;
    gap: 0.3rem;
    margin-block-start: 0.6rem;
    padding: 0.2rem 0.6rem;
    border-radius: $r-pilule;
    background: rgba($blanc, 0.09);
    color: rgba($blanc, 0.72);
    font-size: 0.68rem;
    font-weight: 500;

    @include focus-visible;
    &:hover {
      background: rgba($blanc, 0.16);
      color: $blanc;
    }
  }

  &__jour-nom {
    text-transform: capitalize;
  }

  &__jour-date {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: $police-mono;
    font-size: 0.8rem;
    color: rgba($blanc, 0.68);
  }

  &__passe {
    padding: 0.05rem 0.4rem;
    border-radius: $r-pilule;
    background: rgba($blanc, 0.1);
    font-size: 0.62rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: rgba($blanc, 0.6);
  }

  &__jour-meteo {
    font-size: 0.75rem;
  }

  &__jour-event {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-block-start: 0.5rem;
    font-size: 0.85rem;
    font-weight: 600;
    color: $rouge-texte;
  }

  &__pastille {
    inline-size: 0.4rem;
    block-size: 0.4rem;
    border-radius: 50%;
    background: $rouge;
  }

  &__sections {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    max-block-size: 10rem;
    @include defilement-discret;

    @include jusqua($bp-console) {
      max-block-size: none;
      overflow: visible;
    }
  }

  &__section {
    display: grid;
    grid-template-columns: 1rem 5.5rem 1fr;
    align-items: baseline;
    gap: 0.5rem;
    padding: 0.3rem 0.4rem;
    border-radius: $r-champ;
    color: var(--section-teinte);
    transition: background $vite $courbe;

    @include focus-visible;
    &:hover {
      background: rgba($blanc, 0.05);
    }
  }

  &__section-nom {
    font-size: 0.78rem;
    font-weight: 600;
  }

  &__section-quoi {
    font-size: 0.72rem;
    color: rgba($blanc, 0.62);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__reserve {
    font-size: 0.76rem;
    line-height: 1.5;
    color: rgba($blanc, 0.55);
    max-inline-size: 20rem;
  }

  &__apropos {
    position: absolute;
    inset-block-end: 1.25rem;
    inset-inline-end: 1.25rem;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 0.9rem;
    font-weight: 600;
    color: $blanc;

    @include focus-visible;

    @include jusqua($bp-console) {
      position: static;
      order: 99;
      margin: 1rem 1.5rem 1.5rem;
      justify-content: flex-end;
    }
  }

  &__apropos-rond {
    display: grid;
    place-items: center;
    inline-size: 2.4rem;
    block-size: 2.4rem;
    border-radius: 50%;
    background: $ardoise;
    transition:
      background $vite $courbe,
      transform $vite $courbe;

    .accueil__apropos:hover & {
      background: $rouge;
      transform: translateX(3px);
    }
  }

  &__reseaux {
    margin-block-start: 0.25rem;
  }
}
</style>
