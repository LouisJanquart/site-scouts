<script setup lang="ts">
import { parSlug } from '~/data/sections'

const { aujourdhui } = usePlanning()
const { voitLesEvenementsInternes } = useRole()
// Déjà filtrée par le serveur : un visiteur ne reçoit que les rendez-vous
// ouverts au dehors.
const { evenements } = useContenu()

const liste = computed(() => evenements.value)

const aVenir = computed(() =>
  liste.value.filter((e) => (e.dateFin ?? e.date) >= aujourdhui.value),
)
const passes = computed(() =>
  liste.value.filter((e) => (e.dateFin ?? e.date) < aujourdhui.value).reverse(),
)

useHead({ title: 'Les événements — 16e Fleurus' })
</script>

<template>
  <AppPage
    titre="Les rendez-vous de l’année"
    surtitre="Événements"
    chapo="Portes ouvertes, souper dias, marche Adeps, cavalcade. Les dates qui concernent toute l’unité, en plus des réunions du dimanche."
  >
    <p v-if="!voitLesEvenementsInternes" class="reserve">
      <UiIcone nom="cadenas" :taille="16" />
      Seuls les rendez-vous ouverts au public sont affichés. Les temps d’unité, la Saint-Nicolas
      et la veillée de Noël ne concernent que les familles de l’unité.
    </p>
    <section v-if="aVenir.length" class="bloc">
      <h2 class="surtitre">À venir</h2>
      <ul class="liste">
        <li v-for="e in aVenir" :key="e.slug" :data-section="e.section ?? undefined">
          <NuxtLink class="event" :to="`/events/${e.slug}`">
            <div class="event__date">
              <span class="event__jour mono">{{ new Date(e.date + 'T12:00:00').getDate() }}</span>
              <span class="event__mois mono">{{ formaterDateCourte(e.date).split(' ')[1] }}</span>
            </div>
            <div class="event__texte">
              <h3 class="titre titre--petit">{{ e.titre }}</h3>
              <p class="event__resume">{{ e.resume }}</p>
              <p class="event__meta mono">
                {{ e.lieu }}
                <template v-if="e.heure"> · {{ e.heure }}</template>
                <template v-if="e.section"> · {{ parSlug[e.section]?.nom }}</template>
              </p>
            </div>
            <span v-if="e.inscription" class="etiquette event__inscription">Inscription</span>
          </NuxtLink>
        </li>
      </ul>
    </section>

    <section v-if="passes.length" class="bloc">
      <h2 class="surtitre">Déjà passés</h2>
      <ul class="liste liste--passe">
        <li v-for="e in passes" :key="e.slug">
          <NuxtLink class="event" :to="`/events/${e.slug}`">
            <div class="event__date">
              <span class="event__jour mono">{{ new Date(e.date + 'T12:00:00').getDate() }}</span>
              <span class="event__mois mono">{{ formaterDateCourte(e.date).split(' ')[1] }}</span>
            </div>
            <div class="event__texte">
              <h3 class="titre titre--petit">{{ e.titre }}</h3>
              <p class="event__meta mono">{{ formaterDate(e.date) }}</p>
            </div>
          </NuxtLink>
        </li>
      </ul>
    </section>
  </AppPage>
</template>

<style lang="scss" scoped>
.reserve {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 0.9rem;
  background: rgba($blanc, 0.04);
  border: 1px solid rgba($blanc, 0.09);
  border-radius: $r-champ;
  font-size: 0.82rem;
  color: rgba($blanc, 0.66);
  max-inline-size: 46rem;
}

.bloc {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.liste {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0;

  &--passe {
    opacity: 0.72;
  }
}

.event {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: $ardoise;
  border-radius: $r-carte;
  transition:
    background $vite $courbe,
    transform $vite $courbe;

  @include focus-visible;

  &:hover {
    background: $ardoise-clair;
    transform: translateX(2px);
  }

  &__date {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    inline-size: 3.25rem;
    block-size: 3.25rem;
    flex-shrink: 0;
    background: rgba($noir, 0.5);
    border-radius: $r-champ;
    color: var(--section-teinte);
  }

  &__jour {
    font-size: 1.15rem;
    font-weight: 500;
    line-height: 1.1;
  }

  &__mois {
    font-size: 0.6rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    // Pas d'opacité ici : elle ferait passer la teinte de section sous le
    // seuil de contraste sur les sections aux couleurs les plus sombres.
  }

  &__texte {
    flex: 1;
    min-inline-size: 0;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  &__resume {
    font-size: 0.85rem;
    line-height: 1.5;
    color: rgba($blanc, 0.68);
  }

  &__meta {
    font-size: 0.7rem;
    color: rgba($blanc, 0.6);
  }

  &__inscription {
    flex-shrink: 0;
  }
}
</style>
