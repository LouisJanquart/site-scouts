import { asc, desc } from 'drizzle-orm'
import { actus as tableActus, evenements as tableEvenements } from '../base/schema'
import type { ActuEnBase, EvenementEnBase } from '../base/schema'
import type { Actu } from '../donnees/actus'
import type { Evenement } from '../donnees/evenements'
import { sections as sectionsDuSite } from '../../app/data/sections'

// ---------------------------------------------------------------------------
// Les actus et les événements, tels qu'on les sert.
//
// La base est la seule source (voir server/base/schema/publications.ts). Ce
// fichier fait trois choses :
//   1. lire ce qui est publié, avec un petit cache d'une minute ;
//   2. traduire les lignes de la base dans la forme que les pages connaissent
//      déjà (celle des anciens fichiers), pour ne rien casser côté navigateur ;
//   3. répondre à « ce staff a-t-il le droit de publier ça ? ».
//
// Si la base ne répond pas, on ressert la dernière liste connue, ou rien. On
// ne retombe PAS sur les fichiers d'import : une actu supprimée ou repassée en
// brouillon ne doit pas ressortir en ligne parce que Neon dormait.
// ---------------------------------------------------------------------------

const DUREE_CACHE = 60_000
let cacheActus: { a: number; liste: Actu[] } | null = null
let cacheEvenements: { a: number; liste: Evenement[] } | null = null

export function viderLeCacheDesPublications() {
  cacheActus = null
  cacheEvenements = null
}

export function actuServie(l: ActuEnBase): Actu {
  return {
    slug: l.slug,
    titre: l.titre,
    date: l.date,
    sections: l.sections ?? [],
    chapo: l.chapo,
    corps: l.corps ?? [],
    public: l.public as Actu['public'],
    aRelire: l.aRelire,
  }
}

export function evenementServi(l: EvenementEnBase): Evenement {
  return {
    slug: l.slug,
    titre: l.titre,
    date: l.date,
    ...(l.dateFin ? { dateFin: l.dateFin } : {}),
    ...(l.heure ? { heure: l.heure } : {}),
    lieu: l.lieu,
    section: l.section,
    resume: l.resume,
    description: l.description,
    public: l.public as Evenement['public'],
    inscription: l.inscription,
    ...(l.photo ? { photo: l.photo } : {}),
    aRelire: l.aRelire,
  }
}

/** Les actus publiées, de la plus récente à la plus ancienne. */
export async function actusPubliees(): Promise<Actu[]> {
  if (cacheActus && Date.now() - cacheActus.a < DUREE_CACHE) return cacheActus.liste
  try {
    const lignes = await useBaseDeDonnees().select().from(tableActus).orderBy(desc(tableActus.date))
    const liste = lignes.filter((l) => l.statut === 'publie').map(actuServie)
    cacheActus = { a: Date.now(), liste }
    return liste
  } catch {
    return cacheActus?.liste ?? []
  }
}

/** Les événements publiés, dans l'ordre du calendrier. */
export async function evenementsPublies(): Promise<Evenement[]> {
  if (cacheEvenements && Date.now() - cacheEvenements.a < DUREE_CACHE) return cacheEvenements.liste
  try {
    const lignes = await useBaseDeDonnees().select().from(tableEvenements).orderBy(asc(tableEvenements.date))
    const liste = lignes.filter((l) => l.statut === 'publie').map(evenementServi)
    cacheEvenements = { a: Date.now(), liste }
    return liste
  } catch {
    return cacheEvenements?.liste ?? []
  }
}

// --- Les droits --------------------------------------------------------------

export const slugsDeSection = sectionsDuSite.map((s) => s.slug)

/**
 * Un staff peut-il publier pour ces sections ?
 *   - le staff d'unité : toujours, y compris pour toute l'unité (liste vide) ;
 *   - un chef : seulement pour les sections qu'il anime, jamais pour l'unité.
 */
export function peutPublierPour(u: Utilisateur, sections: string[]): boolean {
  const miennes = sectionsDuStaff(u)
  if (miennes === null) return true
  if (!sections.length) return false
  return sections.every((s) => miennes.includes(s))
}

export function exigerDroitDePublier(u: Utilisateur, sections: string[]) {
  if (!peutPublierPour(u, sections)) {
    throw createError({
      statusCode: 403,
      statusMessage: sections.length
        ? 'Vous ne pouvez publier que pour la section que vous animez.'
        : 'Une publication pour toute l’unité revient au staff d’unité.',
    })
  }
}

// --- Les adresses ------------------------------------------------------------

/** « Souper dias » le 10/10/2026 → souper-dias-2026. */
export function fabriquerSlug(titre: string, date: string): string {
  const base = titre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/, '')
  return `${base || 'publication'}-${date.slice(0, 4)}`
}

/** Le slug, rendu unique en ajoutant -2, -3… si l'adresse est déjà prise. */
export function slugLibre(voulu: string, pris: string[]): string {
  if (!pris.includes(voulu)) return voulu
  let n = 2
  while (pris.includes(`${voulu}-${n}`)) n++
  return `${voulu}-${n}`
}

/** Un texte tapé dans une zone de saisie → un paragraphe par bloc. */
export function enParagraphes(texte: string): string[] {
  return texte
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean)
}
