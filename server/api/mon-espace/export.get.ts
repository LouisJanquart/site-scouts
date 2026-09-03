import { desc, eq, inArray } from 'drizzle-orm'
import {
  animes, comptes, consentements, contactsUrgence, fichesSante, inscriptions,
  paiements, personnes, responsables, saisons,
} from '../../base/schema'

// Le droit d'accès et de portabilité (RGPD, articles 15 et 20), en un clic.
//
// Tout ce que nous savons de la famille, dans un fichier lisible par une
// machine et par un humain. Y compris la fiche santé, déchiffrée : elle
// appartient à la famille, pas à nous.
export default defineEventHandler(async (event) => {
  const u = exigerSession(event)
  const base = useBaseDeDonnees()

  const mesAnimes = await animesDeMaFamille(u.personneId)
  const monDossier = await monDossierAnime(u.personneId)
  const ids = [...new Set([...mesAnimes, ...(monDossier ? [monDossier] : [])])]

  const [moi] = await base
    .select()
    .from(personnes)
    .where(eq(personnes.id, u.personneId))
    .limit(1)

  const dossiers = []
  for (const id of ids) {
    const [anime] = await base
      .select()
      .from(personnes)
      .innerJoin(animes, eq(animes.personneId, personnes.id))
      .where(eq(animes.id, id))
      .limit(1)

    const ins = await base
      .select({
        id: inscriptions.id, saison: saisons.libelle, section: inscriptions.sectionSlug,
        statut: inscriptions.statut, deposeeLe: inscriptions.deposeeLe,
        valideeLe: inscriptions.valideeLe, cotisationDueCentimes: inscriptions.cotisationDueCentimes,
        remarqueFamille: inscriptions.remarqueFamille,
      })
      .from(inscriptions)
      .innerJoin(saisons, eq(saisons.id, inscriptions.saisonId))
      .where(eq(inscriptions.animeId, id))

    const insIds = ins.map((i) => i.id)
    const accords = insIds.length
      ? await base.select().from(consentements).where(inArray(consentements.inscriptionId, insIds))
      : []
    const reglements = insIds.length
      ? await base
          .select({
            inscriptionId: paiements.inscriptionId, montantCentimes: paiements.montantCentimes,
            moyen: paiements.moyen, statut: paiements.statut, communication: paiements.communication,
            payeLe: paiements.payeLe,
          })
          .from(paiements)
          .where(inArray(paiements.inscriptionId, insIds))
      : []

    const fiches = await base.select().from(fichesSante).where(eq(fichesSante.animeId, id))
    const urgences = await base.select().from(contactsUrgence).where(eq(contactsUrgence.animeId, id))

    dossiers.push({
      enfant: anime?.personnes,
      inscriptions: ins,
      consentements: accords.map((c) => ({
        type: c.type, accorde: c.accorde, texteSigne: c.libelleSigne,
        version: c.versionTexte, donneLe: c.donneLe, revoqueLe: c.revoqueLe,
      })),
      paiements: reglements,
      contactsUrgence: urgences,
      fichesSante: fiches.map((f) => ({
        saisonId: f.saisonId, majLe: f.majLe, contenu: dechiffrer(f),
      })),
    })
  }

  await journaliser(event, 'export', 'mes-donnees', u.personneId)

  setHeader(event, 'content-disposition', `attachment; filename="mes-donnees-16e-fleurus.json"`)
  return {
    aProposDeCeFichier:
      'Toutes les données que l’unité scoute 16e Fleurus conserve à votre sujet et au sujet de vos enfants, au ' +
      new Date().toISOString() +
      '. Ce fichier vous appartient : vous pouvez le conserver, le transmettre, ou demander l’effacement de ces données depuis votre espace.',
    vous: moi,
    dossiers,
  }
})
