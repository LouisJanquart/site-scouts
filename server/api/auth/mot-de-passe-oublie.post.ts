import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { comptes, personnes } from '../../base/schema'

const corps = z.object({ email: z.string().trim().toLowerCase().email() })

export default defineEventHandler(async (event) => {
  const { email } = await lireCorps(event, corps)
  await verifierFreinage(null, adresseIp(event))

  const [ligne] = await useBaseDeDonnees()
    .select({ id: comptes.id, prenom: personnes.prenom })
    .from(comptes)
    .innerJoin(personnes, eq(personnes.id, comptes.personneId))
    .where(eq(comptes.email, email))
    .limit(1)

  // On répond toujours la même chose : ce formulaire ne doit pas permettre de
  // savoir si une adresse est inscrite chez nous.
  if (ligne) {
    const jeton = await emettreJeton(ligne.id, 'reinitialisation')
    await envoyerCourriel({
      a: email,
      sujet: 'Réinitialiser votre mot de passe',
      texte: `Bonjour ${ligne.prenom},

Quelqu'un — vous, sans doute — a demandé à changer le mot de passe de votre espace 16e Fleurus.

Pour choisir un nouveau mot de passe, suivez ce lien :
${urlDuSite()}/connexion/nouveau-mot-de-passe?jeton=${jeton}

Le lien est valable deux heures et ne peut servir qu'une fois.

Si vous n'avez rien demandé, ignorez ce message : votre mot de passe actuel reste valable.`,
    })
    await journaliser(event, 'modification', 'mot-de-passe-oublie', ligne.id)
  }

  return { ok: true }
})
