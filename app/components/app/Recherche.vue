<script setup lang="ts">
import { sections } from '~/data/sections'
import { infosPratiques } from '~/data/unite'

// Recherche sur tout ce que le compte a le droit de voir : sections, événements,
// actualités, questions pratiques et les dates du planning.
//
// L'index se construit dans le navigateur, mais il ne contient que ce que le
// serveur a bien voulu envoyer. Autrement dit : la recherche d'un visiteur ne
// peut pas faire remonter un rendez-vous réservé, parce qu'il n'est pas là.

const ouverte = defineModel<boolean>('ouverte', { default: false })
const { evenements, actus, planning } = useContenu()
const requete = ref('')
const champ = ref<HTMLInputElement | null>(null)

interface Resultat {
  titre: string
  detail: string
  categorie: string
  url: string
  icone: string
}

function normaliser(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

const index = computed<Resultat[]>(() => {
  const out: Resultat[] = []

  for (const s of sections) {
    out.push({
      titre: s.nom,
      detail: s.ages ? `${s.ages} · ${s.resume}` : s.resume,
      categorie: 'Section',
      url: `/sections/${s.slug}`,
      icone: s.icone,
    })
  }
  for (const e of evenements.value) {
    out.push({
      titre: e.titre,
      detail: `${formaterDate(e.date)} · ${e.lieu}`,
      categorie: 'Événement',
      url: `/events/${e.slug}`,
      icone: 'calendrier',
    })
  }
  for (const a of actus.value) {
    out.push({
      titre: a.titre,
      detail: a.chapo,
      categorie: 'Actu',
      url: `/actus/${a.slug}`,
      icone: 'document',
    })
  }
  for (const i of infosPratiques) {
    out.push({
      titre: i.question,
      detail: i.reponse.slice(0, 110) + '…',
      categorie: 'Info pratique',
      url: '/infos',
      icone: 'info',
    })
  }
  // Les dates d'événements du classeur. Pour un visiteur, le serveur n'a laissé
  // passer que celles des rendez-vous ouverts au dehors.
  for (const j of planning.value) {
    if (j.evenement) {
      out.push({
        titre: j.evenement,
        detail: formaterDate(j.date, true),
        categorie: 'Planning',
        url: '/calendrier',
        icone: 'calendrier',
      })
    }
  }
  return out
})

const resultats = computed(() => {
  const q = normaliser(requete.value.trim())
  if (q.length < 2) return []
  return index.value
    .map((r) => {
      const titre = normaliser(r.titre)
      const detail = normaliser(r.detail)
      let score = 0
      if (titre.startsWith(q)) score = 3
      else if (titre.includes(q)) score = 2
      else if (detail.includes(q)) score = 1
      return { r, score }
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((x) => x.r)
})

watch(ouverte, async (v) => {
  if (v) {
    await nextTick()
    champ.value?.focus()
  } else {
    requete.value = ''
  }
})

function fermer() {
  ouverte.value = false
}
</script>

<template>
  <div v-if="ouverte" class="recherche" role="dialog" aria-label="Recherche">
    <div class="recherche__champ">
      <UiIcone nom="recherche" :taille="18" class="doux" />
      <input
        ref="champ"
        v-model="requete"
        type="search"
        class="recherche__saisie"
        placeholder="Chercher une section, un événement, une date…"
        aria-label="Rechercher sur le site"
        @keydown.esc="fermer"
      />
      <button class="recherche__fermer" type="button" aria-label="Fermer la recherche" @click="fermer">
        <UiIcone nom="croix" :taille="16" />
      </button>
    </div>

    <ul v-if="resultats.length" class="recherche__liste">
      <li v-for="r in resultats" :key="r.url + r.titre">
        <NuxtLink class="recherche__item" :to="r.url" @click="fermer">
          <UiIcone :nom="r.icone" :taille="18" class="recherche__icone" />
          <span class="recherche__texte">
            <span class="recherche__titre">{{ r.titre }}</span>
            <span class="recherche__detail">{{ r.detail }}</span>
          </span>
          <span class="recherche__categorie mono">{{ r.categorie }}</span>
        </NuxtLink>
      </li>
    </ul>

    <p v-else-if="requete.trim().length >= 2" class="recherche__vide doux">
      Rien trouvé pour « {{ requete }} ».
    </p>
  </div>
</template>

<style lang="scss" scoped>
.recherche {
  inline-size: min(26rem, calc(100vw - 2rem));
  background: rgba(#141520, 0.96);
  backdrop-filter: blur(24px);
  border: 1px solid rgba($blanc, 0.08);
  border-radius: $r-carte;
  box-shadow: 0 24px 64px -24px rgba(#000, 0.8);
  overflow: hidden;

  &__champ {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.75rem 0.9rem;
    border-block-end: 1px solid rgba($blanc, 0.07);
  }

  &__saisie {
    flex: 1;
    min-inline-size: 0;
    background: none;
    border: 0;
    color: $blanc;
    font-size: 0.9rem;
    outline: none;

    &::placeholder {
      color: rgba($blanc, 0.58);
    }
    &::-webkit-search-cancel-button {
      display: none;
    }
  }

  &__fermer {
    color: rgba($blanc, 0.6);
    display: grid;
    place-items: center;

    &:hover {
      color: $blanc;
    }
    @include focus-visible;
  }

  &__liste {
    max-block-size: 22rem;
    margin: 0;
    @include defilement-discret;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    padding: 0.6rem 0.9rem;
    transition: background $vite $courbe;

    @include focus-visible;

    &:hover {
      background: rgba($blanc, 0.05);
    }
  }

  &__icone {
    color: var(--section-teinte);
  }

  &__texte {
    display: flex;
    flex-direction: column;
    min-inline-size: 0;
    flex: 1;
  }

  &__titre {
    font-size: 0.85rem;
    font-weight: 500;
  }

  &__detail {
    font-size: 0.72rem;
    color: rgba($blanc, 0.62);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__categorie {
    font-size: 0.6rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: rgba($blanc, 0.55);
    white-space: nowrap;
  }

  &__vide {
    padding: 1rem 0.9rem;
    font-size: 0.85rem;
  }
}
</style>
