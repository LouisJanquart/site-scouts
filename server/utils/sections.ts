import { sections as tableSections } from '../base/schema'
import { sections as sectionsParDefaut, type Section } from '../../app/data/sections'

// ---------------------------------------------------------------------------
// Les sections, telles qu'on les sert.
//
// Deux sources, et une règle simple : le fichier app/data/sections.ts donne la
// liste, l'ordre du rail, les icônes et les textes d'origine ; la table
// « sections » ne porte que ce qu'un staff a modifié depuis le back office.
// On fusionne les deux, champ par champ, en ignorant les valeurs nulles.
//
// Pourquoi ne pas tout mettre en base : la liste des sections est aussi ce qui
// fabrique les adresses du site au moment du build. Une base endormie ne doit
// pas empêcher de construire, ni faire disparaître les Lutins.
// ---------------------------------------------------------------------------

let cache: { a: number; sections: Section[] } | null = null
const DUREE_CACHE = 60_000

export function viderLeCacheDesSections() {
  cache = null
}

// « frais » saute le cache : le back office doit voir sa correction tout de
// suite, pas dans la minute. Le vidage du cache ne suffit pas toujours — en
// développement, Nitro peut tenir deux instances du module.
export async function sectionsFusionnees(options?: { frais?: boolean }): Promise<Section[]> {
  if (!options?.frais && cache && Date.now() - cache.a < DUREE_CACHE) return cache.sections

  let modifiees: Record<string, Partial<Section>> = {}
  try {
    const lignes = await useBaseDeDonnees().select().from(tableSections)
    modifiees = Object.fromEntries(
      lignes.map((l) => [
        l.slug,
        {
          ...(l.nom ? { nom: l.nom } : {}),
          ...(l.nomCourt ? { nomCourt: l.nomCourt } : {}),
          ...(l.ages ? { ages: l.ages } : {}),
          ...(l.resume ? { resume: l.resume } : {}),
          ...(l.description ? { description: l.description } : {}),
          ...(l.photo ? { photo: l.photo } : {}),
          ...(l.animee === null ? {} : { animee: l.animee }),
        },
      ]),
    )
  } catch {
    // Base injoignable : on sert les textes du fichier. Le site reste debout,
    // il est seulement en retard sur les dernières corrections.
  }

  const fusion = sectionsParDefaut.map((s) => ({ ...s, ...(modifiees[s.slug] ?? {}) }))
  cache = { a: Date.now(), sections: fusion }
  return fusion
}
