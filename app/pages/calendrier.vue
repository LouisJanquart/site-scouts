<script setup lang="ts">
import { planning, saison } from '~/data/planning'
import { sections } from '~/data/sections'
import { typesReunion } from '~/composables/usePlanning'

// Le classeur de planning rendu lisible : une ligne par dimanche, une colonne
// par section, plus les flux iCal auxquels on peut s'abonner.

// Toutes les sections qui ont une colonne dans le classeur, Route comprise.
const colonnesPossibles = sections.filter((s) => s.cleplanning)

const { aujourdhui } = usePlanning()
const { voitLeCalendrier } = useRole()

const filtre = ref<string | null>(null)
const masquerPasse = ref(true)

const lignes = computed(() =>
  planning.filter((j) => (masquerPasse.value ? j.date >= aujourdhui.value : true)),
)

const colonnes = computed(() =>
  filtre.value ? colonnesPossibles.filter((s) => s.slug === filtre.value) : colonnesPossibles,
)

const nbAVenir = computed(() => planning.filter((j) => j.date >= aujourdhui.value).length)

const legende = Object.entries(typesReunion).map(([cle, v]) => ({ cle, ...v }))

useHead({ title: 'Le calendrier — 16e Fleurus' })
</script>

<template>
  <AppPage
    :titre="`La saison ${saison}`"
    surtitre="Calendrier"
    chapo="Le planning de l’unité, tel qu’il est tenu par le staff d’unité. Une ligne par dimanche, une colonne par section."
  >
    <template #entete>
      <div v-if="voitLeCalendrier" class="barre">
        <div class="barre__filtres">
          <button
            class="puce"
            :class="{ 'puce--actif': filtre === null }"
            type="button"
            @click="filtre = null"
          >
            Toutes
          </button>
          <button
            v-for="s in colonnesPossibles"
            :key="s.slug"
            class="puce"
            :class="{ 'puce--actif': filtre === s.slug }"
            :data-section="s.slug"
            type="button"
            @click="filtre = s.slug"
          >
            {{ s.nom }}
          </button>
        </div>
        <label class="bascule">
          <input v-model="masquerPasse" type="checkbox" />
          <span>N’afficher que les dates à venir ({{ nbAVenir }})</span>
        </label>
      </div>
    </template>

    <div v-if="!voitLeCalendrier" class="verrou">
      <UiIcone nom="cadenas" :taille="22" />
      <div>
        <p class="verrou__titre">Réservé aux familles de l’unité</p>
        <p class="verrou__texte">
          Le planning des sections, dimanche par dimanche, n’est pas public. Les rendez-vous
          ouverts à tout le monde, eux, sont sur la
          <NuxtLink to="/events">page des événements</NuxtLink>, et les horaires de réunion sont
          dans les <NuxtLink to="/infos">infos pratiques</NuxtLink>.
        </p>
      </div>
    </div>

    <template v-else>
    <section class="bloc">
      <div class="tableau-cadre" tabindex="0" role="group" aria-label="Tableau du planning, défilement horizontal">
        <table class="tableau">
          <caption class="lecteur-seul">
            Planning des réunions de la saison {{ saison }}, par section
          </caption>
          <thead>
            <tr>
              <th scope="col" class="tableau__date">Date</th>
              <th
                v-for="s in colonnes"
                :key="s.slug"
                scope="col"
                :data-section="s.slug"
                class="tableau__section"
              >
                {{ s.nom }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="j in lignes"
              :key="j.date"
              :class="{
                'tableau__ligne--event': Boolean(j.evenement),
                'tableau__ligne--passe': j.date < aujourdhui,
              }"
            >
              <th scope="row" class="tableau__date">
                <span class="mono">{{ formaterDateCourte(j.date) }}</span>
                <span v-if="j.evenement" class="tableau__event">{{ j.evenement }}</span>
                <span v-else-if="j.remarque" class="tableau__remarque">{{ j.remarque }}</span>
                <span v-if="j.horaire" class="tableau__horaire mono">
                  {{ j.horaire === 'hiver' ? '14–17h' : '14–17h30' }}
                </span>
              </th>
              <td v-for="s in colonnes" :key="s.slug" :data-section="s.slug">
                <template v-if="s.cleplanning && j.sections[s.cleplanning]">
                  <span
                    class="tableau__code mono"
                    :style="{
                      color: j.sections[s.cleplanning]!.type
                        ? typesReunion[j.sections[s.cleplanning]!.type!].teinte
                        : undefined,
                    }"
                    >{{
                      j.sections[s.cleplanning]!.type
                        ? typesReunion[j.sections[s.cleplanning]!.type!].code
                        : '—'
                    }}</span
                  >
                  <span class="tableau__libelle">{{ j.sections[s.cleplanning]!.libelle }}</span>
                </template>
                <span v-else class="tableau__rien">·</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <ul class="legende">
        <li v-for="l in legende" :key="l.cle">
          <span class="legende__code mono" :style="{ color: l.teinte }">{{ l.code }}</span>
          {{ l.nom }}
        </li>
      </ul>
    </section>

    <section class="bloc">
      <h2 class="surtitre">S’abonner au calendrier</h2>
      <p class="doux abonnement__intro">
        Chaque section a son flux iCalendar. Copiez l’adresse dans Google Agenda, Apple Calendrier
        ou Outlook et les réunions apparaissent automatiquement dans votre agenda.
      </p>
      <ul class="abonnement">
        <li>
          <a class="abonnement__lien" href="/calendriers/unite.ics">
            <UiIcone nom="lys" :taille="18" />
            <span class="abonnement__nom">Événements d’unité</span>
            <span class="abonnement__url mono">/calendriers/unite.ics</span>
          </a>
        </li>
        <li v-for="s in colonnesPossibles" :key="s.slug" :data-section="s.slug">
          <a class="abonnement__lien" :href="`/calendriers/${s.slug}.ics`">
            <UiIcone :nom="s.icone" :taille="18" />
            <span class="abonnement__nom">{{ s.nom }}</span>
            <span class="abonnement__url mono">/calendriers/{{ s.slug }}.ics</span>
          </a>
        </li>
      </ul>
    </section>

    <section class="bloc">
      <p class="source">
        <UiIcone nom="info" :taille="16" />
        Ces dates sont une copie du classeur « Planning Annuel Réunions » tenu par le staff
        d’unité. Tant que le site n’ira pas lire ce classeur directement, toute modification devra
        être reportée ici à la main.
      </p>
    </section>
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

.barre {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-block-start: 1.25rem;

  &__filtres {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
  }
}

.puce {
  padding: 0.35rem 0.75rem;
  border-radius: $r-pilule;
  background: rgba($blanc, 0.05);
  color: rgba($blanc, 0.66);
  font-size: 0.78rem;
  font-weight: 500;
  transition:
    background $vite $courbe,
    color $vite $courbe;

  @include focus-visible;

  &:hover {
    background: rgba($blanc, 0.1);
    color: $blanc;
  }

  &--actif {
    background: color-mix(in srgb, var(--section-teinte) 20%, transparent);
    color: var(--section-teinte);
  }
}

.bascule {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: rgba($blanc, 0.64);
  cursor: pointer;
  inline-size: fit-content;

  input {
    accent-color: $cyan;
  }
}

.bloc {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.tableau-cadre {
  overflow-x: auto;
  border-radius: $r-carte;
  background: rgba($blanc, 0.02);
  @include defilement-discret;
}

.tableau {
  inline-size: 100%;
  border-collapse: collapse;
  font-size: 0.78rem;

  th,
  td {
    text-align: start;
    vertical-align: top;
    padding: 0.55rem 0.7rem;
    border-block-end: 1px solid rgba($blanc, 0.05);
  }

  thead th {
    position: sticky;
    inset-block-start: 0;
    background: #171825;
    z-index: 1;
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-weight: 600;
    color: var(--section-teinte);
    white-space: nowrap;
  }

  &__date {
    min-inline-size: 8rem;
    font-weight: 400;

    .mono {
      display: block;
      font-size: 0.75rem;
      color: rgba($blanc, 0.75);
    }
  }

  &__event {
    display: block;
    margin-block-start: 0.15rem;
    font-size: 0.7rem;
    font-weight: 600;
    color: $rouge-texte;
  }

  &__remarque {
    display: block;
    margin-block-start: 0.15rem;
    font-size: 0.66rem;
    color: rgba($blanc, 0.58);
  }

  &__horaire {
    display: block;
    font-size: 0.6rem;
    color: rgba($blanc, 0.25);
  }

  &__code {
    display: block;
    font-size: 0.62rem;
    font-weight: 500;
    color: rgba($blanc, 0.6);
  }

  &__libelle {
    display: block;
    color: rgba($blanc, 0.68);
    line-height: 1.4;
  }

  &__rien {
    color: rgba($blanc, 0.14);
  }

  &__ligne--event th,
  &__ligne--event td {
    background: rgba($rouge, 0.05);
  }

  &__ligne--passe {
    opacity: 0.65;
  }
}

.legende {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 1rem;
  margin: 0;
  font-size: 0.72rem;
  color: rgba($blanc, 0.62);

  li {
    display: flex;
    align-items: baseline;
    gap: 0.4rem;
  }

  &__code {
    font-weight: 500;
  }
}

.abonnement {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  gap: 0.4rem;
  margin: 0;

  &__intro {
    font-size: 0.88rem;
    max-inline-size: 44rem;
  }

  &__lien {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.65rem 0.85rem;
    background: rgba($blanc, 0.035);
    border-radius: $r-champ;
    color: var(--section-teinte);
    transition: background $vite $courbe;

    @include focus-visible;
    &:hover {
      background: rgba($blanc, 0.08);
    }
  }

  &__nom {
    flex: 1;
    font-size: 0.85rem;
    font-weight: 500;
    color: $blanc;
  }

  &__url {
    font-size: 0.62rem;
    color: rgba($blanc, 0.55);
  }
}

.source {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.8rem 0.9rem;
  background: rgba($cyan, 0.06);
  border: 1px solid rgba($cyan, 0.15);
  border-radius: $r-champ;
  font-size: 0.8rem;
  line-height: 1.55;
  color: rgba($blanc, 0.68);
  max-inline-size: 48rem;
}
</style>
