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

  client = globalThis.__basePg ?? postgres(url, { max: 10, prepare: false })
  if (process.env.NODE_ENV !== 'production') globalThis.__basePg = client

  instance = drizzle(client, { schema })
  return instance
}

export { schema }
