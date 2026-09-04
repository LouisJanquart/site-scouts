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
    :chapo="`${unite.nomComplet}. Six sections animées, une route, un staff d’unité, et des réunions tous les dimanches de septembre à mai.`"
  >
    <template #entete>
      <div class="blason">
        <img src="/logo/blason.svg" alt="Blason de la 16e Fleurus, Scouts et Guides" />
      </div>
    </template>

    <section class="bloc">
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
    </section>

    <section class="bloc">
      <h2 class="surtitre">L’unité</h2>
      <div class="prose">
        <p>
          La {{ unite.numero }} {{ unite.ville }} est une unité scoute et guide de la paroisse
          {{ unite.paroisse }}, active depuis {{ unite.fondation }}. Six sections animées y
          couvrent les âges de cinq à dix-huit ans, la Route rassemble les plus de dix-huit ans,
          et un staff d’unité coordonne l’ensemble.
        </p>
        <p>
          Les réunions ont lieu le dimanche après-midi, de la rentrée de septembre à la mi-mai. À
          cela s’ajoutent les hikes, les grandes sorties, les weekends, et le camp d’été en
          juillet.
        </p>
        <p>
          L’unité vit aussi de ses événements : le souper dias en octobre, la veillée de Noël, la
          marche Adeps en mars, la cavalcade de Fleurus. Ce sont eux qui financent le matériel, les
          tentes et une partie des camps.
        </p>
      </div>
    </section>

    <section class="bloc">
      <h2 class="surtitre">À propos de ce site</h2>
      <div class="prose">
        <p>
          Ce site est un chantier, pas un site publié. Il a été construit à partir de ce que
          l’unité possède déjà : le classeur de planning tenu par le staff d’unité, le tableau des
          contacts, le blason vectoriel des archives, et des photos de camp.
        </p>
        <p>
          Les textes des sections et des actualités sont des propositions rédigées à partir de ces
          sources. Ils doivent être relus et corrigés par les personnes concernées avant toute mise
          en ligne réelle.
        </p>
        <p>
          Plusieurs informations manquent encore : l’adresse du local, le montant de la cotisation,
          le détail de l’uniforme, les adresses des réseaux sociaux. Elles sont signalées comme
          telles plutôt qu’inventées.
        </p>
      </div>
    </section>

    <section class="bloc">
      <h2 class="surtitre">Contact</h2>
      <p class="prose">
        <a :href="`mailto:${unite.emailUnite}`">{{ unite.emailUnite }}</a>
      </p>
      <AppReseaux />
    </section>
  </AppPage>
</template>

<style lang="scss" scoped>
.blason {
  inline-size: 9rem;
  margin-block: 1.5rem 0.5rem;

  img {
    inline-size: 100%;
  }
}

.bloc {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.chiffres {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
  gap: 0.75rem;
  margin: 0;

  li {
    display: flex;
    flex-direction: column;
    padding: 1rem 1.15rem;
    background: rgba($blanc, 0.035);
    border-radius: $r-champ;
  }

  &__n {
    font-family: $police-titre;
    font-weight: 700;
    font-size: 2rem;
    line-height: 1.1;
    color: $rouge;
    font-variant-numeric: tabular-nums;
  }

  &__quoi {
    margin-block-start: 0.2rem;
    font-size: 1rem;
    color: rgba($blanc, 0.62);
    line-height: 1.4;
  }
}
</style>
