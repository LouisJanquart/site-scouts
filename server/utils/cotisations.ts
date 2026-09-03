import { and, eq, inArray, ne } from 'drizzle-orm'
import {
  animes, familles, inscriptions, paiements, personnes, saisons,
} from '../base/schema'
import {
  baremeParDefaut, calculerCotisations, type Bareme, type LigneCotisation,
} from '../../shared/cotisations'

// ---------------------------------------------------------------------------
// Le calcul des cotisations, appliqué à une vraie famille.
//
// Le point qui rend ce fichier nécessaire : le tarif de chaque enfant dépend du
// nombre total de membres du ménage inscrits. Inscrire un deuxième enfant fait
// donc BAISSER la cotisation du premier, de 57,50 € à 46 €. On ne peut pas
// calculer un enfant à la fois, et on ne peut pas figer un montant en espérant
// qu'il reste vrai.
//
// D'où la règle tenue ici : à chaque changement dans une fratrie, on recalcule
// toute la fratrie. Les dossiers déjà payés ne sont pas modifiés en douce —
// ils sont signalés au trésorier, à qui revient de décider s'il rembourse la
// différence ou la reporte.
// ---------------------------------------------------------------------------

export function baremeDeLaSaison(saison: { bareme: unknown }): Bareme {
  return (saison.bareme as Bareme | null) ?? baremeParDefaut
}

export interface RecalculFamille {
  lignes: (LigneCotisation & { inscriptionId: string; prenom: string })[]
  /** Dossiers dont le montant a changé alors qu'ils étaient déjà réglés. */
  ecartsApresPaiement: {
    inscriptionId: string
    prenom: string
    ancienCentimes: number
    nouveauCentimes: number
  }[]
}

/**
 * Recalcule toutes les inscriptions d'une famille pour la saison en cours et
 * écrit les nouveaux montants. À appeler après tout ajout, annulation ou
 * changement de section dans la fratrie.
 */
export async function recalculerLaFratrie(
  familleId: string,
  saisonId: string,
  tx?: any,
): Promise<RecalculFamille> {
  const base = tx ?? useBaseDeDonnees()

  const [saison] = await base.select().from(saisons).where(eq(saisons.id, saisonId)).limit(1)
  const [famille] = await base.select().from(familles).where(eq(familles.id, familleId)).limit(1)
  if (!saison || !famille) return { lignes: [], ecartsApresPaiement: [] }

  const bareme = baremeDeLaSaison(saison)
  const supplement = saison.supplementLocalCentimes ?? 0

  // Les dossiers annulés ou refusés ne comptent pas : une inscription retirée
  // ne doit pas continuer à faire baisser le tarif des autres.
  const dossiers = await base
    .select({
      inscriptionId: inscriptions.id,
      prenom: personnes.prenom,
      sectionSlug: inscriptions.sectionSlug,
      deposeeLe: inscriptions.deposeeLe,
      brevete: inscriptions.brevete,
      ancienCentimes: inscriptions.cotisationDueCentimes,
    })
    .from(inscriptions)
    .innerJoin(animes, eq(animes.id, inscriptions.animeId))
    .innerJoin(personnes, eq(personnes.id, animes.personneId))
    .where(
      and(
        eq(animes.familleId, familleId),
        eq(inscriptions.saisonId, saisonId),
        inArray(inscriptions.statut, ['brouillon', 'envoyee', 'en-attente-paiement', 'validee']),
      ),
    )

  if (!dossiers.length) return { lignes: [], ecartsApresPaiement: [] }

  const lignes = calculerCotisations(
    dossiers.map((d: any) => ({
      cle: d.inscriptionId,
      sectionSlug: d.sectionSlug,
      deposeeLe: d.deposeeLe ? new Date(d.deposeeLe).toISOString().slice(0, 10) : undefined,
      tarifSocial: famille.tarifSocial,
      brevete: d.brevete,
    })),
    { bareme, membresAilleurs: famille.membresAilleurs, saisonDebut: String(saison.debut) },
  )

  // Le supplément local s'ajoute après le barème fédéral, et jamais au tarif
  // social : une famille à qui l'unité accorde cinq euros ne se voit pas
  // réclamer un supplément par la porte de derrière.
  const avecSupplement = lignes.map((l) => ({
    ...l,
    montantCentimes: l.motif === 'social' ? l.montantCentimes : l.montantCentimes + supplement,
  }))

  const ecarts: RecalculFamille['ecartsApresPaiement'] = []

  for (const ligne of avecSupplement) {
    const dossier = dossiers.find((d: any) => d.inscriptionId === ligne.cle)!
    if (dossier.ancienCentimes === ligne.montantCentimes) continue

    const dejaPaye = await base
      .select({ id: paiements.id })
      .from(paiements)
      .where(and(eq(paiements.inscriptionId, ligne.cle), eq(paiements.statut, 'paye')))
      .limit(1)

    if (dejaPaye.length) {
      // On ne touche pas à un dossier réglé : on le signale.
      ecarts.push({
        inscriptionId: ligne.cle,
        prenom: dossier.prenom,
        ancienCentimes: dossier.ancienCentimes,
        nouveauCentimes: ligne.montantCentimes,
      })
      continue
    }

    await base
      .update(inscriptions)
      .set({
        cotisationDueCentimes: ligne.montantCentimes,
        motifTarif: ligne.motif,
        majLe: new Date(),
      })
      .where(eq(inscriptions.id, ligne.cle))

    // L'appel de cotisation qui n'a pas encore été honoré suit le montant.
    await base
      .update(paiements)
      .set({ montantCentimes: ligne.montantCentimes })
      .where(and(eq(paiements.inscriptionId, ligne.cle), ne(paiements.statut, 'paye')))
  }

  return {
    lignes: avecSupplement.map((l) => ({
      ...l,
      inscriptionId: l.cle,
      prenom: dossiers.find((d: any) => d.inscriptionId === l.cle)!.prenom,
    })),
    ecartsApresPaiement: ecarts,
  }
}
