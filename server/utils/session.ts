import type { H3Event } from 'h3'
import { and, eq, gt, isNull, desc, sql } from 'drizzle-orm'
import { comptes, personnes, rolesCompte, sessions } from '../base/schema'

// ---------------------------------------------------------------------------
// Sessions.
//
// Un jeton aléatoire de 256 bits dans un cookie httpOnly. La base n'en garde
// que l'empreinte SHA-256 : si elle fuite, les sessions en cours ne sont pas
// rejouables. Durée : trente jours, glissante — la session se prolonge quand on
// s'en sert, elle s'éteint quand on ne s'en sert plus.
// ---------------------------------------------------------------------------

const COOKIE = 'fleurus_session'
const DUREE_JOURS = 30
const GLISSEMENT_JOURS = 7

export interface Utilisateur {
  id: string
  personneId: string
  email: string
  prenom: string
  nom: string
  roles: { role: string; sectionSlug: string | null }[]
}

export async function ouvrirSession(event: H3Event, compteId: string) {
  const base = useBaseDeDonnees()
  const jeton = creerJeton()
  const expire = new Date(Date.now() + DUREE_JOURS * 864e5)

  await base.insert(sessions).values({
    compteId,
    empreinteJeton: empreinteJeton(jeton),
    expireLe: expire,
    ip: adresseIp(event),
    agent: getRequestHeader(event, 'user-agent')?.slice(0, 300) ?? null,
  })

  setCookie(event, COOKIE, jeton, {
    httpOnly: true,
    sameSite: 'lax',
    secure: !import.meta.dev,
    path: '/',
    expires: expire,
  })

  await base
    .update(comptes)
    .set({ derniereConnexionLe: new Date() })
    .where(eq(comptes.id, compteId))
}

export async function fermerSession(event: H3Event) {
  const jeton = getCookie(event, COOKIE)
  if (jeton) {
    await useBaseDeDonnees().delete(sessions).where(eq(sessions.empreinteJeton, empreinteJeton(jeton)))
  }
  deleteCookie(event, COOKIE, { path: '/' })
}

// Ferme toutes les sessions d'un compte : changement de mot de passe, ou
// bouton « me déconnecter partout ».
export async function fermerToutesLesSessions(compteId: string) {
  await useBaseDeDonnees().delete(sessions).where(eq(sessions.compteId, compteId))
}

export async function lireSession(event: H3Event): Promise<Utilisateur | null> {
  const jeton = getCookie(event, COOKIE)
  if (!jeton) return null

  const base = useBaseDeDonnees()
  const [ligne] = await base
    .select({
      sessionId: sessions.id,
      expireLe: sessions.expireLe,
      compteId: comptes.id,
      email: comptes.email,
      desactiveLe: comptes.desactiveLe,
      personneId: personnes.id,
      prenom: personnes.prenom,
      nom: personnes.nom,
    })
    .from(sessions)
    .innerJoin(comptes, eq(comptes.id, sessions.compteId))
    .innerJoin(personnes, eq(personnes.id, comptes.personneId))
    .where(
      and(
        eq(sessions.empreinteJeton, empreinteJeton(jeton)),
        gt(sessions.expireLe, new Date()),
      ),
    )
    .limit(1)

  if (!ligne || ligne.desactiveLe) return null

  // Glissement : on ne réécrit pas la base à chaque requête, seulement quand il
  // reste moins d'une semaine.
  if (ligne.expireLe.getTime() - Date.now() < GLISSEMENT_JOURS * 864e5) {
    const nouvelle = new Date(Date.now() + DUREE_JOURS * 864e5)
    await base
      .update(sessions)
      .set({ expireLe: nouvelle, derniereActiviteLe: new Date() })
      .where(eq(sessions.id, ligne.sessionId))
    setCookie(event, COOKIE, jeton, {
      httpOnly: true, sameSite: 'lax', secure: !import.meta.dev, path: '/', expires: nouvelle,
    })
  }

  const roles = await base
    .select({ role: rolesCompte.role, sectionSlug: rolesCompte.sectionSlug })
    .from(rolesCompte)
    .where(and(eq(rolesCompte.compteId, ligne.compteId), isNull(rolesCompte.retireLe)))

  return {
    id: ligne.compteId,
    personneId: ligne.personneId,
    email: ligne.email,
    prenom: ligne.prenom,
    nom: ligne.nom,
    roles,
  }
}

// Ménage : les sessions expirées et les jetons périmés n'ont rien à faire là.
export async function balayerSessions() {
  await useBaseDeDonnees().delete(sessions).where(sql`expire_le < now()`)
}
