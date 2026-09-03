import { and, eq, inArray, sql } from 'drizzle-orm'
import {
  animes, fichesSante, inscriptions, paiements, personnes, responsables, saisons,
} from '../../base/schema'

// La liste d'appel du chef : ses animés, leur statut, et les drapeaux qui se
// lisent d'un coup d'œil (fiche santé à regarder, cotisation en attente).
//
// Un chef ne voit que sa section. Le CU voit tout. Il n'y a pas de paramètre
// pour élargir : la restriction vient du compte, pas de l'URL.
//
// Sur la cotisation, deux niveaux volontairement distincts :
//   - un chef voit si c'est RÉGLÉ ou non. Il en a besoin : c'est lui qui
//     rappelle les familles avant un camp, et il ne peut pas le faire à
//     l'aveugle ;
//   - le MONTANT n'est visible que du CU et du trésorier. Il arrive qu'une
//     cotisation soit réduite pour une famille en difficulté ; afficher le
//     montant à toute l'équipe reviendrait à afficher cette difficulté.
export default defineEventHandler(async (event) => {
  const u = exigerStaff(event)
  const base = useBaseDeDonnees()
  const mesSections = sectionsDuStaff(u)

  const [saison] = await base.select().from(saisons).where(eq(saisons.active, true)).limit(1)
  if (!saison) return { saison: null, animes: [] }

  const filtreSection = getQuery(event).section
  let sections = mesSections
  if (typeof filtreSection === 'string' && filtreSection) {
    // Un CU peut filtrer sur une section ; un chef ne peut pas sortir des
    // siennes, même en trafiquant l'adresse.
    if (mesSections && !mesSections.includes(filtreSection)) {
      throw createError({ statusCode: 403, statusMessage: 'Vous n’animez pas cette section.' })
    }
    sections = [filtreSection]
  }

  const conditions = [eq(inscriptions.saisonId, saison.id)]
  if (sections) {
    if (!sections.length) return { saison: saison.libelle, animes: [] }
    conditions.push(inArray(inscriptions.sectionSlug, sections))
  }

  const lignes = await base
    .select({
      animeId: animes.id,
      inscriptionId: inscriptions.id,
      prenom: personnes.prenom,
      nom: personnes.nom,
      totem: personnes.totem,
      dateNaissance: personnes.dateNaissance,
      sectionSlug: inscriptions.sectionSlug,
      statut: inscriptions.statut,
      nouvelle: inscriptions.nouvelle,
      cotisationDueCentimes: inscriptions.cotisationDueCentimes,
      cotisationAttendue: sql<boolean>`${inscriptions.cotisationDueCentimes} > 0`,
      pointDAttention: fichesSante.aUnPointDAttention,
      saitNager: fichesSante.saitNager,
      ficheRemplie: fichesSante.majLe,
      regle: sql<boolean>`exists (select 1 from paiements p where p.inscription_id = ${inscriptions.id} and p.statut = 'paye')`,
    })
    .from(inscriptions)
    .innerJoin(animes, eq(animes.id, inscriptions.animeId))
    .innerJoin(personnes, eq(personnes.id, animes.personneId))
    .leftJoin(
      fichesSante,
      and(eq(fichesSante.animeId, animes.id), eq(fichesSante.saisonId, saison.id)),
    )
    .where(and(...conditions))
    .orderBy(inscriptions.sectionSlug, personnes.nom, personnes.prenom)

  await journaliser(event, 'lecture', 'liste-animes', null, sections ? sections.join(',') : 'toutes')

  // Le montant ne sort d'ici que pour ceux qui tiennent la caisse.
  const voitLesMontants = aLeRole(u, 'cu', 'tresorier')
  const nettoyees = lignes.map(({ cotisationDueCentimes, ...reste }) =>
    voitLesMontants ? { ...reste, cotisationDueCentimes } : reste,
  )

  return {
    saison: saison.libelle,
    sections: mesSections,
    voitLesMontants,
    animes: nettoyees,
  }
})
