import { evenements } from '../../../base/schema'

// Créer un événement. Un événement appartient à une section, ou à l'unité
// (section vide) — et dans ce cas il revient au staff d'unité.
export default defineEventHandler(async (event) => {
  const u = exigerStaff(event)
  const recu = await lireCorps(event, formeEvenement)
  const sections = recu.section ? [recu.section] : []
  verifierSections(sections)
  exigerDroitDePublier(u, sections)

  const base = useBaseDeDonnees()
  const pris = (await base.select({ slug: evenements.slug }).from(evenements)).map((l) => l.slug)
  const slug = slugLibre(fabriquerSlug(recu.titre, recu.date), pris)

  const [cree] = await base
    .insert(evenements)
    .values({ slug, ...valeursEvenement(recu), creePar: u.personneId, majPar: u.personneId })
    .returning({ id: evenements.id, slug: evenements.slug })

  viderLeCacheDesPublications()
  await journaliser(event, 'creation', 'evenement', cree!.id, `${slug} (${recu.statut})`)
  return cree
})
