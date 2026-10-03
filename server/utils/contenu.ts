import type { H3Event } from 'h3'
import { chefs, adressesDeSection, type Chef } from '../donnees/staff'
import { planning, saison, type JourPlanning } from '../donnees/planning'
import { evenementsVisibles, evenementPublicDuJour, type Evenement } from '../donnees/evenements'
import { actusVisibles } from '../donnees/actus'
import { documents, documentsPour, categories } from '../donnees/documents'

// ---------------------------------------------------------------------------
// Le contenu réservé, servi selon le compte.
//
// Avant, tout ce contenu vivait dans app/data/ : il partait donc dans le paquet
// JavaScript téléchargé par n'importe quel visiteur. Le sélecteur de rôle
// masquait à l'écran ce qui était déjà sur la machine du visiteur — autant dire
// rien du tout. On pouvait lire les 96 dates du planning, les intitulés
// internes (« Portes Ouvertes + CU »), les adresses des staffs, en ouvrant les
// outils de développement.
//
// Maintenant, ces fichiers vivent dans server/donnees/, que le navigateur ne
// reçoit jamais, et c'est cette fonction qui décide de ce qui sort. Le rôle
// vient de la session, pas d'un paramètre d'URL : on ne peut pas se déclarer
// parent en modifiant une adresse.
// ---------------------------------------------------------------------------

export type RolePublic = 'visiteur' | 'anime' | 'parent' | 'chef'

/** Le rôle tel qu'il sert à l'affichage, déduit de la session. */
export function roleDAffichage(event: H3Event): RolePublic {
  const u = event.context.compte
  if (!u) return 'visiteur'
  const r = u.roles.map((x) => x.role)
  if (r.includes('cu') || r.includes('chef')) return 'chef'
  if (r.includes('parent')) return 'parent'
  if (r.includes('anime')) return 'anime'
  // Un compte sans rôle attribué — cela arrive entre le dépôt d'un dossier et
  // sa validation — voit ce que voit une famille : c'en est une.
  return 'parent'
}

export interface ContenuServi {
  role: RolePublic
  saison: string
  /**
   * Le planning. Complet pour une famille ; réduit aux dates et aux horaires
   * pour un visiteur, qui a le droit de savoir quand l'unité se réunit mais
   * pas ce que chaque section fait ce samedi-là.
   */
  planning: JourPlanning[]
  evenements: ReturnType<typeof evenementsVisibles>
  actus: ReturnType<typeof actusVisibles>
  documents: ReturnType<typeof documentsPour>
  categoriesDocuments: typeof categories
  /** Prénoms et totems. Aucune coordonnée personnelle, jamais. */
  staff: Chef[]
  /** Adresses de fonction des sections. Réservées aux familles. */
  adressesDeSection: Record<string, string>
  totalChefs: number
}

/** Le squelette du planning : les dates, les horaires, rien d'autre. */
function planningPublic(evenements: Evenement[]): JourPlanning[] {
  return planning.map((j) => ({
    date: j.date,
    horaire: j.horaire,
    // Seuls les rendez-vous ouverts au dehors gardent leur nom.
    evenement: evenementPublicDuJour(j.date, evenements)?.titre ?? null,
    remarque: null,
    occupation: null,
    rangement: null,
    sections: {},
  }))
}

export async function contenuPour(event: H3Event): Promise<ContenuServi> {
  const role = roleDAffichage(event)
  const famille = role !== 'visiteur'
  // Les actus et les événements viennent de la base depuis le 02/10/2026.
  const [evenements, actus] = await Promise.all([evenementsPublies(), actusPubliees()])

  return {
    role,
    saison,
    // Le planning des sections est réservé aux familles. Un visiteur reçoit
    // quand même le squelette — les dates et les horaires — parce que « la
    // prochaine réunion est le samedi 12 septembre de 14 h à 17 h 30 » est
    // précisément ce qu'une famille qui découvre l'unité vient chercher. Ce
    // qu'il ne reçoit pas : le programme de chaque section, les remarques
    // internes du classeur, les tours de rangement, et les intitulés
    // d'événements réservés.
    planning: famille ? planning : planningPublic(evenements),
    evenements: evenementsVisibles(role, evenements),
    actus: actusVisibles(role, actus),
    documents: documentsPour(role),
    categoriesDocuments: categories,
    // Le staff s'affiche aux familles ; un visiteur n'a droit qu'au décompte,
    // qui figure de toute façon sur la page « à propos ».
    staff: famille ? chefs : [],
    adressesDeSection: famille ? adressesDeSection : {},
    totalChefs: chefs.length,
  }
}
