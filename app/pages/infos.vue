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
    bento
  >
    <div class="bento bento--etire">
      <UiBloc class="bento__5" etiquette="Les horaires" ton="cyan">
        <UiPuits>
          <div v-for="h in horaires" :key="h.cle" class="horaire">
            <p class="horaire__nom">{{ h.nom }}</p>
            <p class="horaire__heures mono">{{ h.heures }}</p>
            <p class="horaire__periode">{{ h.periode }}</p>
          </div>
        </UiPuits>
        <p class="doux note">
          Les réunions ont lieu le samedi après-midi. Hikes, grandes sorties et réunions spéciales
          ont leurs propres horaires, annoncés par chaque section.
        </p>
      </UiBloc>

      <UiBloc class="bento__7" etiquette="Quel âge, quelle section">
        <ul class="inventaire ages">
          <li v-for="s in sectionsAnimees" :key="s.slug" :data-section="s.slug">
            <UiTuile :to="`/sections/${s.slug}`" :icone="s.icone" :libelle="s.nom" :sous="s.ages" />
          </li>
        </ul>
      </UiBloc>

      <UiBloc class="bento__8" etiquette="Les questions qui reviennent">
        <ul class="faq">
          <li v-for="(q, i) in infosPratiques" :key="i">
            <details class="faq__item">
              <summary class="faq__question">
                <span>{{ q.question }}</span>
                <span v-if="q.aCompleter" class="etiquette faq__todo">à compléter</span>
              </summary>
              <p class="faq__reponse">{{ q.reponse }}</p>
            </details>
          </li>
        </ul>
      </UiBloc>

      <UiBloc class="bento__4" etiquette="Écrire à l’unité" ton="section">
        <a class="courriel mono" :href="`mailto:${unite.emailUnite}`">
          <UiIcone nom="mail" :taille="16" />
          {{ unite.emailUnite }}
        </a>
        <p class="doux note">
          Cette adresse arrive au staff d’unité. Pour une question sur une section précise,
          l’adresse de la section est plus rapide : elle figure sur sa page.
        </p>
      </UiBloc>
    </div>
  </AppPage>
</template>

<style lang="scss" scoped>
.note {
  font-size: 0.92rem;
  line-height: 1.6;
}

.horaire {
  padding: $esp-3;
  background: $ardoise;
  border-radius: $r-tuile;

  &__nom {
    font-weight: 600;
  }

  &__heures {
    margin-block-start: 0.25rem;
    font-size: 1.35rem;
    color: $cyan;
  }

  &__periode {
    margin-block-start: 0.25rem;
    font-size: 0.92rem;
    color: rgba($blanc, 0.68);
    line-height: 1.5;
  }
}

.ages {
  grid-template-columns: repeat(auto-fill, minmax(8.5rem, 1fr));
}

.faq {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;

  &__item {
    border-block-end: 1px solid rgba($blanc, 0.08);
  }

  &__question {
    display: flex;
    align-items: center;
    gap: $esp-2;
    min-block-size: 2.75rem;
    padding: $esp-2 0;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    list-style: none;

    @include focus-visible;

    &::-webkit-details-marker {
      display: none;
    }

    &::after {
      content: '+';
      flex: none;
      margin-inline-start: auto;
      font-family: $police-mono;
      font-size: 1.1rem;
      color: rgba($blanc, 0.6);
    }

    .faq__item[open] &::after {
      content: '−';
    }
  }

  &__todo {
    flex: none;
    color: #f0a32e;
  }

  &__reponse {
    max-inline-size: 60ch;
    padding: 0 0 $esp-3;
    font-size: 1rem;
    line-height: 1.7;
    color: rgba($blanc, 0.72);
  }
}

.courriel {
  display: inline-flex;
  align-items: center;
  gap: $esp-1;
  align-self: flex-start;
  max-inline-size: 100%;
  padding: $esp-2 $esp-3;
  background: $ardoise;
  border-radius: $r-pilule;
  color: var(--section-teinte);
  font-size: 0.85rem;
  overflow-wrap: anywhere;

  @include focus-visible;
}
</style>
