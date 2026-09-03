import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../base/schema'

// La connexion à la base, ouverte une fois pour toutes.
//
// Nitro peut recharger le module en développement : on range le client sur le
// globalThis pour ne pas ouvrir une nouvelle grappe de connexions à chaque
// sauvegarde de fichier.

let client: ReturnType<typeof postgres> | undefined
let instance: ReturnType<typeof drizzle<typeof schema>> | undefined

declare global {
  // eslint-disable-next-line no-var
  var __basePg: ReturnType<typeof postgres> | undefined
}

export function useBaseDeDonnees() {
  if (instance) return instance

  const url = process.env.NUXT_BASE_URL || process.env.DATABASE_URL
  if (!url) {
    throw createError({
      statusCode: 500,
      statusMessage:
        "La base de données n'est pas configurée : renseignez NUXT_BASE_URL dans l'environnement.",
    })
  }

  // Sur un hébergement sans serveur, chaque instance ouvre sa propre grappe :
  // dix connexions par instance épuiseraient le pool de la base en quelques
  // minutes de trafic. Une seule suffit, l'hébergeur multiplie les instances.
  // « prepare: false » est indispensable derrière un pooler en mode transaction
  // (c'est le cas de Neon et de PgBouncer).
  const sansServeur = Boolean(process.env.VERCEL || process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME)
  client =
    globalThis.__basePg ??
    postgres(url, { max: sansServeur ? 1 : 10, prepare: false, idle_timeout: 20 })
  if (process.env.NODE_ENV !== 'production') globalThis.__basePg = client

  instance = drizzle(client, { schema })
  return instance
}

export { schema }
