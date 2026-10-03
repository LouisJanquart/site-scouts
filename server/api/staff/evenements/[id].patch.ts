import { eq } from 'drizzle-orm'
import { evenements } from '../../../base/schema'

// Modifier un événement : droit sur ce qu'il est, et sur ce qu'il devient.
// L'adresse ne change pas, elle a peut-être déjà circulé.
export default defineEventHandler(async (event) => {
  const u = exigerStaff(event)
  const id = getRouterParam(event, 'id')!
  const base = useBaseDeDonnees()

  const [avant] = await base.select().from(evenements).where(eq(evenements.id, id)).limit(1)
  if (!avant) throw createError({ statusCode: 404, statusMessage: 'Événement introuvable.' })
  exigerDroitDePublier(u, avant.section ? [avant.section] : [])

  const recu = await lireCorps(event, formeEvenement)
  const sections = recu.section ? [recu.section] : []
  verifierSections(sections)
  exigerDroitDePublier(u, sections)

  await base
    .update(evenements)
    .set({ ...valeursEvenement(recu), aRelire: false, majLe: new Date(), majPar: u.personneId })
    .where(eq(evenements.id, id))

  viderLeCacheDesPublications()
  await journaliser(event, 'modification', 'evenement', id, `${avant.slug} (${recu.statut})`)
  return { ok: true }
})
