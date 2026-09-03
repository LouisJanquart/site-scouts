import { desc, eq } from 'drizzle-orm'
import { comptes, demandesRgpd, journalAcces, personnes } from '../../../base/schema'

// Le tableau de bord RGPD du CU : les demandes en cours et les derniers accès.
export default defineEventHandler(async (event) => {
  exigerRole(event, 'cu')
  const base = useBaseDeDonnees()

  const demandes = await base
    .select({
      id: demandesRgpd.id,
      type: demandesRgpd.type,
      objet: demandesRgpd.objet,
      statut: demandesRgpd.statut,
      demandeeLe: demandesRgpd.demandeeLe,
      echeanceLe: demandesRgpd.echeanceLe,
      traiteeLe: demandesRgpd.traiteeLe,
      email: demandesRgpd.emailDemandeur,
    })
    .from(demandesRgpd)
    .orderBy(desc(demandesRgpd.demandeeLe))
    .limit(100)

  const acces = await base
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
    .orderBy(desc(journalAcces.quand))
    .limit(200)

  return { demandes, acces }
})
