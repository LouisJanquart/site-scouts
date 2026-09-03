import { and, eq, isNull, lt, notInArray, sql } from 'drizzle-orm'
import { fichesSante, journalAcces, personnes, saisons, sessions, tentativesConnexion } from '../base/schema'

// ---------------------------------------------------------------------------
// Le ménage.
//
// Conserver des données d'enfants « au cas où » n'est pas neutre : c'est une
// obligation de les effacer quand elles n'ont plus de raison d'être. Cette
// tâche applique les durées annoncées dans la politique de confidentialité, et
// elle tourne toute seule.
//
// Les durées, et pourquoi :
//   sessions               à l'expiration    un jeton périmé n'a plus d'usage
//   tentatives de connexion    24 h          la fenêtre de freinage fait 15 min
//   fiches santé          1 an après la fin  aucune raison de garder les
//                          de la saison      allergies d'un enfant parti
//   journal d'accès            3 ans         de quoi répondre à une question
//                                            posée longtemps après
//   personnes sans lien        3 ans         anonymisées, pas supprimées : les
//                                            écritures comptables les gardent
//
// Les paiements et les consentements ne sont PAS purgés ici : les premiers
// relèvent de la comptabilité (sept ans en Belgique), les seconds sont la
// preuve de ce qui a été autorisé. Ils sont traités à part, à la main.
// ---------------------------------------------------------------------------

export default defineTask({
  meta: {
    name: 'menage',
    description: 'Efface ce qui a dépassé sa durée de conservation.',
  },
  async run() {
    const base = useBaseDeDonnees()
    const compte: Record<string, number> = {}

    const sessionsEffacees = await base.delete(sessions).where(lt(sessions.expireLe, new Date())).returning({ id: sessions.id })
    compte.sessions = sessionsEffacees.length

    const tentatives = await base
      .delete(tentativesConnexion)
      .where(sql`${tentativesConnexion.quand} < now() - interval '24 hours'`)
      .returning({ id: tentativesConnexion.id })
    compte.tentatives = tentatives.length

    // Fiches santé : un an après la fin de la saison concernée.
    const fiches = await base
      .delete(fichesSante)
      .where(
        sql`${fichesSante.saisonId} in (select id from saisons where fin < now() - interval '1 year')`,
      )
      .returning({ id: fichesSante.id })
    compte.fichesSante = fiches.length

    const journal = await base
      .delete(journalAcces)
      .where(sql`${journalAcces.quand} < now() - interval '3 years'`)
      .returning({ id: journalAcces.id })
    compte.journal = journal.length

    // Personnes sans aucun lien depuis trois ans : on vide les champs
    // nominatifs plutôt que de supprimer la ligne, à laquelle des écritures
    // comptables peuvent encore renvoyer.
    const anonymisees = await base.execute(sql`
      update personnes set
        prenom = 'Anonyme', nom = '', totem = null, date_naissance = null, genre = null,
        email = null, telephone = null, rue = null, numero = null, code_postal = null,
        localite = null, anonymisee_le = now(), maj_le = now()
      where anonymisee_le is null
        and cree_le < now() - interval '3 years'
        and id not in (select personne_id from animes)
        and id not in (select personne_id from responsables)
        and id not in (select personne_id from comptes)
      returning id
    `)
    compte.anonymisees = (anonymisees as unknown as unknown[]).length

    console.info('[ménage]', compte)
    return { result: compte }
  },
})
