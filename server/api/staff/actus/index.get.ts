import { desc } from 'drizzle-orm'
import { actus } from '../../../base/schema'

// Toutes les actus, brouillons compris, pour le back office.
//
// Un chef les voit toutes — il lit déjà tout ce qui est réservé aux chefs sur
// le site —, mais ne peut modifier que celles de sa section : « modifiable »
// le lui dit, et le serveur le revérifie à chaque écriture.
export default defineEventHandler(async (event) => {
  const u = exigerStaff(event)
  const lignes = await useBaseDeDonnees().select().from(actus).orderBy(desc(actus.date))
  return {
    actus: lignes.map((l) => ({
      id: l.id,
      ...actuServie(l),
      statut: l.statut,
      majLe: l.majLe,
      modifiable: peutPublierPour(u, l.sections ?? []),
    })),
    pourLUnite: sectionsDuStaff(u) === null,
  }
})
