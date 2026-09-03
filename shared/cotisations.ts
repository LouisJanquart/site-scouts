// ---------------------------------------------------------------------------
// Le barème des cotisations.
//
// Ce n'est PAS une invention de l'unité : c'est le barème d'affiliation publié
// par la fédération. Il change chaque année.
//
//   Source : https://www.guides.be/animateur/administratif/montant-des-cotisations
//   Relevé le 3 septembre 2026 pour la saison 2026-2027.
//
// Deux choses à comprendre avant de toucher à ce fichier :
//
//   1. Le tarif famille s'applique à TOUS les membres du ménage, pas seulement
//      au deuxième et aux suivants. Deux enfants inscrits, ce n'est pas
//      « 57,50 + 46 » mais « 46 + 46 ». C'est l'erreur naturelle, et elle coûte
//      cher aux familles.
//
//   2. Il compte les membres d'un même ménage inscrits chez les Guides, ou un
//      chez les Guides et un chez les Scouts. Une fratrie répartie entre les
//      deux fédérations a donc droit au tarif famille — le site ne peut pas le
//      deviner tout seul, d'où la case « frère ou sœur inscrit chez les Scouts »
//      dans le dossier.
//
// Le barème par défaut est ici, mais chaque saison peut le remplacer en base
// (colonne « bareme »). Le staff d'unité peut donc corriger un montant sans
// attendre un déploiement.
// ---------------------------------------------------------------------------

export interface Bareme {
  version: string
  source: string
  /** Un seul membre du ménage inscrit. */
  pleinCentimes: number
  /** Deux membres du ménage inscrits — s'applique aux deux. */
  famille2Centimes: number
  /** Trois membres ou plus — s'applique à tous. */
  famille3PlusCentimes: number
  /** Tarif social, sur demande de la famille auprès du staff d'unité. */
  socialCentimes: number
  /**
   * Tarif réduit : couvre l'assurance seule. Il concerne la Route, les
   * personnes-ressources, les intendants, et les inscriptions tardives.
   */
  reduitCentimes: number
  /** Réduction pour un animateur breveté (organisme reconnu par la FWB). */
  reductionBrevetCentimes: number
  /** Une inscription déposée après cette date passe au tarif réduit. */
  moisJourInscriptionTardive: string
  /** Une demande de tarif social doit être déposée avant cette date. */
  moisJourLimiteTarifSocial: string
}

export const baremeParDefaut: Bareme = {
  version: '2026-2027',
  source: 'https://www.guides.be/animateur/administratif/montant-des-cotisations',
  pleinCentimes: 5750,
  famille2Centimes: 4600,
  famille3PlusCentimes: 3900,
  socialCentimes: 500,
  reduitCentimes: 1825,
  reductionBrevetCentimes: 500,
  moisJourInscriptionTardive: '04-01',
  moisJourLimiteTarifSocial: '12-15',
}

// Les sections dont les membres relèvent du tarif réduit quoi qu'il arrive.
export const sectionsAuTarifReduit = ['route', 'staff']

export type MotifTarif =
  | 'plein'
  | 'famille-2'
  | 'famille-3'
  | 'social'
  | 'route'
  | 'tardive'
  | 'ressource'

export interface MembreACalculer {
  /** Identifiant libre, renvoyé tel quel — sert à rattacher le résultat. */
  cle: string
  sectionSlug: string
  /** Date de dépôt du dossier, au format AAAA-MM-JJ. */
  deposeeLe?: string
  /** Le staff d'unité a accordé le tarif social à cette famille. */
  tarifSocial?: boolean
  /** Animateur breveté : cinq euros de moins. */
  brevete?: boolean
  /** Personne-ressource ou intendant : tarif réduit. */
  ressource?: boolean
}

export interface LigneCotisation {
  cle: string
  montantCentimes: number
  motif: MotifTarif
  /** Ce qu'on affiche à la famille pour qu'elle comprenne son montant. */
  explication: string
  reductionBrevet: boolean
}

/**
 * Le calcul, pour une fratrie entière d'un coup.
 *
 * On ne peut pas calculer une cotisation enfant par enfant : le tarif de
 * chacun dépend du nombre total de membres du ménage inscrits. C'est pour ça
 * que cette fonction prend la fratrie et pas un enfant.
 *
 * `membresAilleurs` compte les frères et sœurs inscrits chez les Scouts, que
 * le site ne connaît pas mais que la fédération compte quand même.
 */
export function calculerCotisations(
  membres: MembreACalculer[],
  options: { bareme?: Bareme; membresAilleurs?: number; saisonDebut?: string } = {},
): LigneCotisation[] {
  const b = options.bareme ?? baremeParDefaut
  const ailleurs = Math.max(0, options.membresAilleurs ?? 0)

  const tardive = (m: MembreACalculer) => {
    if (!m.deposeeLe || !options.saisonDebut) return false
    // La saison commence en septembre : le 1er avril tombe donc l'année civile
    // suivante.
    const anneeDebut = Number(options.saisonDebut.slice(0, 4))
    const bascule = `${anneeDebut + 1}-${b.moisJourInscriptionTardive}`
    return m.deposeeLe >= bascule
  }

  const auTarifReduit = (m: MembreACalculer) =>
    m.ressource === true || sectionsAuTarifReduit.includes(m.sectionSlug) || tardive(m)

  // Le décompte qui décide du tarif famille ne retient que les membres au
  // barème ordinaire : un aîné à la Route, qui paie l'assurance seule, ne fait
  // pas basculer ses cadets au tarif famille.
  const comptes = membres.filter((m) => !auTarifReduit(m) && !m.tarifSocial)
  const nombre = comptes.length + ailleurs

  const tarifOrdinaire = () => {
    if (nombre >= 3) return { montant: b.famille3PlusCentimes, motif: 'famille-3' as MotifTarif }
    if (nombre === 2) return { montant: b.famille2Centimes, motif: 'famille-2' as MotifTarif }
    return { montant: b.pleinCentimes, motif: 'plein' as MotifTarif }
  }

  return membres.map((m) => {
    let montant: number
    let motif: MotifTarif
    let explication: string

    if (m.tarifSocial) {
      montant = b.socialCentimes
      motif = 'social'
      explication = 'Tarif social accordé par le staff d’unité.'
    } else if (m.ressource) {
      montant = b.reduitCentimes
      motif = 'ressource'
      explication = 'Personne-ressource ou intendant : assurance seule.'
    } else if (sectionsAuTarifReduit.includes(m.sectionSlug)) {
      montant = b.reduitCentimes
      motif = 'route'
      explication = 'Route et staff : assurance seule.'
    } else if (tardive(m)) {
      montant = b.reduitCentimes
      motif = 'tardive'
      explication = `Inscription après le 1er ${b.moisJourInscriptionTardive === '04-01' ? 'avril' : b.moisJourInscriptionTardive} : assurance seule pour la fin de saison.`
    } else {
      const t = tarifOrdinaire()
      montant = t.montant
      motif = t.motif
      explication =
        nombre >= 3
          ? `Tarif famille : ${nombre} membres du ménage inscrits.`
          : nombre === 2
            ? 'Tarif famille : deux membres du ménage inscrits.'
            : 'Tarif plein : un seul membre du ménage inscrit.'
    }

    const reductionBrevet = Boolean(m.brevete) && montant > b.reductionBrevetCentimes
    if (reductionBrevet) {
      montant -= b.reductionBrevetCentimes
      explication += ' Animateur breveté : cinq euros de moins.'
    }

    return { cle: m.cle, montantCentimes: montant, motif, explication, reductionBrevet }
  })
}

/** Le total d'une fratrie, pour l'afficher d'un coup à la famille. */
export function totalCotisations(lignes: LigneCotisation[]) {
  return lignes.reduce((s, l) => s + l.montantCentimes, 0)
}
