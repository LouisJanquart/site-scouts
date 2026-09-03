import { and, desc, eq, inArray } from 'drizzle-orm'
import { animes, inscriptions, personnes, saisons } from '../../../base/schema'

// Les dossiers à relire. C'est la file d'attente du staff : ce qui vient
// d'arriver, ce qui attend un paiement, ce qui est réglé mais pas encore validé.
export default defineEventHandler(async (event) => {
  const u = exigerStaff(event)
  const base = useBaseDeDonnees()
  const mesSections = sectionsDuStaff(u)

  const [saison] = await base.select().from(saisons).where(eq(saisons.active, true)).limit(1)
  if (!saison) return { inscriptions: [] }

  const conditions = [
    eq(inscriptions.saisonId, saison.id),
    inArray(inscriptions.statut, ['envoyee', 'en-attente-paiement']),
  ]
  if (mesSections) {
    if (!mesSections.length) return { inscriptions: [] }
    conditions.push(inArray(inscriptions.sectionSlug, mesSections))
  }

  const lignes = await base
    .select({
      id: inscriptions.id,
      animeId: inscriptions.animeId,
      prenom: personnes.prenom,
      nom: personnes.nom,
      dateNaissance: personnes.dateNaissance,
      sectionSlug: inscriptions.sectionSlug,
      statut: inscriptions.statut,
      cotisationDueCentimes: inscriptions.cotisationDueCentimes,
      deposeeLe: inscriptions.deposeeLe,
      remarqueFamille: inscriptions.remarqueFamille,
    })
    .from(inscriptions)
    .innerJoin(animes, eq(animes.id, inscriptions.animeId))
    .innerJoin(personnes, eq(personnes.id, animes.personneId))
    .where(and(...conditions))
    .orderBy(desc(inscriptions.deposeeLe))

  return { inscriptions: lignes }
})
