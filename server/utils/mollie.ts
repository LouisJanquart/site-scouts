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
  return Boolean(process.env.NUXT_MOLLIE_CLE) || modeDemo()
}

// ---------------------------------------------------------------------------
// Le mode démonstration.
//
// Ouvrir un compte Mollie suppose une entité juridique et une vérification :
// pour une unité scoute, ça peut prendre des semaines. On ne va pas attendre
// pour vérifier que la chaîne fonctionne — d'autant que Mollie n'est qu'un
// intermédiaire au milieu d'un enchaînement qui, lui, est à nous : ouvrir un
// paiement, revenir, encaisser la confirmation, faire basculer le dossier.
//
// Le simulateur rejoue exactement cet enchaînement, sans banque. Il est refusé
// en production, quoi qu'on mette dans l'environnement : un site en ligne qui
// accepte des paiements imaginaires serait pire que pas de paiement du tout.
// ---------------------------------------------------------------------------
export function modeDemo() {
  // Une vraie clé l'emporte toujours : dès que Mollie est branché, le
  // simulateur n'existe plus, quoi qu'il y ait ailleurs dans l'environnement.
  if (process.env.NUXT_MOLLIE_CLE) return false
  if (process.env.NUXT_PAIEMENT_DEMO !== '1') return false

  // NODE_ENV ne dit rien d'utile ici : une construction de production tourne
  // aussi sur un portable. Ce qui compte, c'est l'adresse à laquelle le site
  // répond. En local, le simulateur s'active seul ; ailleurs, il faut le
  // demander explicitement — et le nom de la variable rend le geste conscient.
  const url = process.env.NUXT_PUBLIC_URL_SITE ?? ''
  const enLocal = url === '' || /localhost|127\.0\.0\.1|\[::1\]|\.local(?::|$)/.test(url)
  return enLocal || process.env.NUXT_DEMO_AUTORISEE === '1'
}

export function exigerModeDemo() {
  if (!modeDemo()) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Le simulateur de paiement n’est pas actif.',
    })
  }
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
