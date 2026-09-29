<script setup lang="ts">
// L'agenda de la section : la saison vue de haut, puis date par date.
// Réservé aux familles — un visiteur ne voit que les jours de réunion.
import { typesReunion } from '~/composables/usePlanning'

const { slug, section } = useSectionCourante()
const { planningDeSection, prochainSamedi, aujourdhui } = usePlanning()
const { voitLeCalendrier } = useRole()

const agenda = computed(() =>
  planningDeSection(slug.value).filter((j) => j.date >= aujourdhui.value),
)
const agendaPasse = computed(() =>
  planningDeSection(slug.value)
    .filter((j) => j.date < aujourdhui.value)
    .reverse(),
)
const montrerPasse = ref(false)
const total = computed(() => planningDeSection(slug.value).length)

// Combien de fois chaque type de réunion revient dans l'année : une manière
// simple de dire à un parent à quoi ressemble une saison.
const repartition = computed(() => {
  const compte = new Map<string, number>()
  for (const j of planningDeSection(slug.value)) {
    if (j.type) compte.set(j.type, (compte.get(j.type) ?? 0) + 1)
  }
  return [...compte.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([type, n]) => ({ type, n, ...typesReunion[type as keyof typeof typesReunion] }))
})

useHead(() => ({ title: `Agenda ${section.value?.nom ?? ''} — 16e Fleurus` }))
</script>

<template>
  <template v-if="voitLeCalendrier">
    <section v-if="repartition.length" class="bloc">
      <h2 class="surtitre">Une saison, en gros</h2>
      <ul class="repartition">
        <li v-for="r in repartition" :key="r.type">
          <span class="repartition__barre">
            <span
              class="repartition__jauge"
              :style="{ inlineSize: `${(r.n / total) * 100}%`, background: r.teinte }"
            />
          </span>
          <span class="repartition__nom">{{ r.nom }}</span>
          <span class="repartition__n mono">{{ r.n }}</span>
        </li>
      </ul>
    </section>

    <section class="bloc">
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
  </template>

  <section v-else class="bloc">
    <div v-if="prochainSamedi()" class="prochaine">
      <UiIcone nom="calendrier" :taille="20" />
      <div>
        <p class="prochaine__titre">Prochaine réunion</p>
        <p class="prochaine__date">
          {{ formaterDate(prochainSamedi()!.date, true) }},
          {{ prochainSamedi()!.horaire === 'hiver' ? 'de 14h à 17h' : 'de 14h à 17h30' }}
        </p>
        <p v-if="prochainSamedi()!.evenement" class="prochaine__event">
          {{ prochainSamedi()!.evenement }}
        </p>
      </div>
    </div>

    <div class="reserve">
      <UiIcone nom="cadenas" :taille="20" />
      <div>
        <p class="reserve__titre">Le programme est réservé aux familles</p>
        <p class="reserve__texte">
          Les dates et les horaires sont publics, ce que chaque section y fait ne l’est pas.
          Connectez-vous pour voir le calendrier complet.
        </p>
        <NuxtLink class="lien-fleche reserve__lien" to="/connexion">
          Se connecter
          <UiIcone nom="chevrons-droite" :taille="14" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.bloc {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
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
</style>
