import { eq } from 'drizzle-orm'
import { inscriptions, paiements } from '../../base/schema'

// Le webhook de Mollie.
//
// Mollie n'envoie qu'un identifiant. On ne lui fait pas confiance sur parole :
// on redemande l'état du paiement à l'API avec notre propre clé. C'est ce qui
// empêche n'importe qui d'appeler cette adresse pour se déclarer en règle.
export default defineEventHandler(async (event) => {
  const corps = await readBody<{ id?: string }>(event).catch(() => ({}))
  const id = corps?.id
  if (!id) {
    // Mollie attend un 200 : sinon il réessaie en boucle.
    return 'ok'
  }

  const base = useBaseDeDonnees()

  try {
    const distant = await mollie().payments.get(id)
    const statut = statutDepuisMollie(distant.status)

    const [ligne] = await base
      .update(paiements)
      .set({
        statut,
        payeLe: statut === 'paye' ? new Date(distant.paidAt ?? Date.now()) : null,
        brut: distant as unknown as Record<string, unknown>,
      })
      .where(eq(paiements.referenceMollie, id))
      .returning()

    // Payé : l'inscription passe en attente de relecture par le staff. Elle ne
    // devient « validée » que quand un chef l'a relue — le paiement n'est pas
    // une validation.
    if (ligne && statut === 'paye') {
      await base
        .update(inscriptions)
        .set({ statut: 'envoyee', majLe: new Date() })
        .where(eq(inscriptions.id, ligne.inscriptionId))
    }

    await journaliser(null, 'modification', 'paiement', ligne?.id ?? null, `mollie ${id} → ${statut}`)
  } catch (e) {
    console.error('[mollie] webhook', e)
  }

  return 'ok'
})
