<script setup lang="ts">
import { unite } from '~/data/unite'
import { sections } from '~/data/sections'

// Le décompte des chefs et celui des dates viennent de l'API : ce sont les
// seules choses de cette page qui ne sont pas publiques par nature, et le
// décompte, lui, l'est.
const { planning, saison } = usePlanning()
const { totalChefs } = useContenu()

const nbEvenements = computed(() => planning.value.filter((j) => j.evenement).length)

useHead({ title: 'À propos — 16e Fleurus' })
</script>

<template>
  <AppPage
    :titre="`Une unité de ${new Date().getFullYear() - unite.fondation} ans`"
    surtitre="À propos"
    :chapo="`${unite.nomComplet}. Six sections animées, une route, un staff d’unité, et des réunions tous les samedis de septembre à mai.`"
    bento
  >
    <div class="bento bento--etire">
    <UiBloc class="bento__4 blason-bloc" etiquette="Le blason" ton="rouge">
      <div class="blason">
        <img src="/logo/blason.svg" alt="Blason de la 16e Fleurus, Scouts et Guides" />
      </div>
    </UiBloc>

    <UiBloc class="bento__8" etiquette="En chiffres">
      <ul class="chiffres">
        <li>
          <span class="chiffres__n mono">{{ sections.filter((s) => s.animee).length }}</span>
          <span class="chiffres__quoi">sections animées</span>
        </li>
        <li>
          <span class="chiffres__n mono">{{ totalChefs }}</span>
          <span class="chiffres__quoi">chefs et routiers</span>
        </li>
        <li>
          <span class="chiffres__n mono">{{ planning.length }}</span>
          <span class="chiffres__quoi">dates dans la saison {{ saison }}</span>
        </li>
        <li>
          <span class="chiffres__n mono">{{ nbEvenements }}</span>
          <span class="chiffres__quoi">rendez-vous d’unité</span>
        </li>
      </ul>
    </UiBloc>

    <UiBloc class="bento__7" etiquette="L’unité">
      <div class="prose">
        <p>
          La {{ unite.numero }} {{ unite.ville }} est une unité scoute et guide de la paroisse
          {{ unite.paroisse }}, active depuis {{ unite.fondation }}. Six sections animées y
          couvrent les âges de cinq à dix-huit ans, la Route rassemble les plus de dix-huit ans,
          et un staff d’unité coordonne l’ensemble.
        </p>
        <p>
          Les réunions ont lieu le samedi après-midi, de la rentrée de septembre à la mi-mai. À
          cela s’ajoutent les hikes, les grandes sorties, les weekends, et le camp d’été en
          juillet.
        </p>
        <p>
          L’unité vit aussi de ses événements : le souper dias en octobre, la veillée de Noël, la
          marche Adeps en mars, la cavalcade de Fleurus. Ce sont eux qui financent le matériel, les
          tentes et une partie des camps.
        </p>
      </div>
    </UiBloc>

    <UiBloc class="bento__5" etiquette="À propos de ce site">
      <div class="prose">
        <p>
          Ce site est un chantier, pas un site publié. Il a été construit à partir de ce que
          l’unité possède déjà : le classeur de planning tenu par le staff d’unité, le tableau des
          contacts, le blason vectoriel des archives, et des photos de camp.
        </p>
        <p>
          Les textes des sections et des actualités sont des propositions rédigées à partir de ces
          sources. Ils doivent être relus et corrigés par les personnes concernées avant toute mise
          en ligne réelle.
        </p>
        <p>
          Plusieurs informations manquent encore : le montant exact de la cotisation, le détail de
          l’uniforme, les adresses des réseaux sociaux. Elles sont signalées comme
          telles plutôt qu’inventées.
        </p>
      </div>
    </UiBloc>

    <UiBloc etiquette="Contact" ton="section">
      <div class="contact">
        <a class="courriel mono" :href="`mailto:${unite.emailUnite}`">
          <UiIcone nom="mail" :taille="16" />
          {{ unite.emailUnite }}
        </a>
        <AppReseaux />
      </div>
    </UiBloc>
    </div>
  </AppPage>
</template>

<style lang="scss" scoped>
.blason-bloc :deep(.bloc__corps) {
  align-items: center;
  justify-content: center;
}

.blason {
  inline-size: min(11rem, 60%);

  img {
    display: block;
    inline-size: 100%;
  }
}

.chiffres {
  flex: 1;
  grid-auto-rows: 1fr;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: $esp-1;
  margin: 0;
  padding: 0;
  list-style: none;

  @include depuis($bp-poche) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  li {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: $esp-2;
    min-block-size: 7rem;
    padding: $esp-3;
    background: $ardoise;
    border-radius: $r-tuile;
  }

  &__n {
    font-family: $police-titre;
    font-variation-settings: 'wdth' 125;
    font-weight: 800;
    font-size: 2.5rem;
    line-height: 1;
    color: $rouge-texte;
    font-variant-numeric: tabular-nums;
  }

  &__quoi {
    margin-block-start: 0.35rem;
    font-size: 0.92rem;
    color: rgba($blanc, 0.7);
    line-height: 1.4;
  }
}

.contact {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: $esp-3;
}

.courriel {
  display: inline-flex;
  align-items: center;
  gap: $esp-1;
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
