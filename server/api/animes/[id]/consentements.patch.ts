import { z } from 'zod'
import { and, eq } from 'drizzle-orm'
import { consentementParCle, VERSION_CONSENTEMENTS } from '../../../../shared/consentements'
import { consentements, inscriptions } from '../../../base/schema'

const corps = z.object({
  inscriptionId: z.string().uuid(),
  type: z.string().min(1),
  accorde: z.boolean(),
})

// Retirer — ou redonner — une autorisation.
//
// Un consentement se retire aussi facilement qu'il se donne : c'est une
// exigence du RGPD, et c'est la moindre des choses quand il s'agit de photos
// d'enfants. On n'efface rien : on ferme la ligne existante et on en écrit une
// nouvelle. L'historique reste la preuve, la dernière ligne fait foi.
export default defineEventHandler(async (event) => {
  const animeId = getRouterParam(event, 'id')!
  const motif = await exigerAccesAnime(event, animeId)
  if (motif === 'lui-meme') {
    throw createError({ statusCode: 403, statusMessage: 'Les autorisations se modifient par un responsable.' })
  }

  const { inscriptionId, type, accorde } = await lireCorps(event, corps)
  const definition = consentementParCle(type)
  if (!definition) throw createError({ statusCode: 400, statusMessage: 'Autorisation inconnue.' })
  if (definition.obligatoire && !accorde) {
    throw createError({
      statusCode: 409,
      statusMessage:
        'Cette autorisation est indispensable à l’inscription. Pour la retirer, il faut annuler l’inscription : écrivez au staff d’unité.',
    })
  }

  const base = useBaseDeDonnees()
  const u = exigerSession(event)

  // L'inscription doit bien être celle de cet animé : sans ce contrôle, on
  // pourrait modifier le consentement d'un autre enfant en changeant l'identifiant.
  const [ins] = await base
    .select({ id: inscriptions.id })
    .from(inscriptions)
    .where(and(eq(inscriptions.id, inscriptionId), eq(inscriptions.animeId, animeId)))
    .limit(1)
  if (!ins) throw createError({ statusCode: 404, statusMessage: 'Inscription introuvable.' })

  await base.transaction(async (tx) => {
    await tx
      .update(consentements)
      .set({ revoqueLe: new Date(), revoquePar: u.personneId })
      .where(
        and(
          eq(consentements.inscriptionId, inscriptionId),
          eq(consentements.type, type),
        ),
      )
    await tx.insert(consentements).values({
      inscriptionId,
      type,
      accorde,
      versionTexte: VERSION_CONSENTEMENTS,
      libelleSigne: definition.texte,
      donnePar: u.personneId,
      ip: adresseIp(event),
    })
  })

  await journaliser(event, 'modification', 'consentement', animeId, `${type} → ${accorde ? 'accordé' : 'retiré'}`)
  return { ok: true }
})
