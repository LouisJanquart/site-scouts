import { eq } from 'drizzle-orm'
import { actus } from '../../../base/schema'

// Supprimer une actu. Pour la retirer du site sans la perdre, mieux vaut la
// repasser en brouillon : le back office le propose avant la suppression.
export default defineEventHandler(async (event) => {
  const u = exigerStaff(event)
  const id = getRouterParam(event, 'id')!
  const base = useBaseDeDonnees()

  const [avant] = await base.select().from(actus).where(eq(actus.id, id)).limit(1)
  if (!avant) throw createError({ statusCode: 404, statusMessage: 'Actu introuvable.' })
  exigerDroitDePublier(u, avant.sections ?? [])

  await base.delete(actus).where(eq(actus.id, id))
  viderLeCacheDesPublications()
  await journaliser(event, 'suppression', 'actu', id, avant.slug)
  return { ok: true }
})
