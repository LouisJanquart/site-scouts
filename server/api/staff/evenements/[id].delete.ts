import { eq } from 'drizzle-orm'
import { evenements } from '../../../base/schema'

export default defineEventHandler(async (event) => {
  const u = exigerStaff(event)
  const id = getRouterParam(event, 'id')!
  const base = useBaseDeDonnees()

  const [avant] = await base.select().from(evenements).where(eq(evenements.id, id)).limit(1)
  if (!avant) throw createError({ statusCode: 404, statusMessage: 'Événement introuvable.' })
  exigerDroitDePublier(u, avant.section ? [avant.section] : [])

  await base.delete(evenements).where(eq(evenements.id, id))
  viderLeCacheDesPublications()
  await journaliser(event, 'suppression', 'evenement', id, avant.slug)
  return { ok: true }
})
