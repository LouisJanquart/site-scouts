import { and, desc, eq, inArray } from 'drizzle-orm'
import {
  animes, familles, fichesSante, inscriptions, paiements, personnes, responsables, saisons,
} from '../../base/schema'

// Ce que voit une famille en arrivant : ses enfants, où ils en sont, ce qui
// reste à faire. Rien d'autre — et surtout rien sur les autres familles.
export default defineEventHandler(async (event) => {
  const u = exigerSession(event)
  const base = useBaseDeDonnees()

  const mesAnimes = await animesDeMaFamille(u.personneId)
  const monDossier = await monDossierAnime(u.personneId)
  const ids = [...new Set([...mesAnimes, ...(monDossier ? [monDossier] : [])])]

  if (!ids.length) {
    return { enfants: [], famille: null, roles: u.roles }
  }

  const lignes = await base
    .select({
      animeId: animes.id,
      prenom: personnes.prenom,
      nom: personnes.nom,
      dateNaissance: personnes.dateNaissance,
      familleId: animes.familleId,
      inscriptionId: inscriptions.id,
      sectionSlug: inscriptions.sectionSlug,
      statut: inscriptions.statut,
      cotisationDueCentimes: inscriptions.cotisationDueCentimes,
      saison: saisons.libelle,
      saisonActive: saisons.active,
      ficheAJour: fichesSante.majLe,
    })
    .from(animes)
    .innerJoin(personnes, eq(personnes.id, animes.personneId))
    .leftJoin(inscriptions, eq(inscriptions.animeId, animes.id))
    .leftJoin(saisons, eq(saisons.id, inscriptions.saisonId))
    .leftJoin(
      fichesSante,
      and(eq(fichesSante.animeId, animes.id), eq(fichesSante.saisonId, inscriptions.saisonId)),
    )
    .where(inArray(animes.id, ids))
    .orderBy(desc(saisons.debut))

  // Les paiements, en une requête plutôt qu'une par enfant.
  const inscriptionIds = lignes.map((l) => l.inscriptionId).filter((x): x is string => Boolean(x))
  const reglements = inscriptionIds.length
    ? await base
        .select({
          inscriptionId: paiements.inscriptionId,
          id: paiements.id,
          statut: paiements.statut,
          moyen: paiements.moyen,
          montantCentimes: paiements.montantCentimes,
          communication: paiements.communication,
          payeLe: paiements.payeLe,
        })
        .from(paiements)
        .where(inArray(paiements.inscriptionId, inscriptionIds))
    : []

  // Un enfant, une ligne — avec sa dernière inscription en tête.
  const parAnime = new Map<string, any>()
  for (const l of lignes) {
    if (!parAnime.has(l.animeId)) {
      parAnime.set(l.animeId, {
        id: l.animeId,
        prenom: l.prenom,
        nom: l.nom,
        dateNaissance: l.dateNaissance,
        inscriptions: [],
      })
    }
    if (l.inscriptionId) {
      parAnime.get(l.animeId).inscriptions.push({
        id: l.inscriptionId,
        saison: l.saison,
        saisonActive: l.saisonActive,
        sectionSlug: l.sectionSlug,
        statut: l.statut,
        cotisationDueCentimes: l.cotisationDueCentimes,
        ficheSanteRemplieLe: l.ficheAJour,
        paiements: reglements.filter((p) => p.inscriptionId === l.inscriptionId),
      })
    }
  }

  return {
    enfants: [...parAnime.values()],
    roles: u.roles,
    // Un parent voit le calendrier de TOUTES les sections, pas seulement de
    // celles de ses enfants : c'est ce qui a été décidé.
    voitToutLeCalendrier: aLeRole(u, 'parent', 'chef', 'cu'),
  }
})
