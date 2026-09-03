// Les types du planning, partagés entre le serveur et le navigateur.
//
// Seuls les TYPES traversent. Les 96 dates, elles, restent dans
// server/donnees/planning.ts et ne sont servies qu'aux familles connectées :
// les intitulés du classeur contiennent du jargon interne (« Portes Ouvertes
// + CU », les tours de rangement) qui n'a rien à faire dans le paquet public.

export type TypeReunion =
  | 'normale'
  | 'speciale'
  | 'hike'
  | 'grande-sortie'
  | 'relache'
  | 'unite'
  | 'bar'

export interface JourPlanning {
  date: string
  horaire: 'ete' | 'hiver' | null
  remarque: string | null
  evenement: string | null
  occupation: string | null
  rangement: string | null
  sections: Record<string, { libelle: string; type: TypeReunion | null }>
}
