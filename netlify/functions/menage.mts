import type { Config } from '@netlify/functions'

// Le ménage RGPD, une fois par nuit.
//
// La tâche planifiée de Nitro suppose un serveur qui tourne en continu ; sur
// Netlify il n'y en a pas, personne ne tient le réveil. C'est donc Netlify qui
// réveille cette fonction, et elle se contente d'appeler /api/taches/menage —
// la vraie logique est là-bas, partagée avec la tâche Nitro, pour qu'un
// changement d'hébergeur ne fasse pas diverger deux copies du même code.
//
// L'appel s'authentifie avec CRON_SECRET : sans lui, la route refuse. Une purge
// que n'importe qui peut déclencher n'est pas une purge.
export default async (req: Request) => {
  const secret = Netlify.env.get('CRON_SECRET')
  if (!secret) {
    console.error('CRON_SECRET absent : le ménage RGPD n’a pas été déclenché.')
    return
  }

  const base = Netlify.env.get('URL') ?? Netlify.env.get('DEPLOY_PRIME_URL')
  if (!base) {
    console.error('Adresse du site introuvable : ni URL ni DEPLOY_PRIME_URL.')
    return
  }

  const reponse = await fetch(new URL('/api/taches/menage', base), {
    headers: { authorization: `Bearer ${secret}` },
  })
  const corps = await reponse.text()

  if (!reponse.ok) {
    console.error('Ménage RGPD en échec :', reponse.status, corps)
    return
  }

  console.log('Ménage RGPD :', corps)

  // Purement informatif dans les journaux : une fonction planifiée ne renvoie
  // rien à personne, mais savoir quand elle repassera aide à lire un incident.
  try {
    const { next_run } = (await req.json()) as { next_run?: string }
    if (next_run) console.log('Prochain passage :', next_run)
  } catch {
    // Netlify n'envoie pas toujours de corps : ce n'est pas une erreur.
  }
}

// L'horaire vit ici, et nulle part ailleurs : deux déclarations finissent
// toujours par diverger. 3 h du matin, heure UTC.
export const config: Config = {
  schedule: '0 3 * * *',
}
