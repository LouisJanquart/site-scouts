<script setup lang="ts">
import { planning } from '~/data/planning'
import { sections } from '~/data/sections'
import { unite } from '~/data/unite'

// L'accueil reprend l'écran Desktop-7 des maquettes : une photo plein cadre,
// le logotype par-dessus, et un panneau incrusté en bas à gauche avec la date
// et la météo. L'illustration manga est remplacée par une photo de camp.

const { aujourdhui } = usePlanning()

const prochain = computed(
  () => planning.find((j) => j.date >= aujourdhui.value) ?? planning.at(-1)!,
)

const dateCible = computed(() => prochain.value?.date)
const { meteo } = useMeteo(dateCible)

const horaire = computed(() =>
  prochain.value?.horaire === 'hiver' ? '14h00 – 17h00' : '14h00 – 17h30',
)

const sectionsDuProchain = computed(() =>
  sections
    .filter((s) => s.cleplanning && prochain.value?.sections[s.cleplanning])
    .map((s) => ({ s, entree: prochain.value!.sections[s.cleplanning!]! })),
)

useHead({
  title: `${unite.numero} ${unite.ville} — unité scoute et guide`,
})
</script>

<template>
  <div class="accueil">
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

    <div class="accueil__incruste">
      <div class="accueil__jour">
        <div class="accueil__meteo">
          <UiIcone :nom="meteo?.icone ?? 'nuage'" :taille="34" />
          <span v-if="meteo" class="accueil__temp mono">{{ meteo.tempMax }}°</span>
        </div>
        <p class="accueil__jour-nom titre titre--grand">{{ nomJour(prochain.date) }}</p>
        <p class="accueil__jour-date">{{ formaterDate(prochain.date) }} · {{ horaire }}</p>
        <p v-if="meteo" class="accueil__jour-meteo doux">
          {{ meteo.libelle }}, {{ meteo.pluie }}% de risque de pluie
        </p>
        <p v-if="prochain.evenement" class="accueil__jour-event">
          <span class="accueil__pastille" />{{ prochain.evenement }}
        </p>
      </div>

      <ul v-if="sectionsDuProchain.length" class="accueil__sections">
        <li v-for="d in sectionsDuProchain" :key="d.s.slug" :data-section="d.s.slug">
          <NuxtLink class="accueil__section" :to="`/sections/${d.s.slug}`">
            <UiIcone :nom="d.s.icone" :taille="16" />
            <span class="accueil__section-nom">{{ d.s.nom }}</span>
            <span class="accueil__section-quoi">{{ d.entree.libelle }}</span>
          </NuxtLink>
        </li>
      </ul>

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
      linear-gradient(to top, rgba($noir, 0.95) 0%, rgba($noir, 0.15) 55%);
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
    color: rgba($blanc, 0.66);
  }

  // Le panneau incrusté en bas à gauche, avec les coins concaves de la maquette.
  &__incruste {
    position: absolute;
    inset-block-end: 0;
    inset-inline-start: 0;
    inline-size: min(24rem, 62%);
    padding: 1.5rem;
    background: rgba($noir, 0.88);
    backdrop-filter: blur(20px);
    border-start-end-radius: $r-panneau;
    display: flex;
    flex-direction: column;
    gap: 1rem;

    @include jusqua($bp-console) {
      position: static;
      inline-size: 100%;
      border-start-end-radius: $r-panneau;
      border-start-start-radius: 0;

      &::before,
      &::after {
        display: none;
      }
    }

    // Les deux angles rentrants qui raccordent l'incrustation au panneau.
    &::before,
    &::after {
      content: '';
      position: absolute;
      inline-size: $r-panneau;
      block-size: $r-panneau;
      background: transparent;
      pointer-events: none;
    }
    &::before {
      inset-block-end: 100%;
      inset-inline-start: 0;
      border-end-start-radius: $r-panneau;
      box-shadow: 0 $r-panneau 0 0 rgba($noir, 0.88);
    }
    &::after {
      inset-inline-start: 100%;
      inset-block-end: 0;
      border-end-start-radius: $r-panneau;
      box-shadow: calc(-1 * #{$r-panneau}) 0 0 0 rgba($noir, 0.88);
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

  &__jour-nom {
    text-transform: capitalize;
  }

  &__jour-date {
    font-family: $police-mono;
    font-size: 0.8rem;
    color: rgba($blanc, 0.68);
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
    max-block-size: 11rem;
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
