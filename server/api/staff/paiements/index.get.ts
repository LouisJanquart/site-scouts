import { and, desc, eq, sql } from 'drizzle-orm'
import { animes, familles, inscriptions, paiements, personnes, saisons } from '../../../base/schema'

// Le suivi de la caisse. Réservé au CU et au trésorier : un chef de section n'a
// pas à voir qui a payé et qui n'a pas payé — c'est une information qui range
// les familles, et ce n'est pas son travail.
export default defineEventHandler(async (event) => {
  const u = exigerRole(event, 'cu', 'tresorier')
  const base = useBaseDeDonnees()

  const [saison] = await base.select().from(saisons).where(eq(saisons.active, true)).limit(1)
  if (!saison) return { lignes: [], total: { du: 0, encaisse: 0 } }

  const lignes = await base
    .select({
      inscriptionId: inscriptions.id,
      familleId: animes.familleId,
      familleNom: familles.nom,
      tarifSocial: familles.tarifSocial,
      membresAilleurs: familles.membresAilleurs,
      prenom: personnes.prenom,
      nom: personnes.nom,
      sectionSlug: inscriptions.sectionSlug,
      statutInscription: inscriptions.statut,
      duCentimes: inscriptions.cotisationDueCentimes,
      motifTarif: inscriptions.motifTarif,
      paiementId: paiements.id,
      moyen: paiements.moyen,
      statut: paiements.statut,
      montantCentimes: paiements.montantCentimes,
      communication: paiements.communication,
      payeLe: paiements.payeLe,
    })
    .from(inscriptions)
    .innerJoin(animes, eq(animes.id, inscriptions.animeId))
    .innerJoin(familles, eq(familles.id, animes.familleId))
    .innerJoin(personnes, eq(personnes.id, animes.personneId))
    .leftJoin(paiements, eq(paiements.inscriptionId, inscriptions.id))
    .where(eq(inscriptions.saisonId, saison.id))
    .orderBy(personnes.nom, personnes.prenom, desc(paiements.creeLe))

  const [totaux] = await base
    .select({
      du: sql<number>`coalesce(sum(${inscriptions.cotisationDueCentimes}),0)::int`,
    })
    .from(inscriptions)
    .where(eq(inscriptions.saisonId, saison.id))

  const [encaisse] = await base
    .select({ somme: sql<number>`coalesce(sum(${paiements.montantCentimes}),0)::int` })
    .from(paiements)
    .innerJoin(inscriptions, eq(inscriptions.id, paiements.inscriptionId))
    .where(and(eq(inscriptions.saisonId, saison.id), eq(paiements.statut, 'paye')))

  await journaliser(event, 'lecture', 'paiements', null, saison.libelle)

  return {
    saison: saison.libelle,
    bareme: baremeDeLaSaison(saison),
    supplementLocalCentimes: saison.supplementLocalCentimes,
    lignes,
    total: { du: totaux?.du ?? 0, encaisse: encaisse?.somme ?? 0 },
  }
})
