import { desc, eq } from 'drizzle-orm'
import { animes, inscriptions, paiements, personnes, saisons } from '../../base/schema'

// L'état de paiement d'une inscription, vu par la famille.
export default defineEventHandler(async (event) => {
  const inscriptionId = getRouterParam(event, 'inscriptionId')!
  const base = useBaseDeDonnees()

  const [ligne] = await base
    .select({
      animeId: inscriptions.animeId,
      prenom: personnes.prenom,
      nom: personnes.nom,
      saison: saisons.libelle,
      statut: inscriptions.statut,
      montant: inscriptions.cotisationDueCentimes,
    })
    .from(inscriptions)
    .innerJoin(animes, eq(animes.id, inscriptions.animeId))
    .innerJoin(personnes, eq(personnes.id, animes.personneId))
    .innerJoin(saisons, eq(saisons.id, inscriptions.saisonId))
    .where(eq(inscriptions.id, inscriptionId))
    .limit(1)

  if (!ligne) throw createError({ statusCode: 404, statusMessage: 'Inscription introuvable.' })
  await exigerAccesAnime(event, ligne.animeId)

  const reglements = await base
    .select({
      id: paiements.id,
      statut: paiements.statut,
      moyen: paiements.moyen,
      montantCentimes: paiements.montantCentimes,
      communication: paiements.communication,
      creeLe: paiements.creeLe,
      payeLe: paiements.payeLe,
    })
    .from(paiements)
    .where(eq(paiements.inscriptionId, inscriptionId))
    .orderBy(desc(paiements.creeLe))

  return {
    inscription: ligne,
    paiements: reglements,
    regle: reglements.some((p) => p.statut === 'paye'),
    enLigneDisponible: paiementEnLigneDisponible(),
    modeDemo: modeDemo(),
    coordonnees: {
      // À remplir par le staff d'unité dans les paramètres du site.
      iban: process.env.NUXT_IBAN_UNITE ?? null,
      beneficiaire: process.env.NUXT_BENEFICIAIRE ?? 'Unité 16e Fleurus',
    },
  }
})
