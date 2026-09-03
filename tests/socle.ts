import { execSync, spawn, type ChildProcess } from 'node:child_process'
import postgres from 'postgres'

// ---------------------------------------------------------------------------
// Le socle des tests.
//
// On ne teste pas les règles d'accès avec des objets simulés : une règle
// d'accès qui marche sur une maquette et pas sur la vraie base ne sert à rien.
// On monte donc une base jetable, on y applique les migrations, on démarre le
// vrai serveur, et on lui parle en HTTP comme le ferait un navigateur.
// ---------------------------------------------------------------------------

const BASE_ADMIN = process.env.NUXT_BASE_URL ?? 'postgres://claude@localhost:5433/fleurus'
const NOM_TEST = 'fleurus_test'
const URL_TEST = BASE_ADMIN.replace(/\/[^/]+$/, `/${NOM_TEST}`)
export const ADRESSE = 'http://127.0.0.1:4610'

let serveur: ChildProcess | null = null

export async function setup() {
  const admin = postgres(BASE_ADMIN, { max: 1 })
  await admin.unsafe(`drop database if exists ${NOM_TEST}`)
  await admin.unsafe(`create database ${NOM_TEST}`)
  await admin.end()

  const env = { ...process.env, NUXT_BASE_URL: URL_TEST }
  execSync('npx drizzle-kit migrate', { env, stdio: 'ignore' })

  serveur = spawn('node', ['.output/server/index.mjs'], {
    env: {
      ...env,
      PORT: '4610',
      HOST: '127.0.0.1',
      NUXT_CLE_SANTE: 'MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=',
      NUXT_PUBLIC_URL_SITE: ADRESSE,
      // Pas de compte Mollie pour les tests : le simulateur rejoue la même
      // chaîne, c'est elle qu'on veut vérifier.
      NUXT_PAIEMENT_DEMO: '1',
      NUXT_MOLLIE_CLE: '',
      NODE_ENV: 'production',
    },
    stdio: 'ignore',
  })

  // Attendre que le serveur réponde plutôt que de dormir au hasard.
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`${ADRESSE}/api/saison`)
      if (r.ok || r.status === 200) return
    } catch {
      /* pas encore */
    }
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error('Le serveur de test n’a pas démarré.')
}

export async function teardown() {
  serveur?.kill('SIGTERM')
  const admin = postgres(BASE_ADMIN, { max: 1 })
  await admin.unsafe(
    `select pg_terminate_backend(pid) from pg_stat_activity where datname = '${NOM_TEST}'`,
  )
  await admin.unsafe(`drop database if exists ${NOM_TEST}`)
  await admin.end()
}
