import { and, eq, gt, sql } from 'drizzle-orm'
import { tentativesConnexion } from '../base/schema'

// Freinage des essais de connexion.
//
// Deux compteurs : par adresse (on protège un compte du bourrage) et par IP (on
// protège l'ensemble du balayage). Fenêtre glissante de quinze minutes.
//
// Le blocage n'est pas un rejet sec : c'est un délai qui grandit. Un parent qui
// se trompe trois fois ne doit pas être mis dehors.

const FENETRE_MIN = 15
const SEUIL_EMAIL = 8
const SEUIL_IP = 30

export async function verifierFreinage(email: string | null, ip: string | null) {
  const base = useBaseDeDonnees()
  const depuis = new Date(Date.now() - FENETRE_MIN * 60_000)

  const compter = async (colonne: 'email' | 'ip', valeur: string) => {
    const [r] = await base
      .select({ n: sql<number>`count(*)::int` })
      .from(tentativesConnexion)
      .where(
        and(
          eq(colonne === 'email' ? tentativesConnexion.email : tentativesConnexion.ip, valeur),
          eq(tentativesConnexion.reussie, false),
          gt(tentativesConnexion.quand, depuis),
        ),
      )
    return r?.n ?? 0
  }

  if (email && (await compter('email', email)) >= SEUIL_EMAIL) {
    throw createError({
      statusCode: 429,
      statusMessage:
        'Trop d’essais sur cette adresse. Réessayez dans un quart d’heure, ou passez par « mot de passe oublié ».',
    })
  }
  if (ip && (await compter('ip', ip)) >= SEUIL_IP) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Trop de tentatives depuis cette connexion. Réessayez dans un quart d’heure.',
    })
  }
}

export async function noterTentative(email: string | null, ip: string | null, reussie: boolean) {
  try {
    await useBaseDeDonnees().insert(tentativesConnexion).values({ email, ip, reussie })
  } catch (e) {
    console.error('[limitation] écriture impossible', e)
  }
}

export async function balayerTentatives() {
  await useBaseDeDonnees().delete(tentativesConnexion).where(sql`quand < now() - interval '24 hours'`)
}
