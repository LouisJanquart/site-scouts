import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { animes, inscriptions, personnes, responsables } from '../../../base/schema'

const corps = z.object({
  decision: z.enum(['valider', 'refuser', 'annuler']),
  motif: z.string().trim().max(600).optional(),
  remarqueStaff: z.string().trim().max(2000).optional(),
})

// Valider, refuser ou annuler un dossier. Un refus sans motif n'est pas
// acceptable : la famille a le droit de savoir pourquoi.
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const u = exigerStaff(event)
  const { decision, motif, remarqueStaff } = await lireCorps(event, corps)

  if (decision === 'refuser' && !motif) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Un refus doit être motivé : la famille recevra ce texte.',
      data: { champs: { motif: 'Expliquez le refus.' } },
    })
  }

  const base = useBaseDeDonnees()
  const [ligne] = await base
    .select({
      id: inscriptions.id,
      animeId: inscriptions.animeId,
      sectionSlug: inscriptions.sectionSlug,
      prenom: personnes.prenom,
      nom: personnes.nom,
      familleId: animes.familleId,
    })
    .from(inscriptions)
    .innerJoin(animes, eq(animes.id, inscriptions.animeId))
    .innerJoin(personnes, eq(personnes.id, animes.personneId))
    .where(eq(inscriptions.id, id))
    .limit(1)
  if (!ligne) throw createError({ statusCode: 404, statusMessage: 'Inscription introuvable.' })

  const mesSections = sectionsDuStaff(u)
  if (mesSections && !mesSections.includes(ligne.sectionSlug)) {
    throw createError({ statusCode: 403, statusMessage: 'Ce dossier n’est pas dans votre section.' })
  }

  const statut = decision === 'valider' ? 'validee' : decision === 'refuser' ? 'refusee' : 'annulee'
  await base
    .update(inscriptions)
    .set({
      statut,
      valideeLe: decision === 'valider' ? new Date() : null,
      valideePar: u.id,
      motifRefus: decision === 'refuser' ? motif : null,
      remarqueStaff: remarqueStaff ?? undefined,
      majLe: new Date(),
    })
    .where(eq(inscriptions.id, id))

  // Prévenir la famille.
  const destinataires = await base
    .select({ email: personnes.email, prenom: personnes.prenom })
    .from(responsables)
    .innerJoin(personnes, eq(personnes.id, responsables.personneId))
    .where(eq(responsables.familleId, ligne.familleId))

  for (const d of destinataires) {
    if (!d.email) continue
    await envoyerCourriel({
      a: d.email,
      sujet:
        decision === 'valider'
          ? `Inscription de ${ligne.prenom} : c’est validé`
          : `Inscription de ${ligne.prenom} : une réponse du staff`,
      texte:
        decision === 'valider'
          ? `Bonjour ${d.prenom},\n\nL'inscription de ${ligne.prenom} ${ligne.nom} est validée. Rendez-vous à la première réunion !\n\nTout est visible dans votre espace : ${urlDuSite()}/mon-espace`
          : `Bonjour ${d.prenom},\n\nLe staff a examiné l'inscription de ${ligne.prenom} ${ligne.nom}.\n\n${motif}\n\nÉcrivez-nous si vous souhaitez en parler.`,
    })
  }

  await journaliser(event, 'modification', 'inscription', id, `décision : ${decision}`)
  return { ok: true, statut }
})
