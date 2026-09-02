<script setup lang="ts">
import { infosPratiques, horaires, unite } from '~/data/unite'
import { sectionsAnimees } from '~/data/sections'

useHead({ title: 'Infos pratiques — 16e Fleurus' })
</script>

<template>
  <AppPage
    titre="Tout ce qu’un parent demande"
    surtitre="Infos pratiques"
    chapo="Les horaires, l’inscription, l’uniforme, le camp. Si la réponse n’est pas là, écrivez au staff d’unité."
  >
    <section class="bloc">
      <h2 class="surtitre">Les horaires</h2>
      <div class="horaires">
        <div v-for="h in horaires" :key="h.cle" class="horaires__carte">
          <p class="horaires__nom titre titre--petit">{{ h.nom }}</p>
          <p class="horaires__heures mono">{{ h.heures }}</p>
          <p class="horaires__periode">{{ h.periode }}</p>
        </div>
      </div>
      <p class="doux petit">
        Les réunions ont lieu le dimanche après-midi. Hikes, grandes sorties et réunions spéciales
        ont leurs propres horaires, annoncés par chaque section.
      </p>
    </section>

    <section class="bloc">
      <h2 class="surtitre">Quel âge, quelle section</h2>
      <ul class="ages">
        <li v-for="s in sectionsAnimees" :key="s.slug" :data-section="s.slug">
          <NuxtLink class="ages__lien" :to="`/sections/${s.slug}`">
            <UiIcone :nom="s.icone" :taille="18" />
            <span class="ages__nom">{{ s.nom }}</span>
            <span class="ages__age mono">{{ s.ages }}</span>
          </NuxtLink>
        </li>
      </ul>
    </section>

    <section class="bloc">
      <h2 class="surtitre">Les questions qui reviennent</h2>
      <ul class="faq">
        <li v-for="(q, i) in infosPratiques" :key="i">
          <details class="faq__item">
            <summary class="faq__question">
              {{ q.question }}
              <span v-if="q.aCompleter" class="etiquette faq__todo">à compléter</span>
            </summary>
            <p class="faq__reponse">{{ q.reponse }}</p>
          </details>
        </li>
      </ul>
    </section>

    <section class="bloc">
      <h2 class="surtitre">Écrire à l’unité</h2>
      <p class="prose">
        <a :href="`mailto:${unite.emailUnite}`">{{ unite.emailUnite }}</a> arrive au staff
        d’unité. Pour une question sur une section précise, l’adresse de la section est plus
        rapide : elle figure sur sa page.
      </p>
    </section>
  </AppPage>
</template>

<style lang="scss" scoped>
.bloc {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.petit {
  font-size: 0.85rem;
  max-inline-size: 44rem;
}

.horaires {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  gap: 0.75rem;

  &__carte {
    padding: 1.1rem 1.25rem;
    background: $ardoise;
    border-radius: $r-carte;
  }

  &__heures {
    margin-block-start: 0.35rem;
    font-size: 1.35rem;
    color: $cyan;
  }

  &__periode {
    margin-block-start: 0.35rem;
    font-size: 0.78rem;
    color: rgba($blanc, 0.62);
    line-height: 1.5;
  }
}

.ages {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
  gap: 0.4rem;
  margin: 0;

  &__lien {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.6rem 0.85rem;
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
    font-size: 0.88rem;
    font-weight: 500;
    color: $blanc;
  }

  &__age {
    font-size: 0.7rem;
  }
}

.faq {
  display: flex;
  flex-direction: column;
  margin: 0;
  max-inline-size: 48rem;

  &__item {
    border-block-end: 1px solid rgba($blanc, 0.07);
  }

  &__question {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.9rem 0.25rem;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    list-style: none;

    &::-webkit-details-marker {
      display: none;
    }

    &::after {
      content: '+';
      margin-inline-start: auto;
      font-family: $police-mono;
      color: rgba($blanc, 0.58);
      transition: transform $vite $courbe;
    }

    .faq__item[open] &::after {
      content: '−';
    }
  }

  &__todo {
    color: #f0a32e;
  }

  &__reponse {
    padding: 0 0.25rem 1rem;
    font-size: 0.9rem;
    line-height: 1.7;
    color: rgba($blanc, 0.68);
  }
}
</style>
