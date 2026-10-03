import { asc } from 'drizzle-orm'
import { evenements } from '../../../base/schema'

// Tous les événements, brouillons compris, pour le back office. Même logique
// que les actus : tout se lit, seul ce qui est à soi se modifie.
export default defineEventHandler(async (event) => {
  const u = exigerStaff(event)
  const lignes = await useBaseDeDonnees().select().from(evenements).orderBy(asc(evenements.date))
  return {
    evenements: lignes.map((l) => ({
      id: l.id,
      ...evenementServi(l),
      statut: l.statut,
      majLe: l.majLe,
      modifiable: peutPublierPour(u, l.section ? [l.section] : []),
    })),
    pourLUnite: sectionsDuStaff(u) === null,
  }
})
