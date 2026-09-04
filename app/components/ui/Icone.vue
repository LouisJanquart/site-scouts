<script setup lang="ts">
// Deux jeux d'icônes, et c'est assumé.
//
// Le premier est celui de Louise, exporté de Figma : une grille de 48, un trait
// de 6, des bouts carrés, des lignes brisées plutôt que des courbes. C'est lui
// qui donne le ton — c'est celui de la maquette.
//
// Le second est le jeu de dépannage dessiné en attendant, sur une grille de 24.
// Il ne couvre plus que les icônes utilitaires que Louise n'a pas (encore)
// dessinées : enveloppe, poubelle, réglages, réseaux sociaux… On les rend avec
// un trait de 2,6 et des bouts carrés, pour qu'elles ne jurent pas trop à côté
// des siennes. Chaque icône qu'elle dessine vient remplacer la sienne ici.

const props = withDefaults(
  defineProps<{ nom: string; taille?: number | string; plein?: boolean }>(),
  { taille: 24, plein: false },
)

// Le jeu d'icônes de Louise, relevé sur ses SVG : grille de 48, trait de 6,
// bouts carrés. C'est un dessin anguleux, taillé à la serpe — rien à voir
// avec les icônes fines et rondes qu'on avait posées en attendant.
type Dessin = { t: string; f?: string; cap?: 'square' | 'butt' }

const dessins: Record<string, Dessin> = {
  etoile: { t: 'M23.9999 6V24M41.1189 18.4377L23.9999 24M34.58 38.5623L23.9999 24M13.4197 38.5623L23.9999 24M6.88086 18.4377L23.9999 24', cap: 'butt' },
  neige: { t: 'M28.551 6.58471L24.0002 23.9999M39.5325 14.9034L24.0002 23.9999M41.4154 28.5507L24.0002 23.9999M33.0968 39.5323L24.0002 23.9999M19.4494 41.4152L24.0002 23.9999M8.46789 33.0965L24.0002 23.9999M6.58497 19.4492L24.0002 23.9999M14.9037 8.46763L24.0002 23.9999', cap: 'butt' },
  eau: { t: 'M17 39L14 32V30L24 10L34 30V32L31 39L24 42L17 39Z' },
  feuille: { t: 'M6 42L14 34M14 34L24 24M14 34H27L36 28L42 17V6H31L20 12L14 23V34Z' },
  tente: { t: 'M6 42L24 15M24 15L42 42M24 15L18 6M24 15L30 6M22 42L24 39L26 42H22Z' },
  feu: { t: 'M6 42L24 36M42 30L24 36M24 36L42 42M24 36L6 30M32 20L24 26L16 20L24 8L32 20Z' },
  montagne: { t: 'M6 42L14 26L20 36L30 10L42 42' },
  arbre: { t: 'M24 42V27M31 32H34L40 30L42 24L40 18L34 16L31 9L24 6L17 9L14 16L8 18L6 24L8 30L14 32H17' },
  sapin: { t: 'M24 42V33M31 36H36L24 10L12 36H17' },
  lys: { t: 'M32 30V29L34 24L38 21H39M16 30V29L14 24L10 21H9M20 44H28', f: 'M14 34H11V40H14V34ZM34 40H37V34H34V40ZM24 32.5L21.0932 33.2421H26.9068L24 32.5ZM30 9L32.9068 9.74215L33.4325 7.68281L31.6641 6.50385L30 9ZM24 5L25.6641 2.50385L24 1.39445L22.3359 2.50385L24 5ZM18 9L16.3359 6.50385L14.5675 7.68281L15.0932 9.74215L18 9ZM14 40H24V34H14V40ZM24 40H34V34H24V40ZM26.9068 33.2421L32.9068 9.74215L27.0932 8.25785L21.0932 31.7579L26.9068 33.2421ZM31.6641 6.50385L25.6641 2.50385L22.3359 7.49615L28.3359 11.4962L31.6641 6.50385ZM22.3359 2.50385L16.3359 6.50385L19.6641 11.4962L25.6641 7.49615L22.3359 2.50385ZM15.0932 9.74215L21.0932 33.2421L26.9068 31.7579L20.9068 8.25785L15.0932 9.74215Z' },
  'croix-scoute': { t: 'M24 24V6M24 24H42M24 24V42M24 24H6M24 6H32M24 6H16M42 24V16M42 24V32M24 42H32M24 42H16M6 24V16M6 24V32' },
  promesse: { t: 'M34 32V33L31 39L24 42L17 39L13 33L24 28M32 24.5L33 22.5M27 17V6M20 17V5M13 20V10' },
  cool: { t: 'M34 32V33L31 39L24 42L17 39L13 33L24 28M32 24.5L33 22.5M27 19.5L28.5 16.5M20 17L23 5M13 20L8 10' },
  main: { t: 'M10 30.5V33L13 39L20 42L27 39L31 33L38 27M10 21V12M17 18V7M24 18V6M31 21V11' },
  pouce: { t: 'M37 42H30M40 35H29M40 28H30M38 21H32M21.5 42H16L10 38L8 31L10 24L16 20H22V8' },
  profil: { t: 'M42 42V41L35 33L24 31L13 33L6 41V42M24 7L32 15L24 23L16 15L24 7Z' },
  recherche: { t: 'M30 30L42 42M30 30L20 34L10 30L6 20L10 10L20 6L30 10L33.75 20L30 30Z' },
  menu: { t: 'M6 12H42M6 36H42M6 24H42' },
  check: { t: 'M42 10L20 36L6 22' },
  croix: { t: 'M10 10L24 24M38 38L24 24M24 24L38 10M24 24L10 38' },
  fleche: { t: 'M33 33L42 24L33 15M42 24H24M6 24H14M24 24V33M24 24V15M24 24H14M14 24V15M14 24V33' },
  nuage: { t: 'M34 36H14L8 34L6 28L8 22L14 20L17 13L24 10L31 13L34 20L40 22L42 28L40 34L34 36Z' },
  pluie: { t: 'M24 39V42M14 39V41M34 39V41M14 32H34L40 30L42 24L40 18L34 16L31 9L24 6L17 9L14 16L8 18L6 24L8 30L14 32Z' },
  soleil: { t: 'M34 14L24 10L14 14L10 24L14 34L24 38L34 34L38 24L34 14ZM24 7V6M24 42V41M41 24H42M7 24H6M36 12L37 11M12 12L11 11M12 36L11 37M36 36L37 37' },
  lune: { t: 'M21 8L16 12L12 17L10 24L12 31L16 36L21 40L28 42L35 40L29 32L27 24L29 16L35 8L28 6L21 8Z' },
  'chevrons-droite': { t: 'M28 12L40 24L28 36M10 36L22 24L10 12' },
  'chevrons-gauche': { t: 'M20 12L8 24L20 36M38 36L26 24L38 12' },
  chevron: { t: 'M18 12L30 24L18 36' },
  plus: { t: 'M24 8V40M8 24H40' },
  moins: { t: 'M8 24H40' },
}

// Le jeu de dépannage, grille de 24.
const chemins: Record<string, string> = {
  bouclier: 'M12 3 20 6v6.5c0 4.6-3.4 7.3-8 8.5-4.6-1.2-8-3.9-8-8.5V6Z',
  patte: 'M5.6 12.4a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4Zm12.8 0a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4ZM9.6 8.6a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Zm4.8 0a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6ZM12 11.6c-2.4 0-4.4 1.9-4.4 4.2 0 1.9 1.4 3.1 4.4 3.1s4.4-1.2 4.4-3.1c0-2.3-2-4.2-4.4-4.2Z',
  trefle: 'M12 21v-6m0 0c-2.2 2.2-5.5 1-5.5-1.8 0-1.6 1.3-2.7 2.9-2.7-1.6-1.6-1.2-4.3 1-4.9C12 5.1 12 3 12 3s0 2.1 1.6 2.6c2.2.6 2.6 3.3 1 4.9 1.6 0 2.9 1.1 2.9 2.7 0 2.8-3.3 4-5.5 1.8Z',
  calendrier: 'M4 8h16M7 3v3m10-3v3M5.5 5h13a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-12A1.5 1.5 0 0 1 5.5 5Z',
  document: 'M14 3H7a1.5 1.5 0 0 0-1.5 1.5v15A1.5 1.5 0 0 0 7 21h10a1.5 1.5 0 0 0 1.5-1.5V7.5Zm0 0v4.5h4.5M9 13h6M9 17h4',
  photo: 'M5 4.5h14A1.5 1.5 0 0 1 20.5 6v12a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 18V6A1.5 1.5 0 0 1 5 4.5Zm3.5 5.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM3.5 16l4.8-4.3a1.5 1.5 0 0 1 2 0L15 16m0 0 2-1.8a1.5 1.5 0 0 1 2 0l1.5 1.4',
  cloche: 'M9.5 19a2.5 2.5 0 0 0 5 0M6 16.5h12l-1.3-2v-3.7a4.7 4.7 0 0 0-9.4 0v3.7Z',
  reglages: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.4-2.1a7.6 7.6 0 0 0 0-1.8l2-1.5-2-3.4-2.3 1a7.5 7.5 0 0 0-1.6-.9L15.1 2.5h-4l-.4 2.6c-.6.2-1.1.5-1.6.9l-2.3-1-2 3.4 2 1.5a7.6 7.6 0 0 0 0 1.8l-2 1.5 2 3.4 2.3-1c.5.4 1 .7 1.6.9l.4 2.6h4l.4-2.6c.6-.2 1.1-.5 1.6-.9l2.3 1 2-3.4Z',
  sortie: 'M14 7V5.5A1.5 1.5 0 0 0 12.5 4h-7A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20h7a1.5 1.5 0 0 0 1.5-1.5V17m3-9 3 4-3 4m3-4H9',
  cadenas: 'M7 11V8a5 5 0 0 1 10 0v3M6 11h12a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1Z',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-9v5m0-8.5h.01',
  lieu: 'M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  horloge: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13.5V12l3.5 2',
  mail: 'M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Zm-.5.8 8.5 6 8.5-6',
  telephone: 'M7.4 3.5h-2A2 2 0 0 0 3.5 5.7c.4 6.9 6 12.4 12.8 12.8a2 2 0 0 0 2.2-2v-2a1.4 1.4 0 0 0-1.2-1.4l-2.4-.4a1.4 1.4 0 0 0-1.4.7l-.7 1.3a11 11 0 0 1-4.5-4.5l1.3-.7a1.4 1.4 0 0 0 .7-1.4l-.4-2.4a1.4 1.4 0 0 0-1.4-1.2Z',
  alerte: 'M12 9v4.5m0 3h.01M10.3 4l-7 12A2 2 0 0 0 5 19h14a2 2 0 0 0 1.7-3l-7-12a2 2 0 0 0-3.4 0Z',
  euro: 'M18 6.5A7 7 0 0 0 8.5 9m0 6a7 7 0 0 0 9.5 2.5M4.5 10.5h8m-8 3.5h8',
  carte: 'M4 5.5h16A1.5 1.5 0 0 1 21.5 7v10a1.5 1.5 0 0 1-1.5 1.5H4A1.5 1.5 0 0 1 2.5 17V7A1.5 1.5 0 0 1 4 5.5Zm-1.5 4h19M6 14.5h3',
  coeur: 'M12 20s-7.5-4.5-7.5-9.5A4.5 4.5 0 0 1 12 7.5a4.5 4.5 0 0 1 7.5 3C19.5 15.5 12 20 12 20Z',
  trousse: 'M4.5 8h15A1.5 1.5 0 0 1 21 9.5v9A1.5 1.5 0 0 1 19.5 20h-15A1.5 1.5 0 0 1 3 18.5v-9A1.5 1.5 0 0 1 4.5 8Zm4-.2V5.5A1.5 1.5 0 0 1 10 4h4a1.5 1.5 0 0 1 1.5 1.5v2.3M12 11.5v5M9.5 14h5',
  poubelle: 'M4.5 6.5h15M9.5 6.5V4.8A1.3 1.3 0 0 1 10.8 3.5h2.4a1.3 1.3 0 0 1 1.3 1.3v1.7m3 0-.8 12.4a1.5 1.5 0 0 1-1.5 1.4H8.8a1.5 1.5 0 0 1-1.5-1.4L6.5 6.5M10 10.5v6m4-6v6',
  telecharger: 'M12 3.5v12m0 0-4.5-4.5M12 15.5l4.5-4.5M4 19.5h16',
  crayon: 'M4 20h4l11-11a2.1 2.1 0 0 0-3-3L5 17v3Zm11-14 3 3',
  groupe: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-6 9c0-3.1 2.7-5 6-5s6 1.9 6 5m1.5-14.7A3.5 3.5 0 0 1 17 11m1.5 4.5c1.7.7 2.5 2.3 2.5 4.5',
  facebook: 'M13.5 21v-8h2.7l.4-3.2h-3.1V7.7c0-.9.3-1.6 1.6-1.6h1.7V3.2A22 22 0 0 0 14.4 3c-2.5 0-4.2 1.5-4.2 4.3v2.5H7.5V13h2.7v8Z',
  instagram: 'M8 3.5h8A4.5 4.5 0 0 1 20.5 8v8a4.5 4.5 0 0 1-4.5 4.5H8A4.5 4.5 0 0 1 3.5 16V8A4.5 4.5 0 0 1 8 3.5Zm4 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM16.8 7.2h.01',
  youtube: 'M21 8.4a2.5 2.5 0 0 0-1.8-1.8C17.6 6.2 12 6.2 12 6.2s-5.6 0-7.2.4A2.5 2.5 0 0 0 3 8.4C2.6 10 2.6 12 2.6 12s0 2 .4 3.6a2.5 2.5 0 0 0 1.8 1.8c1.6.4 7.2.4 7.2.4s5.6 0 7.2-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-3.6.4-3.6s0-2-.4-3.6ZM10.2 15V9l5 3Z',
  tiktok: 'M16 3.5c.4 2.2 1.7 3.5 3.9 3.7v2.6c-1.4.1-2.7-.3-3.9-1v5.6a5.6 5.6 0 1 1-4.8-5.6v2.8a2.8 2.8 0 1 0 2 2.7V3.5Z',
}

const dessin = computed<Dessin | null>(() => dessins[props.nom] ?? null)
const secours = computed(() => chemins[props.nom] ?? chemins.info!)
const grille = computed(() => (dessin.value ? 48 : 24))
const trait = computed(() => (props.plein ? 0 : dessin.value ? 6 : 2.6))
</script>

<template>
  <svg
    class="icone"
    :width="taille"
    :height="taille"
    :viewBox="`0 0 ${grille} ${grille}`"
    :fill="plein ? 'currentColor' : 'none'"
    stroke="currentColor"
    :stroke-width="trait"
    :stroke-linecap="dessin?.cap ?? 'square'"
    stroke-linejoin="miter"
    aria-hidden="true"
    focusable="false"
  >
    <template v-if="dessin">
      <path v-if="dessin.f" :d="dessin.f" fill="currentColor" stroke="none" />
      <path :d="dessin.t" />
    </template>
    <path v-else :d="secours" />
  </svg>
</template>

<style lang="scss" scoped>
.icone {
  flex-shrink: 0;
}
</style>
