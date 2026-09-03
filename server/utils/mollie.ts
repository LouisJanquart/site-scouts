import createMollieClient, { type MollieClient } from '@mollie/api-client'

// ---------------------------------------------------------------------------
// Mollie.
//
// Le seul service tiers du projet, et il est là pour une bonne raison : on ne
// manipule pas soi-même des numéros de carte. Le parent quitte le site, paie
// chez Mollie (Bancontact le plus souvent), et revient. Aucune donnée bancaire
// ne touche notre serveur ni notre base.
//
// Le webhook est la seule source de vérité sur l'état d'un paiement. On ne
// croit JAMAIS la page de retour : n'importe qui peut l'appeler avec
// « ?statut=paye ». Quand Mollie nous prévient, on redemande l'état à Mollie.
// ---------------------------------------------------------------------------

let client: MollieClient | null = null

export function mollie(): MollieClient {
  if (client) return client
  const cle = process.env.NUXT_MOLLIE_CLE
  if (!cle) {
    throw createError({
      statusCode: 503,
      statusMessage:
        'Le paiement en ligne n’est pas encore activé. Vous pouvez régler par virement : la communication structurée est dans votre espace.',
    })
  }
  client = createMollieClient({ apiKey: cle })
  return client
}

export function paiementEnLigneDisponible() {
  return Boolean(process.env.NUXT_MOLLIE_CLE)
}

// La table des correspondances entre les statuts de Mollie et les nôtres.
// Les nôtres sont en français et volontairement moins nombreux.
export function statutDepuisMollie(statut: string): string {
  switch (statut) {
    case 'paid':
      return 'paye'
    case 'open':
    case 'pending':
      return 'en-cours'
    case 'canceled':
      return 'annule'
    case 'expired':
      return 'expire'
    case 'failed':
      return 'echoue'
    default:
      return 'en-cours'
  }
}
