// L'uniforme de chaque section, pour la rubrique Ressources.
//
// À FAIRE VALIDER PAR LE STAFF. Le détail réel par section n'a pas encore été
// fourni (voir « À trancher » dans la fiche du projet). En attendant, chaque
// section reprend la description générique ci-dessous : elle ne dit rien de
// faux, mais elle reste vague. Il suffit d'ajouter une entrée par section
// pour la remplacer.
//
// Les numéros renvoient aux repères posés sur le dessin.

export interface PieceUniforme {
  nom: string
  detail: string
}

const generique: PieceUniforme[] = [
  { nom: 'Le foulard', detail: 'Aux couleurs de l’unité, roulé et tenu par la bague.' },
  { nom: 'Le pull de la section', detail: 'Le staff dit en début d’année où le trouver.' },
  { nom: 'L’insigne de section', detail: 'Cousu sur la manche.' },
]

const parSection: Record<string, PieceUniforme[]> = {}

export function uniformeDe(slug: string): { pieces: PieceUniforme[]; reste: string } {
  return {
    pieces: parSection[slug] ?? generique,
    reste: 'Des vêtements qui peuvent se salir et de bonnes chaussures.',
  }
}
