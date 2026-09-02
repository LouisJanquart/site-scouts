import { planning, saison, type JourPlanning, type TypeReunion } from '~/data/planning'
import { parSlug } from '~/data/sections'

// Libellés et couleurs des types de réunion, calqués sur les codes du classeur
// (RN, H, RS, RU, GS, BA, B) que le staff utilise déjà.
export const typesReunion: Record<
  TypeReunion,
  { nom: string; code: string; teinte: string }
> = {
  normale: { nom: 'Réunion normale', code: 'RN', teinte: 'var(--section-teinte)' },
  speciale: { nom: 'Réunion spéciale', code: 'RS', teinte: '#c46be8' },
  hike: { nom: 'Hike', code: 'H', teinte: '#f0a32e' },
  'grande-sortie': { nom: 'Grande sortie', code: 'GS', teinte: '#6fd8c4' },
  unite: { nom: 'Réunion d’unité', code: 'RU', teinte: '#e72c1c' },
  bar: { nom: 'Bar', code: 'B', teinte: '#7c8ce8' },
  relache: { nom: 'Relâche', code: '—', teinte: '#4a4a58' },
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

export function usePlanning() {
  const aujourdhui = useAujourdhui()

  const jours = computed(() => planning)

  const prochainsJours = computed(() =>
    planning.filter((j) => j.date >= aujourdhui.value).slice(0, 12),
  )

  function planningDeSection(slug: string): Array<JourPlanning & { libelle: string; type: TypeReunion | null }> {
    const cle = parSlug[slug]?.cleplanning
    if (!cle) return []
    return planning
      .filter((j) => j.sections[cle])
      .map((j) => ({ ...j, libelle: j.sections[cle]!.libelle, type: j.sections[cle]!.type }))
  }

  function prochaineReunion(slug: string) {
    return planningDeSection(slug).find((j) => j.date >= aujourdhui.value) ?? null
  }

  const horaireDuJour = computed(() => {
    const prochain = planning.find((j) => j.date >= aujourdhui.value)
    return prochain?.horaire ?? 'ete'
  })

  return {
    saison,
    jours,
    prochainsJours,
    planningDeSection,
    prochaineReunion,
    horaireDuJour,
    aujourdhui,
  }
}
