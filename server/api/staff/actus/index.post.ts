import { actus } from '../../../base/schema'

// Créer une actu. Un chef publie pour sa section sans validation : c'est le
// choix fait le 15/09/2026. Le serveur vérifie seulement qu'il ne parle pas au
// nom d'une autre section, ni de l'unité.
export default defineEventHandler(async (event) => {
  const u = exigerStaff(event)
  const recu = await lireCorps(event, formeActu)
  const sections = [...new Set(recu.sections)]
  verifierSections(sections)
  exigerDroitDePublier(u, sections)

  const base = useBaseDeDonnees()
  const pris = (await base.select({ slug: actus.slug }).from(actus)).map((l) => l.slug)
  const slug = slugLibre(fabriquerSlug(recu.titre, recu.date), pris)

  const [cree] = await base
    .insert(actus)
    .values({
      slug,
      titre: recu.titre,
      date: recu.date,
      sections,
      chapo: recu.chapo,
      corps: enParagraphes(recu.corps),
      public: recu.public,
      statut: recu.statut,
      creePar: u.personneId,
      majPar: u.personneId,
    })
    .returning({ id: actus.id, slug: actus.slug })

  viderLeCacheDesPublications()
  await journaliser(event, 'creation', 'actu', cree!.id, `${slug} (${recu.statut})`)
  return cree
})
