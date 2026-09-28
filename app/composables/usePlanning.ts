import type { JourPlanning, TypeReunion } from '#shared/planning'
import { parSlug } from '~/data/sections'

// Libellés et couleurs des types de réunion, calqués sur les codes du classeur
// (RN, H, RS, RU, GS, BA, B) que le staff utilise déjà.
// Note : ces teintes servent de couleur de texte sur fond sombre. Elles ont
// été éclaircies pour passer 4.5:1, comme la palette de section.
export const typesReunion: Record<
  TypeReunion,
  { nom: string; code: string; teinte: string }
> = {
  normale: { nom: 'Réunion normale', code: 'RN', teinte: 'var(--section-teinte)' },
  speciale: { nom: 'Réunion spéciale', code: 'RS', teinte: '#d492f2' },
  hike: { nom: 'Hike', code: 'H', teinte: '#f0a32e' },
  'grande-sortie': { nom: 'Grande sortie', code: 'GS', teinte: '#6fd8c4' },
  unite: { nom: 'Réunion d’unité', code: 'RU', teinte: '#ff8377' },
  bar: { nom: 'Bar', code: 'B', teinte: '#9aa8f2' },
  relache: { nom: 'Relâche', code: '—', teinte: '#9298ad' },
}

const MOIS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
]
const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
// Abréviations françaises usuelles : « sept », « oct », « déc »…
const MOIS_COURT = [
  'janv', 'févr', 'mars', 'avr', 'mai', 'juin',
  'juil', 'août', 'sept', 'oct', 'nov', 'déc',
]

export function formaterDate(iso: string, avecJour = false): string {
  const d = new Date(iso + 'T12:00:00')
  const base = `${d.getDate()} ${MOIS[d.getMonth()]} ${d.getFullYear()}`
  return avecJour ? `${JOURS[d.getDay()]} ${base}` : base
}

export function formaterDateCourte(iso: string): string {
  const d = new Date(iso + 'T12:00:00')
  return `${d.getDate()} ${MOIS_COURT[d.getMonth()]}`
}

export function nomJour(iso: string): string {
  return JOURS[new Date(iso + 'T12:00:00').getDay()] ?? ''
}

// La date de référence. En développement on peut la forcer pour voir le site
// tel qu'il sera un autre jour de la saison.
export function useAujourdhui() {
  return useState<string>('aujourdhui', () => new Date().toISOString().slice(0, 10))
}

// Le jour choisi dans le calendrier du panneau de gauche. Il est partagé parce
// que le calendrier ne l'affiche pas lui-même : c'est l'encart de l'accueil,
// à sa droite, qui se met à jour. Le calendrier garde ainsi une taille fixe.
export function useJourSelectionne() {
  return useState<string | null>('jour-selectionne', () => null)
}

// Le jour que l'accueil doit décrire : celui qu'on a choisi, sinon le prochain
// rendez-vous de la saison.
//
// Le planning ne vient plus d'un fichier importé mais de l'API : il peut donc
// être vide le temps de la première requête. Tout ce qui s'en sert doit
// supporter un « null ».
export function useJourAffiche() {
  const aujourdhui = useAujourdhui()
  const selection = useJourSelectionne()
  const { planning } = useContenu()

  return computed<JourPlanning | null>(() => {
    const jours = planning.value
    if (!jours.length) return null
    if (selection.value) {
      const trouve = jours.find((j) => j.date === selection.value)
      if (trouve) return trouve
    }
    return jours.find((j) => j.date >= aujourdhui.value) ?? jours.at(-1) ?? null
  })
}

export function usePlanning() {
  const aujourdhui = useAujourdhui()
  const { planning, saison } = useContenu()

  function planningDeSection(
    slug: string,
  ): Array<JourPlanning & { libelle: string; type: TypeReunion | null }> {
    const cle = parSlug[slug]?.cleplanning
    if (!cle) return []
    return planning.value
      .filter((j) => j.sections[cle])
      .map((j) => ({ ...j, libelle: j.sections[cle]!.libelle, type: j.sections[cle]!.type }))
  }

  function prochaineReunion(slug: string) {
    return planningDeSection(slug).find((j) => j.date >= aujourdhui.value) ?? null
  }

  /** Les samedis où l'unité se réunit, sans le détail des sections. */
  const joursDeReunion = computed(() => planning.value)

  function prochainDimanche() {
    return planning.value.find((j) => j.date >= aujourdhui.value) ?? null
  }

  return {
    saison,
    planning,
    joursDeReunion,
    planningDeSection,
    prochaineReunion,
    prochainDimanche,
    aujourdhui,
  }
}
