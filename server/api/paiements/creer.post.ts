import { z } from 'zod'
import { and, eq } from 'drizzle-orm'
import { animes, inscriptions, paiements, personnes, saisons } from '../../base/schema'

// Ouvrir un paiement en ligne pour une inscription.
export default defineEventHandler(async (event) => {
  const { inscriptionId } = await lireCorps(event, z.object({ inscriptionId: z.string().uuid() }))
  const base = useBaseDeDonnees()

  const [ligne] = await base
    .select({
      id: inscriptions.id,
      animeId: inscriptions.animeId,
      statut: inscriptions.statut,
      montant: inscriptions.cotisationDueCentimes,
      prenom: personnes.prenom,
      nom: personnes.nom,
      saison: saisons.libelle,
    })
    .from(inscriptions)
    .innerJoin(animes, eq(animes.id, inscriptions.animeId))
    .innerJoin(personnes, eq(personnes.id, animes.personneId))
    .innerJoin(saisons, eq(saisons.id, inscriptions.saisonId))
    .where(eq(inscriptions.id, inscriptionId))
    .limit(1)

  if (!ligne) throw createError({ statusCode: 404, statusMessage: 'Inscription introuvable.' })

  // Payer suppose d'avoir accès au dossier. Un chef peut payer pour une
  // famille en difficulté ; un inconnu, non.
  await exigerAccesAnime(event, ligne.animeId)

  // Déjà réglé ? On ne redemande pas d'argent.
  const dejaPaye = await base
    .select({ id: paiements.id })
    .from(paiements)
    .where(and(eq(paiements.inscriptionId, inscriptionId), eq(paiements.statut, 'paye')))
    .limit(1)
  if (dejaPaye.length) {
    throw createError({ statusCode: 409, statusMessage: 'Cette cotisation est déjà réglée.' })
  }
  if (ligne.montant <= 0) {
    throw createError({ statusCode: 409, statusMessage: 'Il n’y a rien à payer pour cette inscription.' })
  }

  const [enregistrement] = await base
    .insert(paiements)
    .values({
      inscriptionId,
      montantCentimes: ligne.montant,
      moyen: 'mollie',
      statut: 'ouvert',
    })
    .returning()

  const paiementMollie = await mollie().payments.create({
    amount: { currency: 'EUR', value: (ligne.montant / 100).toFixed(2) },
    description: `Cotisation ${ligne.saison} — ${ligne.prenom} ${ligne.nom}`,
    redirectUrl: `${urlDuSite()}/mon-espace/paiement/${inscriptionId}?retour=1`,
    webhookUrl: process.env.NUXT_MOLLIE_WEBHOOK || `${urlDuSite()}/api/paiements/mollie`,
    metadata: { paiementId: enregistrement!.id, inscriptionId },
  })

  await base
    .update(paiements)
    .set({ referenceMollie: paiementMollie.id, statut: 'en-cours' })
    .where(eq(paiements.id, enregistrement!.id))

  await journaliser(event, 'creation', 'paiement', enregistrement!.id, `mollie ${paiementMollie.id}`)

  return { url: paiementMollie.getCheckoutUrl() }
})
