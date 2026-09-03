<script setup lang="ts">
import { evenements } from '~/data/evenements'
import { parSlug } from '~/data/sections'

const route = useRoute()
const evenement = computed(() => evenements.find((e) => e.slug === String(route.params.slug)))

if (!evenement.value) {
  throw createError({ statusCode: 404, statusMessage: 'Événement inconnu', fatal: true })
}

const { aujourdhui } = usePlanning()
const { role } = useRole()

// Un rendez-vous interne n'est pas montré à un visiteur, même en arrivant
// directement par son adresse.
const RANG: Record<string, number> = { tous: 0, parents: 1, animes: 1, chefs: 2 }
const autorise = computed(() => {
  const n = role.value === 'chef' ? 2 : role.value === 'visiteur' ? 0 : 1
  return RANG[evenement.value!.public] <= n
})

const passe = computed(() => (evenement.value!.dateFin ?? evenement.value!.date) < aujourdhui.value)

// Un fichier .ics généré à la volée, pour ajouter la date à son agenda sans
// que l'unité ait à publier quoi que ce soit.
const lienIcs = computed(() => {
  const e = evenement.value!
  const d = e.date.replace(/-/g, '')
  const fin = (e.dateFin ?? e.date).replace(/-/g, '')
  const finPlusUn = (() => {
    const x = new Date((e.dateFin ?? e.date) + 'T12:00:00')
    x.setDate(x.getDate() + 1)
    return x.toISOString().slice(0, 10).replace(/-/g, '')
  })()
  const lignes = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//16e Fleurus//FR',
    'BEGIN:VEVENT',
    `UID:${e.slug}@16efleurus`,
    `DTSTART;VALUE=DATE:${d}`,
    `DTEND;VALUE=DATE:${finPlusUn}`,
    `SUMMARY:${e.titre} — 16e Fleurus`,
    `LOCATION:${e.lieu.replace(/,/g, '\\,')}`,
    `DESCRIPTION:${e.resume.replace(/,/g, '\\,')}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return 'data:text/calendar;charset=utf-8,' + encodeURIComponent(lignes.join('\r\n'))
})

useHead(() => ({ title: `${evenement.value?.titre} — 16e Fleurus` }))
</script>

<template>
  <AppPage
    v-if="evenement"
    :titre="evenement.titre"
    :surtitre="formaterDate(evenement.date, true)"
    :chapo="autorise ? evenement.resume : undefined"
    :retour="{ to: '/events', texte: 'Tous les events' }"
  >
    <template #entete>
      <div v-if="evenement.photo && autorise" class="bandeau">
        <img :src="evenement.photo" alt="" />
      </div>
    </template>

    <div v-if="!autorise" class="verrou">
      <UiIcone nom="cadenas" :taille="22" />
      <div>
        <p class="verrou__titre">Réservé aux familles de l’unité</p>
        <p class="verrou__texte">
          Ce rendez-vous ne concerne que les membres de la 16e. Les événements ouverts à tout le
          monde sont sur la <NuxtLink to="/events">page des événements</NuxtLink>.
        </p>
      </div>
    </div>

    <template v-else>
    <section class="bloc">
      <dl class="fiche">
        <div class="fiche__ligne">
          <dt>Quand</dt>
          <dd>
            {{ formaterDate(evenement.date, true) }}
            <template v-if="evenement.heure"><br />{{ evenement.heure }}</template>
          </dd>
        </div>
        <div class="fiche__ligne">
          <dt>Où</dt>
          <dd>{{ evenement.lieu }}</dd>
        </div>
        <div class="fiche__ligne">
          <dt>Pour qui</dt>
          <dd>
            {{
              evenement.public === 'tous'
                ? 'Tout le monde'
                : evenement.public === 'parents'
                  ? 'Les parents'
                  : evenement.public === 'animes'
                    ? 'Les animés'
                    : 'Les chefs'
            }}
          </dd>
        </div>
        <div v-if="evenement.section" class="fiche__ligne" :data-section="evenement.section">
          <dt>Porté par</dt>
          <dd>{{ parSlug[evenement.section]?.nom }}</dd>
        </div>
      </dl>
    </section>

    <section class="bloc">
      <div class="prose">
        <p>{{ evenement.description }}</p>
      </div>
    </section>

    <section v-if="!passe" class="bloc actions">
      <a class="bouton bouton--principal" :href="lienIcs" :download="`${evenement.slug}.ics`">
        <UiIcone nom="calendrier" :taille="18" />
        Ajouter à mon agenda
      </a>
      <p v-if="evenement.inscription" class="doux actions__note">
        Les inscriptions ne passent pas encore par le site. En attendant, écrivez à
        <a href="mailto:scout.fleu@gmail.com">scout.fleu@gmail.com</a>.
      </p>
    </section>
    <p v-else class="doux">Cet événement a déjà eu lieu.</p>
    </template>
  </AppPage>
</template>

<style lang="scss" scoped>
.verrou {
  display: flex;
  gap: 0.85rem;
  padding: 1.1rem 1.25rem;
  background: rgba($blanc, 0.04);
  border: 1px solid rgba($blanc, 0.09);
  border-radius: $r-carte;
  color: rgba($blanc, 0.66);
  max-inline-size: 44rem;

  &__titre {
    font-weight: 600;
    font-size: 0.95rem;
    color: $blanc;
  }

  &__texte {
    margin-block-start: 0.35rem;
    font-size: 0.85rem;
    line-height: 1.6;

    a {
      color: $cyan;
      text-decoration: underline;
      text-underline-offset: 3px;
    }
  }
}

.bandeau {
  block-size: 12rem;
  margin-block: 1.25rem 0.5rem;
  border-radius: $r-carte;
  overflow: hidden;

  img {
    inline-size: 100%;
    block-size: 100%;
    object-fit: cover;
    filter: contrast(1.15) saturate(0.8) brightness(0.6);
  }
}

.bloc {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.fiche {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
  gap: 0.75rem;
  margin: 0;

  &__ligne {
    padding: 0.85rem 0.9rem;
    background: rgba($blanc, 0.03);
    border-radius: $r-champ;

    dt {
      @include surtitre;
      font-size: 0.6rem;
    }
    dd {
      margin: 0.3rem 0 0;
      font-size: 0.92rem;
      line-height: 1.45;
    }
  }
}

.actions {
  align-items: flex-start;

  &__note {
    font-size: 0.85rem;

    a {
      color: $cyan;
      text-decoration: underline;
      text-underline-offset: 3px;
    }
  }
}
</style>
