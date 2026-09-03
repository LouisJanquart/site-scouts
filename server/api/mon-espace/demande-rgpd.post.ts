import { z } from 'zod'
import { demandesRgpd } from '../../base/schema'

const corps = z.object({
  type: z.enum(['acces', 'rectification', 'effacement', 'portabilite', 'opposition']),
  objet: z.string().trim().max(2000).optional(),
})

// Déposer une demande RGPD. Le délai légal est d'un mois : on le calcule tout
// de suite et on l'affiche, pour que le staff sache jusqu'à quand il a, et pour
// que la famille sache à quoi s'attendre.
export default defineEventHandler(async (event) => {
  const u = exigerSession(event)
  const { type, objet } = await lireCorps(event, corps)

  const echeance = new Date()
  echeance.setMonth(echeance.getMonth() + 1)

  await useBaseDeDonnees().insert(demandesRgpd).values({
    compteId: u.id,
    emailDemandeur: u.email,
    type,
    objet,
    echeanceLe: echeance,
  })

  await envoyerCourriel({
    a: process.env.NUXT_EMAIL_RGPD ?? 'staffu.16efleurus@gmail.com',
    sujet: `Demande RGPD (${type}) — ${u.prenom} ${u.nom}`,
    texte: `Une demande a été déposée depuis le site.\n\nType : ${type}\nDemandeur : ${u.prenom} ${u.nom} (${u.email})\nÉchéance légale : ${echeance.toLocaleDateString('fr-BE')}\n\n${objet ?? ''}\n\nÀ traiter dans le back office : ${urlDuSite()}/staff/rgpd`,
  })

  await journaliser(event, 'creation', 'demande-rgpd', u.id, type)

  return { ok: true, echeanceLe: echeance }
})
