import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { inscriptions, paiements } from '../../../base/schema'

const corps = z.object({
  statut: z.enum(['paye', 'annule', 'rembourse', 'ouvert']),
  moyen: z.enum(['virement', 'especes']).optional(),
})

// Pointer un paiement à la main : le virement arrivé sur le compte, l'enveloppe
// remise le dimanche. C'est le geste le plus courant du trésorier, il doit être
// d'un seul clic.
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const u = exigerRole(event, 'cu', 'tresorier')
  const { statut, moyen } = await lireCorps(event, corps)

  const base = useBaseDeDonnees()
  const [ligne] = await base
    .update(paiements)
    .set({
      statut,
      moyen: moyen ?? undefined,
      payeLe: statut === 'paye' ? new Date() : null,
      rembourseLe: statut === 'rembourse' ? new Date() : null,
      pointePar: u.id,
    })
    .where(eq(paiements.id, id))
    .returning()

  if (!ligne) throw createError({ statusCode: 404, statusMessage: 'Paiement introuvable.' })

  if (statut === 'paye') {
    await base
      .update(inscriptions)
      .set({ statut: 'envoyee', majLe: new Date() })
      .where(eq(inscriptions.id, ligne.inscriptionId))
  }

  await journaliser(event, 'modification', 'paiement', id, `pointé : ${statut}`)
  return { ok: true }
})
