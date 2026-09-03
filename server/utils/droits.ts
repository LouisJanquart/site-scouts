import type { H3Event } from 'h3'
import { and, eq, inArray, isNull } from 'drizzle-orm'
import { animes, inscriptions, responsables, saisons } from '../base/schema'

// ---------------------------------------------------------------------------
// Qui a le droit de voir quoi.
//
// Tout passe par ici. C'est volontaire : une règle d'accès éparpillée dans
// quarante gestionnaires de route est une règle qu'on finit par oublier
// quelque part. Les routes posent des questions, ce fichier répond.
//
// Les règles, telles qu'elles ont été décidées :
//
//   visiteur  rien de privé ;
//   animé     son profil, et le détail de SA section ;
//   parent    le profil de SES enfants, le détail de LEURS sections, et tout ce
//             qui relève de l'unité (calendrier de toutes les sections, events,
//             documents, contacts du staff) ;
//   chef      le statut de chaque animé de SA section, fiches santé comprises ;
//   CU        la même chose sur toute l'unité, plus la gestion des comptes.
//
// Deux principes tenus partout :
//   1. On refuse par défaut. Une question sans réponse explicite est un non.
//   2. Toute lecture d'une donnée sensible passe par journaliser().
// ---------------------------------------------------------------------------

export type Role = 'parent' | 'anime' | 'chef' | 'cu' | 'tresorier'

export function exigerSession(event: H3Event): Utilisateur {
  const u = event.context.compte as Utilisateur | undefined
  if (!u) {
    throw createError({ statusCode: 401, statusMessage: 'Il faut être connecté.' })
  }
  return u
}

export function aLeRole(u: Utilisateur, ...roles: Role[]): boolean {
  return u.roles.some((r) => roles.includes(r.role as Role))
}

export function estCU(u: Utilisateur): boolean {
  return aLeRole(u, 'cu')
}

export function estStaff(u: Utilisateur): boolean {
  return aLeRole(u, 'chef', 'cu', 'tresorier')
}

// Les sections qu'un chef anime. Un CU les a toutes : on renvoie null, qui se
// lit « aucune restriction » — à ne pas confondre avec [] , « aucune section ».
export function sectionsDuStaff(u: Utilisateur): string[] | null {
  if (estCU(u)) return null
  return u.roles
    .filter((r) => r.role === 'chef' && r.sectionSlug)
    .map((r) => r.sectionSlug!)
}

export function exigerRole(event: H3Event, ...roles: Role[]): Utilisateur {
  const u = exigerSession(event)
  if (!aLeRole(u, ...roles)) {
    throw createError({ statusCode: 403, statusMessage: "Vous n'avez pas accès à cette page." })
  }
  return u
}

export function exigerStaff(event: H3Event): Utilisateur {
  const u = exigerSession(event)
  if (!estStaff(u)) {
    throw createError({ statusCode: 403, statusMessage: "Réservé au staff de l'unité." })
  }
  return u
}

// --- Les questions qui demandent la base ------------------------------------

// Les animés dont cette personne est responsable.
export async function animesDeMaFamille(personneId: string): Promise<string[]> {
  const base = useBaseDeDonnees()
  const lignes = await base
    .select({ animeId: animes.id })
    .from(responsables)
    .innerJoin(animes, eq(animes.familleId, responsables.familleId))
    .where(eq(responsables.personneId, personneId))
  return lignes.map((l) => l.animeId)
}

// L'animé que cette personne EST, s'il y en a un.
export async function monDossierAnime(personneId: string): Promise<string | null> {
  const [ligne] = await useBaseDeDonnees()
    .select({ id: animes.id })
    .from(animes)
    .where(eq(animes.personneId, personneId))
    .limit(1)
  return ligne?.id ?? null
}

// Les sections auxquelles un compte a droit au détail complet :
//   - un animé : la sienne ;
//   - un parent : celles de ses enfants ;
//   - un chef : la sienne, plus celles de ses enfants s'il en a ;
//   - un CU : toutes (null).
export async function sectionsAutorisees(u: Utilisateur): Promise<string[] | null> {
  if (estCU(u)) return null

  const slugs = new Set<string>()
  for (const r of u.roles) if (r.role === 'chef' && r.sectionSlug) slugs.add(r.sectionSlug)

  const ids = [
    ...(await animesDeMaFamille(u.personneId)),
    ...[await monDossierAnime(u.personneId)].filter((x): x is string => Boolean(x)),
  ]
  if (ids.length) {
    const lignes = await useBaseDeDonnees()
      .select({ slug: inscriptions.sectionSlug })
      .from(inscriptions)
      .innerJoin(saisons, eq(saisons.id, inscriptions.saisonId))
      .where(and(inArray(inscriptions.animeId, ids), eq(saisons.active, true)))
    for (const l of lignes) slugs.add(l.slug)
  }
  return [...slugs]
}

export type Motif = 'staff-section' | 'cu' | 'responsable' | 'lui-meme'

// Le cœur : ai-je le droit de regarder le dossier de cet animé, et à quel titre ?
// Le motif sert au journal — « consulté en tant que chef de la section Lutins »
// n'est pas la même chose que « consulté en tant que parent ».
export async function motifDAcces(u: Utilisateur, animeId: string): Promise<Motif | null> {
  if (estCU(u)) return 'cu'

  const base = useBaseDeDonnees()

  const mesSections = sectionsDuStaff(u)
  if (mesSections && mesSections.length) {
    const [ligne] = await base
      .select({ slug: inscriptions.sectionSlug })
      .from(inscriptions)
      .innerJoin(saisons, eq(saisons.id, inscriptions.saisonId))
      .where(and(eq(inscriptions.animeId, animeId), eq(saisons.active, true)))
      .limit(1)
    if (ligne && mesSections.includes(ligne.slug)) return 'staff-section'
  }

  const [aMoi] = await base
    .select({ id: animes.id })
    .from(animes)
    .innerJoin(responsables, eq(responsables.familleId, animes.familleId))
    .where(and(eq(animes.id, animeId), eq(responsables.personneId, u.personneId)))
    .limit(1)
  if (aMoi) return 'responsable'

  const [moi] = await base
    .select({ id: animes.id })
    .from(animes)
    .where(and(eq(animes.id, animeId), eq(animes.personneId, u.personneId)))
    .limit(1)
  if (moi) return 'lui-meme'

  return null
}

export async function exigerAccesAnime(event: H3Event, animeId: string): Promise<Motif> {
  const u = exigerSession(event)
  const motif = await motifDAcces(u, animeId)
  if (!motif) {
    throw createError({ statusCode: 404, statusMessage: 'Dossier introuvable.' })
  }
  return motif
}

// La fiche santé est plus étroite que le dossier : un animé mineur ne lit pas
// sa propre fiche médicale, et un trésorier n'a rien à y faire.
export async function exigerAccesFicheSante(event: H3Event, animeId: string): Promise<Motif> {
  const motif = await exigerAccesAnime(event, animeId)
  if (motif === 'lui-meme') {
    throw createError({
      statusCode: 403,
      statusMessage: 'La fiche santé se consulte auprès de vos parents ou de vos chefs.',
    })
  }
  await journaliser(event, 'lecture', 'fiche-sante', animeId, `motif: ${motif}`)
  return motif
}
