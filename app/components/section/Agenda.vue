<script setup lang="ts">
// La rubrique agenda : la saison en frise horizontale, du prochain samedi au
// camp. Un repère « aujourd'hui », la prochaine réunion mise en avant, les
// rendez-vous en rouge, les congés en pointillés.
//
// Un visiteur voit les samedis de l'unité et leur horaire, pas ce que la
// section y fait : c'est la règle de useRole (voitLeCalendrier).
import type { CompositionSpec } from '~/utils/bento'
import type { Section } from '~/data/sections'
import { typesReunion } from '~/composables/usePlanning'

const props = defineProps<{ section: Section; numero: string }>()

const { planningDeSection, joursDeReunion, aujourdhui, saison } = usePlanning()
const { voitLeCalendrier } = useRole()
const { evenements } = useContenu()

type Case = {
  date: string
  titre: string
  info: string
  genre: 'prochaine' | 'rdv' | 'conge' | 'normal'
  mois: string | null
}

const MOIS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

function horaire(h: string | null | undefined) {
  return h === 'hiver' ? '14h – 17h' : '14h – 17h30'
}

const cases = computed<Case[]>(() => {
  const jours = voitLeCalendrier.value
    ? planningDeSection(props.section.slug)
    : // Un visiteur ne voit que les samedis de l'unité, sans ce que la section
      // y fait : pas de titre ni de rendez-vous qui ne la concerneraient pas.
      joursDeReunion.value.map((j) => ({ ...j, evenement: null, remarque: null, libelle: '', type: null as any }))
  const avenir = jours.filter((j) => j.date >= aujourdhui.value)
  let moisPrec = ''
  let prochaineVue = false
  return avenir.map((j) => {
    const m = MOIS[Number(j.date.slice(5, 7)) - 1]!
    const mois = m !== moisPrec ? m : null
    moisPrec = m
    const conge = j.type === 'relache'
    const rdv = j.type === 'unite' || j.type === 'grande-sortie' || !!j.evenement
    let genre: Case['genre'] = conge ? 'conge' : rdv ? 'rdv' : 'normal'
    if (!conge && !prochaineVue) {
      genre = 'prochaine'
      prochaineVue = true
    }
    const titre = conge
      ? 'Pas de réunion'
      : j.type && j.type !== 'normale'
        ? sansCode(j.libelle) || typesReunion[j.type as keyof typeof typesReunion].nom
        : j.evenement ?? (voitLeCalendrier.value ? 'Réunion au local' : 'Samedi de réunion')
    const info = conge ? sansCode(j.libelle) || 'Congé' : j.remarque ?? horaire(j.horaire)
    return { date: j.date, titre, info, genre, mois }
  })
})

const camp = computed(() =>
  evenements.value.find(
    (e: any) => e.slug.startsWith('camp-') && e.section === props.section.slug && e.date >= aujourdhui.value,
  ) ?? null,
)
const joursAvantCamp = computed(() => {
  if (!camp.value) return null
  const d = new Date(camp.value.date + 'T12:00:00').getTime() - new Date(aujourdhui.value + 'T12:00:00').getTime()
  return Math.round(d / 864e5)
})

const spec: CompositionSpec = {
  lignes: {
    v: [[0.3415, 0], [0.317, 0.66]],
    h: [[0, 0.683], [1, 0.66]],
    vb: [[0.579, 0.672], [0.61, 1]],
  },
  zones: {
    intro: { coins: [['gauche', 0, 'haut', 0], ['v', -1, 'haut', 0], ['v', -1, 'h', -1], ['gauche', 0, 'h', -1]] },
    frise: { coins: [['v', 1, 'haut', 0], ['droite', 0, 'haut', 0], ['droite', 0, 'h', -1], ['v', 1, 'h', -1]] },
    camp: { coins: [['gauche', 0, 'h', 1], ['vb', -1, 'h', 1], ['vb', -1, 'bas', 0], ['gauche', 0, 'bas', 0]] },
    synchro: { coins: [['vb', 1, 'h', 1], ['droite', 0, 'h', 1], ['droite', 0, 'bas', 0], ['vb', 1, 'bas', 0]] },
  },
}
</script>

<template>
  <BentoComposition
    :spec="spec"
    :fonds="{ camp: { image: '/images/camp-prairie-large.jpg', voile: 'gauche' } }"
    :marge="[28, 36]"
  >
    <template #intro>
      <p class="rub-surtitre">Rubrique {{ numero }} · l’agenda</p>
      <h2 class="rub-titre">L’agenda</h2>
      <p class="rub-texte intro__texte">
        Toutes les réunions de la section, de septembre au camp. Le samedi au local, sauf mention
        contraire.
      </p>
      <ul class="legende">
        <li><i class="legende__point" /> Réunion</li>
        <li><i class="legende__point legende__point--rdv" /> Rendez-vous</li>
        <li><i class="legende__point legende__point--conge" /> Congé</li>
      </ul>
      <NuxtLink class="lien-fleche intro__lien" to="/calendrier">
        Le calendrier de toute l’unité <UiIcone nom="chevrons-droite" :taille="14" />
      </NuxtLink>
    </template>

    <template #frise>
      <BentoPiste
        :titre="`Saison ${saison} · ${cases.length} samedis à venir`"
        respiration="0.25rem"
        etiquette-liste="Les samedis à venir"
        class="frise"
      >
        <li
          v-for="c in cases"
          :key="c.date"
          class="jour"
          :class="`jour--${c.genre}`"
        >
          <span class="jour__mois mono">{{ c.mois ?? '' }}</span>
          <div class="jour__carte">
            <span class="rub-ticket" :class="{ 'rub-ticket--eteint': c.genre === 'conge' }" aria-hidden="true">
              <span>{{ nomJour(c.date).slice(0, 3) }}</span>
              <strong>{{ Number(c.date.slice(8)) }}</strong>
              <span>{{ formaterDateCourte(c.date).split(' ')[1] }}</span>
            </span>
            <span class="lecteur-seul">{{ formaterDate(c.date, true) }}</span>
            <span class="jour__titre">{{ c.titre }}</span>
            <span class="jour__info">{{ c.info }}</span>
            <span v-if="c.genre === 'prochaine'" class="jour__tag mono">La prochaine</span>
            <span v-else-if="c.genre === 'rdv'" class="jour__tag jour__tag--rdv mono">Rendez-vous</span>
          </div>
        </li>
      </BentoPiste>
    </template>

    <template #camp>
      <span class="camp__etiquette mono">Le grand camp</span>
      <div class="camp__corps">
        <div>
          <p class="camp__titre">{{ camp ? formaterDate(camp.date) : 'En juillet' }}</p>
          <p class="camp__texte">
            {{ camp?.resume ?? 'Les dates et le lieu du camp sont annoncés au printemps, avec la liste du matériel.' }}
          </p>
        </div>
        <p v-if="joursAvantCamp !== null" class="camp__compte">
          <b>{{ joursAvantCamp }}</b><span>jours avant le départ</span>
        </p>
      </div>
    </template>

    <template #synchro>
      <UiIcone nom="calendrier" :taille="24" class="synchro__icone" />
      <p class="synchro__titre">Tout l’agenda de la section dans ton téléphone</p>
      <p class="rub-texte">
        Google, Apple ou Outlook : les dates se mettent à jour toutes seules.
      </p>
      <NuxtLink
        class="rub-bouton rub-bouton--plein synchro__bouton"
        :to="voitLeCalendrier ? '/calendrier' : '/connexion?suite=/calendrier'"
      >
        {{ voitLeCalendrier ? 'S’abonner' : 'Se connecter pour s’abonner' }}
      </NuxtLink>
    </template>
  </BentoComposition>
</template>

<style lang="scss" scoped>
.intro__texte {
  margin-block-start: $esp-3;
}
.intro__lien {
  margin-block-start: auto;
  font-size: 0.9rem;
}

.legende {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  margin: $esp-4 0 0;
  padding: 0;
  list-style: none;
  font-size: 0.85rem;

  li {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  &__point {
    inline-size: 0.55rem;
    block-size: 0.55rem;
    border-radius: 50%;
    background: var(--section-teinte);

    &--rdv {
      background: $rouge-texte;
    }
    &--conge {
      background: rgba($blanc, 0.4);
    }
  }
}

.frise {
  --marge-droite: 36px;
  block-size: 100%;
}

.jour {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  inline-size: 9.5rem;
  block-size: 100%;
  justify-content: center;

  &__mois {
    block-size: 1rem;
    font-size: 0.7rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba($blanc, 0.6);
  }

  &__carte {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    min-block-size: 13rem;
    padding: 1rem;
    border-radius: 1.25rem;
    background: $ardoise;
  }

  &__titre {
    margin-block-start: 0.6rem;
    font-size: 0.9rem;
    font-weight: 600;
    line-height: 1.3;
  }

  &__info {
    font-size: 0.78rem;
    color: rgba($blanc, 0.6);
  }

  &__tag {
    margin-block-start: auto;
    font-size: 0.66rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--section-teinte);

    &--rdv {
      color: $rouge-texte;
    }
  }

  &--prochaine &__carte {
    background: $ardoise-clair;
    box-shadow: inset 0 0 0 2px var(--section-teinte);
  }
  &--rdv &__carte {
    box-shadow: inset 0 0 0 1.5px $rouge-texte;
  }
  &--conge &__carte {
    background: transparent;
    outline: 1.5px dashed rgba($blanc, 0.18);
    outline-offset: -1.5px;
  }
  &--conge &__titre {
    color: rgba($blanc, 0.6);
  }
}

.camp__etiquette {
  inline-size: fit-content;
  padding: 0.3rem 0.8rem;
  border-radius: $r-pilule;
  background: var(--section-teinte);
  color: $noir-profond;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.camp__corps {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: $esp-5;
  margin-block-start: auto;
}
.camp__titre {
  margin: 0;
  font-family: $police-titre;
  font-weight: 800;
  font-variation-settings: 'wdth' 118;
  font-size: clamp(1.5rem, 2.2vw, 2rem);
  text-transform: uppercase;
  @include sur-photo;
}
.camp__texte {
  margin: 0.4rem 0 0;
  max-inline-size: 34ch;
  font-size: 0.88rem;
  line-height: 1.5;
  @include sur-photo;
}
.camp__compte {
  margin: 0;
  b {
    display: block;
    font-family: $police-titre;
    font-weight: 800;
    font-size: 2.4rem;
    color: var(--section-teinte);
  }
  span {
    font-size: 0.8rem;
  }
}

.synchro__icone {
  color: $cyan;
}
.synchro__titre {
  margin: $esp-3 0 $esp-1;
  font-weight: 600;
  font-size: 1.05rem;
}
.synchro__bouton {
  margin-block-start: auto;
  align-self: flex-end;
}
</style>
