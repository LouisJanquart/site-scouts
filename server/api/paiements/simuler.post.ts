import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { inscriptions, paiements } from '../../base/schema'

const corps = z.object({
  paiementId: z.string().uuid(),
  issue: z.enum(['paye', 'echoue', 'annule']),
})

// Le simulateur : il fait exactement ce que ferait le webhook de Mollie, ni
// plus ni moins. C'est ce qui rend le test utile — si le parcours marche ici,
// il marchera avec la vraie banque, parce que c'est le même code en aval.
export default defineEventHandler(async (event) => {
  exigerModeDemo()

  const { paiementId, issue } = await lireCorps(event, corps)
  const base = useBaseDeDonnees()

  const [paiement] = await base
    .select({ id: paiements.id, inscriptionId: paiements.inscriptionId, moyen: paiements.moyen })
    .from(paiements)
    .where(eq(paiements.id, paiementId))
    .limit(1)
  if (!paiement) throw createError({ statusCode: 404, statusMessage: 'Paiement introuvable.' })
  if (paiement.moyen !== 'demo') {
    throw createError({ statusCode: 409, statusMessage: 'Ce paiement n’est pas un paiement simulé.' })
  }

  // Le contrôle d'accès reste le même que pour un vrai paiement.
  const [ins] = await base
    .select({ animeId: inscriptions.animeId })
    .from(inscriptions)
    .where(eq(inscriptions.id, paiement.inscriptionId))
    .limit(1)
  if (!ins) throw createError({ statusCode: 404, statusMessage: 'Inscription introuvable.' })
  await exigerAccesAnime(event, ins.animeId)

  await base
    .update(paiements)
    .set({
      statut: issue,
      payeLe: issue === 'paye' ? new Date() : null,
      brut: { simulateur: true, issue, quand: new Date().toISOString() },
    })
    .where(eq(paiements.id, paiementId))

  // Payé : le dossier passe « à relire ». Comme avec Mollie, le paiement ne
  // vaut pas validation — c'est un chef qui valide.
  if (issue === 'paye') {
    await base
      .update(inscriptions)
      .set({ statut: 'envoyee', majLe: new Date() })
      .where(eq(inscriptions.id, paiement.inscriptionId))
  }

  await journaliser(event, 'modification', 'paiement', paiementId, `simulateur → ${issue}`)
  return { ok: true, statut: issue }
})
