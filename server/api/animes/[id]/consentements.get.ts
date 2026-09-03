import { desc, eq } from 'drizzle-orm'
import { consentements, inscriptions, saisons } from '../../../base/schema'

// Les autorisations en cours, et leur histoire. Un parent doit pouvoir voir
// exactement ce qu'il a signé, quand, et sur quel texte.
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  await exigerAccesAnime(event, id)

  const lignes = await useBaseDeDonnees()
    .select({
      id: consentements.id,
      inscriptionId: consentements.inscriptionId,
      saison: saisons.libelle,
      saisonActive: saisons.active,
      type: consentements.type,
      accorde: consentements.accorde,
      versionTexte: consentements.versionTexte,
      libelleSigne: consentements.libelleSigne,
      donneLe: consentements.donneLe,
      revoqueLe: consentements.revoqueLe,
    })
    .from(consentements)
    .innerJoin(inscriptions, eq(inscriptions.id, consentements.inscriptionId))
    .innerJoin(saisons, eq(saisons.id, inscriptions.saisonId))
    .where(eq(inscriptions.animeId, id))
    .orderBy(desc(consentements.donneLe))

  return { consentements: lignes }
})
