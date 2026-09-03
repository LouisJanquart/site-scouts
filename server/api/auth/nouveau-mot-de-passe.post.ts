import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { comptes, personnes } from '../../base/schema'

const corps = z.object({
  jeton: z.string().min(10),
  motDePasse: z.string().min(1),
})

export default defineEventHandler(async (event) => {
  const { jeton, motDePasse } = await lireCorps(event, corps)

  const compteId = await consommerJeton(jeton, 'reinitialisation')
  if (!compteId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Ce lien a expiré ou a déjà servi. Demandez-en un nouveau.',
    })
  }

  const base = useBaseDeDonnees()
  const [c] = await base
    .select({ email: comptes.email, prenom: personnes.prenom, nom: personnes.nom })
    .from(comptes)
    .innerJoin(personnes, eq(personnes.id, comptes.personneId))
    .where(eq(comptes.id, compteId))
    .limit(1)

  const souci = critiquerMotDePasse(motDePasse, [c?.prenom ?? '', c?.nom ?? '', c?.email ?? ''])
  if (souci) throw createError({ statusCode: 422, statusMessage: souci, data: { champs: { motDePasse: souci } } })

  await base
    .update(comptes)
    .set({ empreinte: await hacherMotDePasse(motDePasse), doitChangerMdp: false })
    .where(eq(comptes.id, compteId))

  // Changer de mot de passe ferme toutes les sessions : si quelqu'un d'autre
  // était connecté, il ne l'est plus.
  await fermerToutesLesSessions(compteId)
  await journaliser(event, 'modification', 'mot-de-passe', compteId)
  await ouvrirSession(event, compteId)

  return { ok: true }
})
