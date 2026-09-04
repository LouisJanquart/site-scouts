<script setup lang="ts">
import { parSlug, sections } from '~/data/sections'
import { typesReunion } from '~/composables/usePlanning'

const route = useRoute()
const slug = computed(() => String(route.params.slug))
const section = computed(() => parSlug[slug.value])

if (!section.value) {
  throw createError({ statusCode: 404, statusMessage: 'Section inconnue', fatal: true })
}

const { planningDeSection, prochaineReunion, prochainDimanche, aujourdhui } = usePlanning()
const { voitLesContacts, role, voitLeCalendrier, voitLeStaff } = useRole()
const { chefsDeSection, adressesDeSection } = useContenu()

const staff = computed(() => chefsDeSection(slug.value))
// L'adresse de fonction de la section : servie aux familles, jamais aux
// visiteurs.
const adresse = computed(() => adressesDeSection.value[slug.value] ?? null)
const chefDeStaff = computed(() => staff.value.find((c) => c.chefDeStaff))
const prochaine = computed(() => prochaineReunion(slug.value))

const agenda = computed(() =>
  planningDeSection(slug.value).filter((j) => j.date >= aujourdhui.value),
)
const agendaPasse = computed(() =>
  planningDeSection(slug.value)
    .filter((j) => j.date < aujourdhui.value)
    .reverse(),
)
const montrerPasse = ref(false)

// Combien de fois chaque type de réunion revient dans l'année : une manière
// simple de dire à un parent à quoi ressemble une saison.
const repartition = computed(() => {
  const tous = planningDeSection(slug.value)
  const compte = new Map<string, number>()
  for (const j of tous) if (j.type) compte.set(j.type, (compte.get(j.type) ?? 0) + 1)
  return [...compte.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([type, n]) => ({ type, n, ...typesReunion[type as keyof typeof typesReunion] }))
})

const total = computed(() => planningDeSection(slug.value).length)

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
    </template>

    <!-- Prochaine réunion : l'information que cherche un parent en premier. -->
    <section v-if="prochaine" class="bloc">
      <h2 class="surtitre">Prochaine réunion</h2>
      <div class="prochaine">
        <p class="prochaine__date titre titre--moyen">
          {{ formaterDate(prochaine.date, true) }}
        </p>
        <p v-if="voitLeCalendrier" class="prochaine__quoi">{{ prochaine.libelle }}</p>
        <p v-else class="prochaine__quoi">Réunion au local</p>
        <p class="prochaine__horaire mono doux">
          {{ prochaine.horaire === 'hiver' ? '14h00 – 17h00' : '14h00 – 17h30' }}
          <template v-if="voitLeCalendrier && prochaine.remarque"> · {{ prochaine.remarque }}</template>
        </p>
      </div>
    </section>

    <section class="bloc">
      <h2 class="surtitre">La section</h2>
      <div class="prose">
        <p>{{ section.description }}</p>
      </div>
      <dl class="fiche">
        <div v-if="section.ages" class="fiche__ligne">
          <dt>Âges</dt>
          <dd>{{ section.ages }}</dd>
        </div>
        <div v-if="section.genre" class="fiche__ligne">
          <dt>Composition</dt>
          <dd>
            {{
              section.genre === 'mixte'
                ? 'Mixte'
                : section.genre === 'filles'
                  ? 'Filles'
                  : 'Garçons'
            }}
          </dd>
        </div>
        <div v-if="voitLeStaff" class="fiche__ligne">
          <dt>Staff</dt>
          <dd>{{ staff.length }} animateur{{ staff.length > 1 ? 's' : '' }}</dd>
        </div>
        <div v-if="voitLeCalendrier" class="fiche__ligne">
          <dt>Dates prévues cette saison</dt>
          <dd>{{ total }}</dd>
        </div>
      </dl>
    </section>

    <!-- Le staff : ce qui est affiché dépend du rôle. -->
    <section v-if="voitLeStaff" class="bloc">
      <h2 class="surtitre">Le staff</h2>
      <ul class="staff">
        <li v-for="c in staff" :key="c.prenom + c.totem">
          <div class="staff__carte">
            <span class="staff__pastille">{{ c.prenom.charAt(0) }}</span>
            <span class="staff__texte">
              <span class="staff__prenom">{{ c.prenom }}</span>
              <span v-if="c.totem" class="staff__totem mono">{{ c.totem }}</span>
            </span>
            <span v-if="c.chefDeStaff" class="etiquette">Chef de staff</span>
            <span v-else-if="c.note" class="etiquette etiquette--sourde">{{ c.note }}</span>
          </div>
        </li>
      </ul>

      <div v-if="adresse" class="contact">
        <UiIcone nom="mail" :taille="18" />
        <a :href="`mailto:${adresse}`">{{ adresse }}</a>
      </div>
      <p v-else class="verrou">
        <UiIcone nom="cadenas" :taille="16" />
        L’adresse de la section est réservée aux familles de l’unité.
      </p>

      <p v-if="role === 'chef'" class="note-chantier">
        Les noms de famille, numéros et adresses personnelles des {{ staff.length }} chefs ne sont
        toujours pas dans le site. Le mécanisme d’accès existe désormais, mais il ne vaut pas
        consentement : il faudra le demander aux personnes concernées, une par une.
      </p>
    </section>

    <!-- L'année vue de haut. -->
    <section v-if="voitLeCalendrier && repartition.length" class="bloc">
      <h2 class="surtitre">Une saison, en gros</h2>
      <ul class="repartition">
        <li v-for="r in repartition" :key="r.type">
          <span class="repartition__barre">
            <span
              class="repartition__jauge"
              :style="{
                inlineSize: `${(r.n / total) * 100}%`,
                background: r.teinte,
              }"
            />
          </span>
          <span class="repartition__nom">{{ r.nom }}</span>
          <span class="repartition__n mono">{{ r.n }}</span>
        </li>
      </ul>
    </section>

    <!-- L'agenda complet de la section. -->
    <section v-if="voitLeCalendrier" class="bloc">
      <h2 class="surtitre">Le calendrier de la section</h2>
      <ul class="agenda">
        <li v-for="j in agenda" :key="j.date" class="agenda__ligne">
          <span class="agenda__date mono">{{ formaterDate(j.date) }}</span>
          <span
            class="agenda__code mono"
            :style="{ color: j.type ? typesReunion[j.type].teinte : undefined }"
            >{{ j.type ? typesReunion[j.type].code : '—' }}</span
          >
          <span class="agenda__libelle">{{ j.libelle }}</span>
          <span v-if="j.evenement" class="etiquette agenda__event">{{ j.evenement }}</span>
        </li>
      </ul>
      <p v-if="!agenda.length" class="doux">
        Plus de date à venir cette saison. Le calendrier reprend à la rentrée.
      </p>

      <button
        v-if="agendaPasse.length"
        class="bouton bouton--fantome agenda__bascule"
        type="button"
        @click="montrerPasse = !montrerPasse"
      >
        {{ montrerPasse ? 'Masquer' : 'Voir' }} les {{ agendaPasse.length }} dates passées
      </button>
      <ul v-if="montrerPasse" class="agenda agenda--passe">
        <li v-for="j in agendaPasse" :key="j.date" class="agenda__ligne">
          <span class="agenda__date mono">{{ formaterDate(j.date) }}</span>
          <span class="agenda__code mono">{{ j.type ? typesReunion[j.type].code : '—' }}</span>
          <span class="agenda__libelle">{{ j.libelle }}</span>
        </li>
      </ul>
    </section>

    <section v-if="!voitLeCalendrier" class="bloc">
      <!-- Ce qu'un visiteur a le droit de savoir : quand la section se réunit.
           Pas ce qu'elle y fait. -->
      <div v-if="prochainDimanche()" class="prochaine">
        <UiIcone nom="calendrier" :taille="20" />
        <div>
          <p class="prochaine__titre">Prochaine réunion</p>
          <p class="prochaine__date">
            {{ formaterDate(prochainDimanche()!.date, true) }},
            {{ prochainDimanche()!.horaire === 'hiver' ? 'de 14h à 17h' : 'de 14h à 17h30' }}
          </p>
          <p v-if="prochainDimanche()!.evenement" class="prochaine__event">
            {{ prochainDimanche()!.evenement }}
          </p>
        </div>
      </div>

      <div class="reserve">
        <UiIcone nom="cadenas" :taille="20" />
        <div>
          <p class="reserve__titre">Le reste est réservé aux familles</p>
          <p class="reserve__texte">
            Le programme de chaque dimanche, le staff de la section et son adresse de contact ne
            sont pas publics. Pour découvrir la section, le plus simple est de venir aux portes
            ouvertes de septembre.
          </p>
          <NuxtLink class="lien-fleche reserve__lien" to="/events">
            Les rendez-vous ouverts à tous
            <UiIcone nom="chevrons-droite" :taille="14" />
          </NuxtLink>
        </div>
      </div>
    </section>

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
.prochaine {
  display: flex;
  gap: 0.85rem;
  padding: 1.1rem 1.25rem;
  margin-block-end: 0.6rem;
  background: color-mix(in srgb, var(--section-teinte) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--section-teinte) 26%, transparent);
  border-radius: $r-carte;
  color: var(--section-teinte);
  max-inline-size: 44rem;

  &__titre {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  &__date {
    margin-block-start: 0.2rem;
    font-size: 1rem;
    font-weight: 600;
    color: $blanc;
  }

  &__event {
    margin-block-start: 0.15rem;
    font-size: 1rem;
    color: rgba($blanc, 0.7);
  }
}

.reserve {
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
    font-size: 1rem;
    color: $blanc;
  }

  &__texte {
    margin-block-start: 0.35rem;
    font-size: 1rem;
    line-height: 1.6;
  }

  &__lien {
    padding-inline: 0;
    margin-block-start: 0.6rem;
  }
}

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

.bloc {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.prochaine {
  padding: 1.1rem 1.25rem;
  background: $ardoise;
  border-radius: $r-carte;
  border-inline-start: 3px solid var(--section-teinte);

  &__date {
    text-transform: capitalize;
  }

  &__quoi {
    margin-block-start: 0.25rem;
    font-size: 1rem;
    color: rgba($blanc, 0.8);
  }

  &__horaire {
    margin-block-start: 0.35rem;
    font-size: 1rem;
  }
}

.fiche {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
  gap: 0.75rem;
  margin: 0.5rem 0 0;

  &__ligne {
    padding: 0.75rem 0.9rem;
    background: rgba($blanc, 0.03);
    border-radius: $r-champ;

    dt {
      @include surtitre;
      font-size: 0.75rem;
    }
    dd {
      margin: 0.25rem 0 0;
      font-size: 1rem;
      font-weight: 500;
    }
  }
}

.staff {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr));
  gap: 0.5rem;
  margin: 0;

  &__carte {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.55rem 0.7rem;
    background: rgba($blanc, 0.035);
    border-radius: $r-champ;
  }

  &__pastille {
    display: grid;
    place-items: center;
    inline-size: 2rem;
    block-size: 2rem;
    border-radius: 50%;
    background: color-mix(in srgb, var(--section-teinte) 20%, transparent);
    color: var(--section-teinte);
    font-weight: 700;
    font-size: 1rem;
  }

  &__texte {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-inline-size: 0;
  }

  &__prenom {
    font-size: 1rem;
    font-weight: 500;
  }

  &__totem {
    font-size: 0.75rem;
    color: rgba($blanc, 0.6);
  }
}

.contact {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-block-start: 0.5rem;
  color: var(--section-teinte);
  font-size: 1rem;

  a {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
}

.verrou,
.note-chantier {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-block-start: 0.5rem;
  font-size: 1rem;
  color: rgba($blanc, 0.6);
}

.note-chantier {
  display: block;
  padding: 0.75rem 0.9rem;
  background: rgba(#f0a32e, 0.08);
  border: 1px solid rgba(#f0a32e, 0.2);
  border-radius: $r-champ;
  color: rgba(#f0a32e, 0.85);
  line-height: 1.55;
}

.repartition {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin: 0;

  li {
    display: grid;
    grid-template-columns: minmax(6rem, 12rem) 1fr auto;
    align-items: center;
    gap: 0.75rem;
  }

  &__barre {
    block-size: 0.5rem;
    background: rgba($blanc, 0.06);
    border-radius: $r-pilule;
    overflow: hidden;
  }

  &__jauge {
    display: block;
    block-size: 100%;
    border-radius: $r-pilule;
  }

  &__nom {
    font-size: 1rem;
    color: rgba($blanc, 0.7);
  }

  &__n {
    font-size: 1rem;
    color: rgba($blanc, 0.6);
  }
}

.agenda {
  display: flex;
  flex-direction: column;
  margin: 0;

  &--passe {
    opacity: 0.72;
    margin-block-start: 0.5rem;
  }

  &__ligne {
    display: grid;
    grid-template-columns: 8.5rem 2rem 1fr auto;
    align-items: baseline;
    gap: 0.75rem;
    padding: 0.5rem 0.25rem;
    border-block-end: 1px solid rgba($blanc, 0.06);

    @include jusqua($bp-poche) {
      grid-template-columns: 1fr;
      gap: 0.15rem;
    }
  }

  &__date {
    font-size: 0.75rem;
    color: rgba($blanc, 0.64);
  }

  &__code {
    font-size: 0.75rem;
    font-weight: 500;
    color: rgba($blanc, 0.58);
  }

  &__libelle {
    font-size: 1rem;
  }

  &__event {
    color: $rouge-texte;
  }

  &__bascule {
    align-self: flex-start;
    margin-block-start: 0.75rem;
  }
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
