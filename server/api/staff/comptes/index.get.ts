import { desc, eq, isNull } from 'drizzle-orm'
import { comptes, personnes, rolesCompte } from '../../../base/schema'

// La liste des comptes et de leurs rôles. Réservée au CU : c'est lui qui donne
// et retire les accès.
export default defineEventHandler(async (event) => {
  exigerRole(event, 'cu')
  const base = useBaseDeDonnees()

  const lignes = await base
    .select({
      id: comptes.id,
      email: comptes.email,
      prenom: personnes.prenom,
      nom: personnes.nom,
      emailVerifieLe: comptes.emailVerifieLe,
      desactiveLe: comptes.desactiveLe,
      derniereConnexionLe: comptes.derniereConnexionLe,
      creeLe: comptes.creeLe,
    })
    .from(comptes)
    .innerJoin(personnes, eq(personnes.id, comptes.personneId))
    .orderBy(desc(comptes.creeLe))

  const roles = await base
    .select({ compteId: rolesCompte.compteId, role: rolesCompte.role, sectionSlug: rolesCompte.sectionSlug })
    .from(rolesCompte)
    .where(isNull(rolesCompte.retireLe))

  await journaliser(event, 'lecture', 'comptes')

  return {
    comptes: lignes.map((c) => ({ ...c, roles: roles.filter((r) => r.compteId === c.id) })),
  }
})
