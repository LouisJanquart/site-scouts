import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { comptes } from '../../base/schema'

export default defineEventHandler(async (event) => {
  const { jeton } = await lireCorps(event, z.object({ jeton: z.string().min(10) }))
  const compteId = await consommerJeton(jeton, 'verification')
  if (!compteId) {
    throw createError({ statusCode: 400, statusMessage: 'Ce lien a expiré ou a déjà servi.' })
  }
  await useBaseDeDonnees().update(comptes).set({ emailVerifieLe: new Date() }).where(eq(comptes.id, compteId))
  await journaliser(event, 'modification', 'email-verifie', compteId)
  return { ok: true }
})
