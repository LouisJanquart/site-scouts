import { desc, eq, inArray, or } from 'drizzle-orm'
import { comptes, journalAcces, personnes } from '../../base/schema'

// « Qui a ouvert la fiche de mon enfant ? »
//
// La question a une réponse, et elle est ici. On montre qui, quand, et à quel
// titre — pas plus : le détail de ce qui a été lu n'apporterait rien.
export default defineEventHandler(async (event) => {
  const u = exigerSession(event)
  const base = useBaseDeDonnees()

  const mesAnimes = await animesDeMaFamille(u.personneId)
  const monDossier = await monDossierAnime(u.personneId)
  const ids = [...new Set([...mesAnimes, ...(monDossier ? [monDossier] : [])])]
  if (!ids.length) return { acces: [] }

  const lignes = await base
    .select({
      quand: journalAcces.quand,
      action: journalAcces.action,
      cible: journalAcces.cible,
      detail: journalAcces.detail,
      prenom: personnes.prenom,
      nom: personnes.nom,
    })
    .from(journalAcces)
    .leftJoin(comptes, eq(comptes.id, journalAcces.compteId))
    .leftJoin(personnes, eq(personnes.id, comptes.personneId))
    .where(inArray(journalAcces.cibleId, ids))
    .orderBy(desc(journalAcces.quand))
    .limit(300)

  return { acces: lignes }
})
