<script setup lang="ts">
// La carte d'un rendez-vous, la même partout : liste des events, rendez-vous
// d'une section, dessus du paquet sur la présentation. Avant, il y en avait
// trois, chacune à sa façon (pavé date, date en surtitre, ticket).
//
// Le pavé date est un ticket détaché à gauche ; tout le reste est empilé à
// droite. Les pastilles (section, inscription) passent SOUS le titre au lieu
// d'être une colonne à part : sur téléphone, cette colonne serrait le titre
// dans 120 px (« BOURSE / AUX / JOUETS »).
import { parSlug } from '~/data/sections'

const props = withDefaults(
  defineProps<{
    e: {
      slug: string
      titre: string
      date: string
      dateFin?: string
      heure?: string
      lieu?: string
      section?: string | null
      resume?: string
      inscription?: boolean
    }
    resume?: boolean
    passe?: boolean
  }>(),
  { resume: true, passe: false },
)

const jour = computed(() => new Date(props.e.date + 'T12:00:00'))
const mois = computed(() => formaterDateCourte(props.e.date).split(' ')[1])
const jourSemaine = computed(() => nomJour(props.e.date).slice(0, 3))
const fin = computed(() => (props.e.dateFin ? formaterDateCourte(props.e.dateFin) : null))
</script>

<template>
  <NuxtLink
    class="carte-event"
    :class="{ 'carte-event--passe': passe }"
    :to="`/events/${e.slug}`"
    :data-section="e.section ?? undefined"
  >
    <span class="carte-event__ticket" aria-hidden="true">
      <span class="carte-event__js mono">{{ jourSemaine }}</span>
      <span class="carte-event__jour">{{ jour.getDate() }}</span>
      <span class="carte-event__mois mono">{{ mois }}</span>
    </span>
    <div class="carte-event__texte">
      <span class="lecteur-seul">{{ formaterDate(e.date, true) }}</span>
      <h3 class="carte-event__titre">{{ e.titre }}</h3>
      <span v-if="resume && e.resume" class="carte-event__resume">{{ e.resume }}</span>
      <span class="carte-event__meta">
        <span v-if="fin" class="carte-event__puce mono">→ {{ fin }}</span>
        <span v-if="e.heure" class="carte-event__puce mono">{{ e.heure }}</span>
        <span v-if="e.lieu" class="carte-event__puce">{{ e.lieu }}</span>
        <span v-if="e.section" class="etiquette">{{ parSlug[e.section]?.nom ?? e.section }}</span>
        <span v-if="e.inscription" class="etiquette etiquette--pleine">Sur inscription</span>
      </span>
    </div>
  </NuxtLink>
</template>

<style lang="scss" scoped>
.carte-event {
  display: flex;
  block-size: 100%;
  align-items: stretch;
  gap: $esp-3;
  padding: $esp-2;
  background: $ardoise;
  border-radius: $r-carte;
  color: $blanc;
  transition: background $vite $courbe;

  @include focus-visible;

  @media (hover: hover) {
    &:hover {
      background: $ardoise-clair;
    }
  }

  &--passe {
    opacity: 0.7;
  }

  &__ticket {
    flex: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    inline-size: 4.5rem;
    padding: $esp-2 0;
    background: var(--section-teinte, #{$cyan});
    color: $noir;
    border-radius: $r-tuile;

    @include depuis($bp-poche) {
      inline-size: 5.25rem;
    }
  }

  &__js,
  &__mois {
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  &__jour {
    font-family: $police-titre;
    font-variation-settings: 'wdth' 125;
    font-weight: 800;
    font-size: 2.25rem;
    line-height: 1;
  }

  &__texte {
    flex: 1;
    min-inline-size: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.4rem;
    padding: $esp-1 $esp-1 $esp-1 0;
  }

  &__titre {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 600;
    line-height: 1.3;
    overflow-wrap: anywhere;
  }

  &__resume {
    font-size: 0.95rem;
    line-height: 1.5;
    color: rgba($blanc, 0.7);
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.35rem;
  }

  &__puce {
    padding: 0.15rem 0.55rem;
    background: rgba($noir, 0.45);
    // Pas une pilule : un lieu long passe sur deux lignes, et une pilule
    // pliée en deux devient une drôle de forme.
    border-radius: 0.5rem;
    font-size: 0.75rem;
    color: rgba($blanc, 0.8);

    &.mono {
      white-space: nowrap;
    }
  }
}
</style>
