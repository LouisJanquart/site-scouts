import { z } from 'zod'
import { and, eq, isNull } from 'drizzle-orm'
import { bornesSections } from '../../../../shared/orientation'
import { comptes, rolesCompte } from '../../../base/schema'

const corps = z.object({
  compteId: z.string().uuid(),
  role: z.enum(['parent', 'anime', 'chef', 'cu', 'tresorier']),
  sectionSlug: z.string().optional(),
  action: z.enum(['ajouter', 'retirer']),
})

// Donner ou retirer un rôle. Deux garde-fous : un chef est toujours attaché à
// une section, et le CU ne peut pas se retirer son propre rôle — sinon plus
// personne ne peut administrer le site.
export default defineEventHandler(async (event) => {
  const u = exigerRole(event, 'cu')
  const { compteId, role, sectionSlug, action } = await lireCorps(event, corps)
  const base = useBaseDeDonnees()

  if (role === 'chef') {
    if (!sectionSlug || !bornesSections.some((s) => s.slug === sectionSlug)) {
      throw createError({
        statusCode: 422,
        statusMessage: 'Un chef est toujours rattaché à une section.',
        data: { champs: { sectionSlug: 'Choisissez une section.' } },
      })
    }
  }

  if (action === 'retirer' && role === 'cu' && compteId === u.id) {
    throw createError({
      statusCode: 409,
      statusMessage:
        'Vous ne pouvez pas retirer votre propre rôle de CU. Demandez à un autre CU de le faire.',
    })
  }

  const [cible] = await base.select({ id: comptes.id }).from(comptes).where(eq(comptes.id, compteId)).limit(1)
  if (!cible) throw createError({ statusCode: 404, statusMessage: 'Compte introuvable.' })

  if (action === 'ajouter') {
    const existant = await base
      .select({ id: rolesCompte.id })
      .from(rolesCompte)
      .where(
        and(
          eq(rolesCompte.compteId, compteId),
          eq(rolesCompte.role, role),
          isNull(rolesCompte.retireLe),
          sectionSlug ? eq(rolesCompte.sectionSlug, sectionSlug) : isNull(rolesCompte.sectionSlug),
        ),
      )
      .limit(1)
    if (!existant.length) {
      await base.insert(rolesCompte).values({
        compteId, role, sectionSlug: sectionSlug ?? null, attribuePar: u.id,
      })
    }
  } else {
    await base
      .update(rolesCompte)
      .set({ retireLe: new Date() })
      .where(
        and(
          eq(rolesCompte.compteId, compteId),
          eq(rolesCompte.role, role),
          isNull(rolesCompte.retireLe),
          sectionSlug ? eq(rolesCompte.sectionSlug, sectionSlug) : isNull(rolesCompte.sectionSlug),
        ),
      )
    // Retirer un rôle doit prendre effet tout de suite, pas dans trente jours :
    // on ferme les sessions du compte concerné.
    await fermerToutesLesSessions(compteId)
  }

  await journaliser(event, 'modification', 'role', compteId, `${action} ${role}${sectionSlug ? ` (${sectionSlug})` : ''}`)
  return { ok: true }
})
