// ---------------------------------------------------------------------------
// Quelle section pour quel enfant ?
//
// Les bornes d'âge sont ici, et pas dans app/data/sections.ts, parce que le
// serveur doit pouvoir les appliquer sans rien savoir de l'affichage. Elles
// s'entendent en âge atteint au 1er septembre de la saison : c'est la règle
// habituelle chez nous, un enfant ne change pas de section en cours d'année
// parce qu'il fête son anniversaire en mars.
//
// La suggestion n'est jamais un verrou : le staff peut inscrire un enfant
// ailleurs (fratrie, maturité, place disponible). Le formulaire propose, le
// staff dispose.
// ---------------------------------------------------------------------------

export interface BornesSection {
  slug: string
  nom: string
  ageMin: number
  ageMax: number
  genre: 'mixte' | 'filles' | 'garcons'
  /** Une section qui accueille de nouveaux animés cette saison. */
  ouverte: boolean
}

export const bornesSections: BornesSection[] = [
  { slug: 'nutons', nom: 'Nutons', ageMin: 5, ageMax: 7, genre: 'mixte', ouverte: true },
  { slug: 'lutins', nom: 'Lutins', ageMin: 7, ageMax: 11, genre: 'filles', ouverte: true },
  { slug: 'louveteaux', nom: 'Louveteaux', ageMin: 8, ageMax: 11, genre: 'garcons', ouverte: true },
  { slug: 'guides', nom: 'Guides', ageMin: 11, ageMax: 16, genre: 'filles', ouverte: true },
  { slug: 'scouts', nom: 'Scouts', ageMin: 11, ageMax: 16, genre: 'garcons', ouverte: true },
  { slug: 'horizons', nom: 'Horizons', ageMin: 16, ageMax: 18, genre: 'mixte', ouverte: true },
  { slug: 'route', nom: 'Route', ageMin: 18, ageMax: 25, genre: 'mixte', ouverte: false },
]

export function ageAuPremierSeptembre(dateNaissance: string, anneeSaison: number): number {
  const n = new Date(dateNaissance)
  const reference = new Date(Date.UTC(anneeSaison, 8, 1))
  let age = reference.getUTCFullYear() - n.getUTCFullYear()
  const moisAvant =
    reference.getUTCMonth() < n.getUTCMonth() ||
    (reference.getUTCMonth() === n.getUTCMonth() && reference.getUTCDate() < n.getUTCDate())
  if (moisAvant) age--
  return age
}

export function sectionsPossibles(
  dateNaissance: string,
  anneeSaison: number,
  genre?: string,
): BornesSection[] {
  const age = ageAuPremierSeptembre(dateNaissance, anneeSaison)
  return bornesSections.filter((s) => {
    if (!s.ouverte) return false
    if (age < s.ageMin || age > s.ageMax) return false
    // Le genre déclaré filtre les sections non mixtes. S'il n'est pas déclaré,
    // ou s'il est « x », on propose tout ce qui correspond à l'âge et la famille
    // choisit : ce n'est pas au formulaire de trancher cette question-là.
    if (s.genre === 'mixte') return true
    if (!genre || genre === 'x' || genre === 'ne-se-prononce-pas') return true
    return (s.genre === 'filles' && genre === 'f') || (s.genre === 'garcons' && genre === 'm')
  })
}

/** L'année de départ de la saison en cours : septembre 2026 → 2026. */
export function anneeDeSaison(le: Date = new Date()): number {
  return le.getMonth() >= 7 ? le.getFullYear() : le.getFullYear() - 1
}
