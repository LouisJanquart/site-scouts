import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { comptes, personnes } from '../../base/schema'

const corps = z.object({
  email: z.string().trim().toLowerCase().email("Cette adresse e-mail n’a pas l’air valide."),
  motDePasse: z.string().min(1, 'Le mot de passe est obligatoire.'),
})

export default defineEventHandler(async (event) => {
  const { email, motDePasse } = await lireCorps(event, corps)
  const ip = adresseIp(event)

  await verifierFreinage(email, ip)

  const base = useBaseDeDonnees()
  const [ligne] = await base
    .select({
      id: comptes.id,
      empreinte: comptes.empreinte,
      desactiveLe: comptes.desactiveLe,
      emailVerifieLe: comptes.emailVerifieLe,
      doitChangerMdp: comptes.doitChangerMdp,
    })
    .from(comptes)
    .innerJoin(personnes, eq(personnes.id, comptes.personneId))
    .where(eq(comptes.email, email))
    .limit(1)

  // Même message et même temps de réponse que l'adresse existe ou non : sinon
  // le formulaire de connexion devient un annuaire des familles de l'unité.
  const empreinte =
    ligne?.empreinte ??
    'scrypt$131072$8$1$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='
  const bon = await verifierMotDePasse(motDePasse, empreinte)

  if (!ligne || !bon || ligne.desactiveLe) {
    await noterTentative(email, ip, false)
    throw createError({
      statusCode: 401,
      statusMessage: 'Adresse e-mail ou mot de passe incorrect.',
    })
  }

  await noterTentative(email, ip, true)
  await ouvrirSession(event, ligne.id)
  await journaliser(event, 'lecture', 'connexion', ligne.id)

  return {
    ok: true,
    emailVerifie: Boolean(ligne.emailVerifieLe),
    doitChangerMotDePasse: ligne.doitChangerMdp,
  }
})
