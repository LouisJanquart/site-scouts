import { eq } from 'drizzle-orm'
import { animes, contactsUrgence, familles, inscriptions, personnes, responsables, saisons } from '../../base/schema'

// La fiche d'un animé, sans la santé (qui a sa propre route, son propre
// contrôle et son propre journal).
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const motif = await exigerAccesAnime(event, id)
  const base = useBaseDeDonnees()

  const [anime] = await base
    .select({
      id: animes.id,
      familleId: animes.familleId,
      prenom: personnes.prenom,
      nom: personnes.nom,
      totem: personnes.totem,
      dateNaissance: personnes.dateNaissance,
      genre: personnes.genre,
      email: personnes.email,
      telephone: personnes.telephone,
      rue: personnes.rue,
      numero: personnes.numero,
      codePostal: personnes.codePostal,
      localite: personnes.localite,
    })
    .from(animes)
    .innerJoin(personnes, eq(personnes.id, animes.personneId))
    .where(eq(animes.id, id))
    .limit(1)

  if (!anime) throw createError({ statusCode: 404, statusMessage: 'Dossier introuvable.' })

  const inscriptionsAnime = await base
    .select({
      id: inscriptions.id,
      saison: saisons.libelle,
      saisonActive: saisons.active,
      sectionSlug: inscriptions.sectionSlug,
      statut: inscriptions.statut,
      cotisationDueCentimes: inscriptions.cotisationDueCentimes,
      deposeeLe: inscriptions.deposeeLe,
      valideeLe: inscriptions.valideeLe,
      remarqueFamille: inscriptions.remarqueFamille,
    })
    .from(inscriptions)
    .innerJoin(saisons, eq(saisons.id, inscriptions.saisonId))
    .where(eq(inscriptions.animeId, id))

  const urgences = await base
    .select()
    .from(contactsUrgence)
    .where(eq(contactsUrgence.animeId, id))
    .orderBy(contactsUrgence.ordre)

  // Les responsables : un animé voit ses parents, un chef aussi (il doit
  // pouvoir appeler), un CU aussi.
  const adultes = await base
    .select({
      prenom: personnes.prenom,
      nom: personnes.nom,
      email: personnes.email,
      telephone: personnes.telephone,
      lien: responsables.lien,
      autoriteParentale: responsables.autoriteParentale,
      ordreAppel: responsables.ordreAppel,
    })
    .from(responsables)
    .innerJoin(personnes, eq(personnes.id, responsables.personneId))
    .where(eq(responsables.familleId, anime.familleId))
    .orderBy(responsables.ordreAppel)

  await journaliser(event, 'lecture', 'anime', id, `motif: ${motif}`)

  return { anime, inscriptions: inscriptionsAnime, contactsUrgence: urgences, responsables: adultes, motif }
})
