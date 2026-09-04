<script setup lang="ts">
import { sections } from '~/data/sections'
import { unite } from '~/data/unite'

// L'accueil reprend l'écran Desktop-7 des maquettes : une photo plein cadre, le
// logotype par-dessus, et un encart incrusté en bas à gauche. L'illustration
// manga est remplacée par une photo de camp.
//
// La forme est relevée sur la maquette au pixel : la silhouette des deux
// chemins ci-dessous colle à 99,7 % à celle de l'écran Desktop-7.
//   - la photo n'est pas un rectangle. Elle est vraiment DÉCOUPÉE : une encoche
//     en bas à gauche, qui laisse la place à l'encart du jour, et une entaille
//     rectangulaire aux angles arrondis dans le coin supérieur droit, où se
//     loge la barre d'outils ;
//   - l'encoche a deux pentes : une douce sur le bord supérieur (deux et demie
//     d'avancée pour une de descente), une raide sur le bord droit (une
//     avancée pour trois de descente), réunies par un joint largement arrondi ;
//   - l'encart reprend la même encoche, rentrée d'une gouttière sur ces deux
//     pentes et à fleur de la photo sur le bord gauche et le bas : c'est le sol
//     de la page qui passe entre les deux.
//
// Les deux chemins sont écrits dans le MÊME repère — celui de « .accueil », en
// coordonnées relatives — et posés tous les deux en « inset: 0 ». C'est ce qui
// garantit qu'ils restent alignés quelle que soit la taille du panneau.
//
// Enfin, c'est l'encart, et pas le calendrier de gauche, qui décrit le jour
// choisi.

const jour = useJourAffiche()
const selection = useJourSelectionne()
const { aujourdhui } = usePlanning()
const { meteoPour } = useMeteo()
const { voitLeCalendrier } = useRole()
// Le planning et les événements arrivent de l'API, déjà filtrés selon le
// compte : l'intitulé d'un rendez-vous réservé n'atteint jamais le navigateur
// d'un visiteur, il n'y a donc plus rien à masquer ici.
const { evenements } = useContenu()

const meteo = computed(() => meteoPour(jour.value?.date))

const horaire = computed(() =>
  jour.value?.horaire === 'hiver' ? '14h00 – 17h00' : '14h00 – 17h30',
)

const sectionsDuJour = computed(() =>
  sections
    .filter((s) => s.cleplanning && jour.value?.sections[s.cleplanning])
    .map((s) => ({ s, entree: jour.value!.sections[s.cleplanning!]! })),
)

// L'intitulé vient du planning que le serveur a envoyé : complet pour une
// famille, réduit aux rendez-vous ouverts au dehors pour un visiteur.
const evenementAffiche = computed(() => jour.value?.evenement ?? null)

const estChoisi = computed(() => Boolean(selection.value))
const estPasse = computed(() => Boolean(jour.value && jour.value.date < aujourdhui.value))

useHead({ title: `${unite.numero} ${unite.ville} — unité scoute et guide` })
</script>

<template>
  <div class="accueil">
    <!-- Les deux découpes, en coordonnées relatives au panneau : elles suivent
         sa taille sans qu'on ait à les recalculer. -->
    <svg class="accueil__defs" aria-hidden="true" focusable="false">
      <defs>
        <!-- La photo. Deux morsures dans le rectangle :
             - en haut à droite, une entaille rectangulaire aux angles arrondis,
               qui dégage la barre d'outils (le fond de page passe derrière) ;
             - en bas à gauche, l'encoche de l'encart : une pente douce (une
               unité de descente pour deux et demie d'avancée) depuis le bord
               gauche, un joint arrondi, puis une pente raide jusqu'au bas. -->
        <clipPath id="forme-photo" clipPathUnits="objectBoundingBox">
          <path
            d="M0,0.0672 A0.0574,0.0672 0 0 1 0.0574,0 L0.6804,0 A0.0437,0.0511 0 0 1 0.7241,0.0511 L0.7241,0.0555 A0.0437,0.0511 0 0 0 0.7678,0.1066 L0.9401,0.1066 A0.0599,0.0701 0 0 1 1,0.1766 L1,0.9328 A0.0574,0.0672 0 0 1 0.9426,1 L0.4832,1 A0.0499,0.0584 0 0 1 0.4363,0.9615 L0.3347,0.6331 A0.0375,0.0438 0 0 0 0.3133,0.6073 L0.0252,0.4730 A0.0400,0.0467 0 0 1 0,0.4296 Z"
          />
        </clipPath>

        <!-- L'encart : la même encoche, rentrée d'une gouttière sur ses deux
             pentes, et à fleur de la photo sur le bord gauche et le bas. -->
        <clipPath id="forme-encart" clipPathUnits="objectBoundingBox">
          <path
            d="M0,0.5985 A0.0578,0.0676 0 0 1 0.0791,0.5357 L0.2866,0.6321 A0.0424,0.0496 0 0 1 0.3110,0.6618 L0.3853,0.9107 A0.0574,0.0672 0 0 1 0.3311,1 L0.0574,1 A0.0574,0.0672 0 0 1 0,0.9328 Z"
          />
        </clipPath>
      </defs>
    </svg>

    <div class="accueil__photo">
      <picture>
        <source srcset="/images/foret-brume.webp" type="image/webp" />
        <img
          src="/images/foret-brume.jpg"
          alt="Une tente plantée seule dans une prairie, au pied d’une falaise dans les nuages"
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

    <!-- Le fond de l'encart : une plaque qui couvre tout le panneau et qu'on
         découpe à la forme voulue. Elle partage donc le repère de la photo. -->
    <span class="accueil__plaque" />

    <div class="accueil__encart">
      <!-- Le planning arrive de l'API : il peut manquer le temps d'une requête.
           On garde alors la place plutôt que de faire sauter la mise en page. -->
      <div v-if="jour" class="accueil__jour">
        <!-- Pas d'icône météo au-delà de la fenêtre de prévision : mieux vaut
             ne rien montrer qu'un nuage par défaut. La place, elle, reste
             prise : c'est elle qui tient le titre à l'écart de la pente. -->
        <div class="accueil__meteo">
          <template v-if="meteo">
            <UiIcone :nom="meteo.icone" :taille="34" />
            <span class="accueil__temp mono">{{ meteo.tempMax }}°</span>
          </template>
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
  // Le logotype se règle sur la largeur du panneau, pas sur celle de l'écran :
  // il tient donc sur une ligne quelle que soit la place laissée par les flancs.
  container-type: inline-size;

  // En mise en page « console », le panneau n'a plus de fond ni de coins à lui :
  // ce sont les deux découpes (la photo et la plaque) qui dessinent la silhouette,
  // et le fond de page passe dans la gouttière entre les deux.
  @include console {
    background: none;
    border-radius: 0;
    overflow: visible;
  }

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

    @include console {
      clip-path: url('#forme-photo');
    }

    picture {
      display: block;
      block-size: 100%;
    }

    img {
      inline-size: 100%;
      block-size: 100%;
      object-fit: cover;
      // On cadre vers le bas : c'est là que sont la tente et la prairie, et
      // c'est cette prairie claire qui fait lire la découpe et la gouttière.
      object-position: 50% 85%;
      // Le traitement dur dont parle la direction visuelle : contraste poussé,
      // désaturation légère, pour que la photo tienne le rôle que tenait
      // l'illustration dans les maquettes.
      filter: contrast(1.1) saturate(1.02) brightness(1);
    }
  }

  &__voile {
    position: absolute;
    inset: 0;
    // Dans la maquette, la photo reste franche et lumineuse jusqu'au bord : le
    // fond de page est noir, et c'est le contraste entre la photo et ce noir qui
    // fait lire la découpe et la gouttière. Un voile lourd les efface toutes
    // les deux. On se contente donc d'assombrir là où il y a du texte : sous le
    // logotype, en haut à gauche.
    background:
      radial-gradient(95% 75% at 22% 26%, rgba($noir-profond, 0.72) 0%, transparent 72%),
      linear-gradient(to top, rgba($noir-profond, 0.34) 0%, transparent 34%);
  }

  // La plaque de l'encart : elle couvre tout le panneau, donc elle partage le
  // repère de la photo, et c'est le découpage qui lui donne sa forme. C'est ce
  // qui garantit que la gouttière entre les deux reste régulière.
  &__plaque {
    position: absolute;
    inset: 0;
    z-index: -1;
    background: $noir;
    clip-path: url('#forme-encart');
    pointer-events: none;

    @include jusqua($bp-console) {
      display: none;
    }
  }

  &__marque {
    position: absolute;
    inset-block-start: clamp(4.5rem, 12vh, 8rem);
    inset-inline-start: clamp(1.5rem, 5vw, 4rem);
    // Archivo étirée à 125 % de large : « SCOUTS » demande une bonne moitié de
    // panneau. Trop serré, le logotype se coupe en deux.
    max-inline-size: min(40rem, 74%);

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
    // Un mot du logotype ne se coupe jamais : on le réduit plutôt.
    white-space: nowrap;
    font-size: clamp(3rem, 8.5vw, 6.5rem);

    @include console {
      font-size: min(6.5rem, 10cqi);
    }
    color: $rouge;
    text-shadow: 0 4px 40px rgba($rouge, 0.35);
  }

  &__logotype-bas {
    white-space: nowrap;
    font-size: clamp(2.1rem, 6vw, 4.6rem);

    @include console {
      font-size: min(4.6rem, 7.1cqi);
    }
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
    // Le sommet de l'encart et son bord droit sont ceux du découpage : la boîte
    // du texte épouse la plaque, elle ne la déborde pas.
    inset-block: 49.9% 0;
    inset-inline-start: 0;
    inline-size: 41.2%;
    // Le texte doit rester à l'intérieur des deux pentes. Les réserves sont en
    // pourcentage — donc mesurées, comme les pentes, sur la largeur du panneau —
    // pour que le texte occupe toujours la même place dans la forme.
    padding: 8.5% 11.2% 2.9% 3.25%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 0.9rem;
    // Le titre se règle sur la largeur de l'encart, pas sur celle de l'écran :
    // il tient donc toujours entre les deux pentes.
    container-type: inline-size;

    @include jusqua($bp-console) {
      position: static;
      inline-size: 100%;
      padding: 1.5rem;
      background: rgba($noir, 0.9);
      backdrop-filter: blur(20px);
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
    // La hauteur est réservée même sans prévision : le titre reste alors sous
    // la pente du bord supérieur au lieu de venir mordre dedans.
    min-block-size: 2.125rem;
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
    // Un jour de la semaine ne se coupe pas : plutôt le réduire que le briser.
    overflow-wrap: normal;

    @include console {
      font-size: min(2.5rem, 19cqi);
    }
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

    // Dans l'encart découpé, les réseaux se posent en bas à droite, là où la
    // pente laisse le plus de place, comme dans la maquette.
    @include console {
      margin-block-start: auto;
      align-self: flex-end;
    }
  }
}
</style>
