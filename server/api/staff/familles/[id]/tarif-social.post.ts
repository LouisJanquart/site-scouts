import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { familles, saisons } from '../../../../base/schema'

// Accorder — ou retirer — le tarif social à une famille.
//
// Ce n'est pas une case du formulaire d'inscription, et c'est délibéré :
// personne ne devrait avoir à déclarer sa difficulté financière devant un
// écran. Le tarif social s'accorde après une conversation, par le staff
// d'unité, et il reste entre lui et la famille.
export default defineEventHandler(async (event) => {
  const familleId = getRouterParam(event, 'id')!
  exigerRole(event, 'cu', 'tresorier')
  const { accorde, membresAilleurs } = await lireCorps(
    event,
    z.object({ accorde: z.boolean().optional(), membresAilleurs: z.number().int().min(0).max(10).optional() }),
  )

  const base = useBaseDeDonnees()
  const [saison] = await base.select().from(saisons).where(eq(saisons.active, true)).limit(1)
  if (!saison) throw createError({ statusCode: 409, statusMessage: 'Aucune saison active.' })

  const maj: Record<string, unknown> = {}
  if (accorde !== undefined) {
    maj.tarifSocial = accorde
    maj.tarifSocialAccordeLe = accorde ? new Date() : null
  }
  if (membresAilleurs !== undefined) maj.membresAilleurs = membresAilleurs
  if (!Object.keys(maj).length) return { ok: true }

  const [famille] = await base.update(familles).set(maj).where(eq(familles.id, familleId)).returning()
  if (!famille) throw createError({ statusCode: 404, statusMessage: 'Famille introuvable.' })

  // Le changement retombe sur toute la fratrie, tout de suite.
  const recalcul = await recalculerLaFratrie(familleId, saison.id)

  await journaliser(
    event,
    'modification',
    'tarif-famille',
    familleId,
    accorde !== undefined ? `tarif social : ${accorde}` : `membres ailleurs : ${membresAilleurs}`,
  )

  return { ok: true, lignes: recalcul.lignes, ecartsApresPaiement: recalcul.ecartsApresPaiement }
})
