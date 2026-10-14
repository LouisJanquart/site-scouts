<script setup lang="ts">
// La rubrique du staff : une carte à jouer par animateur, qui défile à
// l'horizontale. Pour un visiteur, les cartes sont retournées : le staff n'est
// pas public.
import type { CompositionSpec } from '~/utils/bento'
import type { Section } from '~/data/sections'

const props = defineProps<{ section: Section; numero: string }>()

const { voitLeStaff } = useRole()
const { chefsDeSection, adressesDeSection } = useContenu()

const staff = computed(() => {
  const s = chefsDeSection(props.section.slug)
  // Le chef de staff en premier, comme la carte maîtresse du jeu.
  return [...s].sort((a, b) => Number(!!b.chefDeStaff) - Number(!!a.chefDeStaff))
})
const adresse = computed(() => adressesDeSection.value[props.section.slug] ?? null)
const inclinaisons = [2, -3, -1.5, 2.5, -2, 1.5, -1]

const spec: CompositionSpec = {
  lignes: {
    v: [[0.3445, 0], [0.314, 1]],
    h: [[0, 0.6], [0.33, 0.57]],
  },
  zones: {
    intro: { coins: [['gauche', 0, 'haut', 0], ['v', -1, 'haut', 0], ['v', -1, 'h', -1], ['gauche', 0, 'h', -1]] },
    rejoindre: { coins: [['gauche', 0, 'h', 1], ['v', -1, 'h', 1], ['v', -1, 'bas', 0], ['gauche', 0, 'bas', 0]] },
    cartes: { coins: [['v', 1, 'haut', 0], ['droite', 0, 'haut', 0], ['droite', 0, 'bas', 0], ['v', 1, 'bas', 0]] },
  },
}
</script>

<template>
  <BentoComposition :spec="spec" :marge="[32, 36]">
    <template #intro>
      <p class="rub-surtitre">Rubrique {{ numero }} · le staff</p>
      <h2 class="rub-titre">Le staff</h2>
      <p class="rub-texte intro__texte">
        Des animatrices et animateurs bénévoles, formés et brevetés pour la plupart. Chaque carte,
        c’est quelqu’un que ton enfant croise le samedi.
      </p>
      <ul v-if="voitLeStaff && staff.length" class="rub-chiffres intro__chiffres">
        <li><b>{{ staff.length }}</b><span>au staff</span></li>
      </ul>
      <p class="intro__astuce">
        {{ voitLeStaff ? 'Survole une carte : elle se penche vers ta souris.' : 'Les cartes se retournent une fois connecté.' }}
      </p>
    </template>

    <template #rejoindre>
      <UiIcone :nom="voitLeStaff ? 'mail' : 'profil'" :taille="24" class="rejoindre__icone" />
      <template v-if="voitLeStaff">
        <p class="rejoindre__titre">Une question pour le staff ?</p>
        <a v-if="adresse" class="lien-fleche" :href="`mailto:${adresse}`">
          {{ adresse }}
        </a>
        <p v-else class="rub-texte">L’adresse de la section arrive bientôt.</p>
      </template>
      <template v-else>
        <p class="rejoindre__titre">Réservé aux familles</p>
        <p class="rub-texte">Les noms et le contact du staff se voient avec le compte de la famille.</p>
        <NuxtLink class="rub-bouton" to="/connexion">Se connecter</NuxtLink>
      </template>
    </template>

    <template #cartes>
      <BentoPiste
        :titre="voitLeStaff ? `${staff.length} cartes · fais défiler` : 'Le jeu du staff'"
        :total="voitLeStaff ? staff.length : 0"
        respiration="2.5rem"
        etiquette-liste="Le staff de la section"
        class="cartes"
      >
        <template v-if="voitLeStaff && staff.length">
          <SectionCarteStaff
            v-for="(c, i) in staff"
            :key="c.prenom + c.totem"
            :nom="c.totem ?? c.prenom"
            :prenom="c.prenom"
            :role="c.chefDeStaff ? 'Chef de staff' : 'Animation'"
            :note="c.note"
            :icone="section.icone"
            :inclinaison="inclinaisons[i % inclinaisons.length]"
          />
        </template>
        <template v-else>
          <SectionCarteStaff
            v-for="i in 5"
            :key="i"
            dos
            :icone="section.icone"
            :inclinaison="inclinaisons[i % inclinaisons.length]"
          />
        </template>
      </BentoPiste>
    </template>
  </BentoComposition>
</template>

<style lang="scss" scoped>
.intro__texte {
  margin-block-start: $esp-3;
}
.intro__chiffres {
  margin-block-start: $esp-5;
}
.intro__astuce {
  margin: auto 0 0;
  font-size: 0.8rem;
  color: rgba($blanc, 0.6);
}

.rejoindre__icone {
  color: var(--section-teinte);
}
.rejoindre__titre {
  margin: $esp-3 0 $esp-1;
  font-weight: 600;
  font-size: 1.05rem;
}
.rub-bouton {
  margin-block-start: $esp-3;
}

.cartes {
  --marge-droite: 36px;
  block-size: 100%;
}
</style>
