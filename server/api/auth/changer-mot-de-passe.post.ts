import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { comptes } from '../../base/schema'

const corps = z.object({ actuel: z.string().min(1), nouveau: z.string().min(1) })

export default defineEventHandler(async (event) => {
  const u = exigerSession(event)
  const { actuel, nouveau } = await lireCorps(event, corps)

  const base = useBaseDeDonnees()
  const [c] = await base.select({ empreinte: comptes.empreinte }).from(comptes).where(eq(comptes.id, u.id)).limit(1)
  if (!c || !(await verifierMotDePasse(actuel, c.empreinte))) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Le mot de passe actuel est incorrect.',
      data: { champs: { actuel: 'Le mot de passe actuel est incorrect.' } },
    })
  }

  const souci = critiquerMotDePasse(nouveau, [u.prenom, u.nom, u.email])
  if (souci) throw createError({ statusCode: 422, statusMessage: souci, data: { champs: { nouveau: souci } } })

  await base
    .update(comptes)
    .set({ empreinte: await hacherMotDePasse(nouveau), doitChangerMdp: false })
    .where(eq(comptes.id, u.id))
  await fermerToutesLesSessions(u.id)
  await ouvrirSession(event, u.id)
  await journaliser(event, 'modification', 'mot-de-passe', u.id)
  return { ok: true }
})
