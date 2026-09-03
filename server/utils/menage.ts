import { sql } from 'drizzle-orm'
import { fichesSante, journalAcces, sessions, tentativesConnexion } from '../base/schema'

// ---------------------------------------------------------------------------
// Le ménage RGPD, écrit une fois et appelé de deux façons.
//
// Sur un serveur qui tourne en continu, c'est une tâche planifiée (voir
// server/tasks/menage.ts). Sur un hébergement sans serveur — Vercel, Netlify —
// il n'y a personne pour tenir un réveil : c'est le cron de l'hébergeur qui
// appelle /api/taches/menage. Le travail, lui, est le même.
//
// Les durées et leurs raisons sont dans docs/rgpd.md et dans la politique de
// confidentialité. Elles ne se décident pas ici, elles s'appliquent ici.
// ---------------------------------------------------------------------------

export async function fairePropre() {
  const base = useBaseDeDonnees()
  const compte: Record<string, number> = {}

  compte.sessions = (
    await base.delete(sessions).where(sql`expire_le < now()`).returning({ id: sessions.id })
  ).length

  compte.tentatives = (
    await base
      .delete(tentativesConnexion)
      .where(sql`quand < now() - interval '24 hours'`)
      .returning({ id: tentativesConnexion.id })
  ).length

  // Fiches santé : un an après la fin de la saison concernée.
  compte.fichesSante = (
    await base
      .delete(fichesSante)
      .where(sql`saison_id in (select id from saisons where fin < now() - interval '1 year')`)
      .returning({ id: fichesSante.id })
  ).length

  compte.journal = (
    await base
      .delete(journalAcces)
      .where(sql`quand < now() - interval '3 years'`)
      .returning({ id: journalAcces.id })
  ).length

  // Personnes sans aucun lien depuis trois ans : on vide les champs nominatifs
  // plutôt que de supprimer la ligne, à laquelle des écritures comptables
  // peuvent encore renvoyer.
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
  return compte
}
