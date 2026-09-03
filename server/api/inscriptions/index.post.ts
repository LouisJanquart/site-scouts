import { and, eq, sql } from 'drizzle-orm'
import { dossierSchema } from '../../../shared/inscription'
import { consentementsCatalogue, VERSION_CONSENTEMENTS } from '../../../shared/consentements'
import { anneeDeSaison, sectionsPossibles } from '../../../shared/orientation'
import {
  animes, comptes, consentements as tConsentements, contactsUrgence, familles,
  fichesSante, inscriptions, paiements, personnes, responsables, rolesCompte, saisons,
} from '../../base/schema'

// ---------------------------------------------------------------------------
// Le dépôt d'un dossier d'inscription.
//
// C'est la route la plus lourde du site, et la seule qui écrit dans huit tables
// d'un coup. Tout se fait dans une transaction : ou bien le dossier existe en
// entier, ou bien il n'existe pas. Un enfant à moitié inscrit — avec ses
// autorisations mais sans sa fiche santé — serait pire que pas d'inscription.
// ---------------------------------------------------------------------------

export default defineEventHandler(async (event) => {
  const dossier = await lireCorps(event, dossierSchema)
  const base = useBaseDeDonnees()
  const ip = adresseIp(event)
  const connecte = event.context.compte ?? null

  // --- La saison -----------------------------------------------------------
  const [saison] = await base.select().from(saisons).where(eq(saisons.active, true)).limit(1)
  if (!saison) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Les inscriptions ne sont pas encore ouvertes pour cette saison.',
    })
  }
  const maintenant = new Date()
  if (saison.ouvertureInscriptions && maintenant < saison.ouvertureInscriptions) {
    throw createError({ statusCode: 403, statusMessage: 'Les inscriptions ne sont pas encore ouvertes.' })
  }
  if (saison.clotureInscriptions && maintenant > saison.clotureInscriptions) {
    throw createError({
      statusCode: 403,
      statusMessage:
        'Les inscriptions en ligne sont closes. Écrivez au staff d’unité, il reste peut-être de la place.',
    })
  }

  // --- La section demandée doit correspondre à l'âge -----------------------
  const annee = anneeDeSaison(new Date(saison.debut))
  const possibles = sectionsPossibles(dossier.enfant.dateNaissance, annee, dossier.enfant.genre)
  if (!possibles.some((s) => s.slug === dossier.enfant.sectionSlug)) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Cette section ne correspond pas à l’âge de l’enfant.',
      data: { champs: { 'enfant.sectionSlug': 'Choisissez une section proposée pour cet âge.' } },
    })
  }

  // --- Le compte du premier responsable ------------------------------------
  const premier = dossier.responsables[0]!
  let compteParentId: string | null = connecte?.id ?? null

  if (!connecte) {
    const [existant] = await base
      .select({ id: comptes.id })
      .from(comptes)
      .where(eq(comptes.email, premier.email))
      .limit(1)
    if (existant) {
      // On ne rattache jamais un dossier à un compte existant sans preuve que
      // c'est bien son propriétaire qui écrit. Sinon, il suffirait de connaître
      // l'adresse d'un parent pour lui coller un enfant dans le dos.
      throw createError({
        statusCode: 409,
        statusMessage:
          'Un compte existe déjà avec cette adresse. Connectez-vous d’abord : le dossier sera rattaché à votre famille.',
        data: { champs: { 'responsables.0.email': 'Adresse déjà connue — connectez-vous.' } },
      })
    }
    if (!dossier.motDePasse) {
      throw createError({
        statusCode: 422,
        statusMessage: 'Choisissez un mot de passe pour votre espace.',
        data: { champs: { motDePasse: 'Choisissez un mot de passe.' } },
      })
    }
    const souci = critiquerMotDePasse(dossier.motDePasse, [premier.prenom, premier.nom, premier.email])
    if (souci) {
      throw createError({ statusCode: 422, statusMessage: souci, data: { champs: { motDePasse: souci } } })
    }
  }

  const empreinteMdp = dossier.motDePasse ? await hacherMotDePasse(dossier.motDePasse) : null

  // --- Écriture ------------------------------------------------------------
  const resultat = await base.transaction(async (tx) => {
    // 1. La famille. Si le parent est déjà connu, on retrouve la sienne ;
    //    sinon on en ouvre une nouvelle. C'est ce qui fait marcher la
    //    dégressivité fratrie sans que personne n'ait à la déclarer.
    let familleId: string
    let personneParentId: string

    if (connecte) {
      personneParentId = connecte.personneId
      const [f] = await tx
        .select({ id: responsables.familleId })
        .from(responsables)
        .where(eq(responsables.personneId, personneParentId))
        .limit(1)
      if (f) {
        familleId = f.id
      } else {
        const [nouvelle] = await tx.insert(familles).values({ nom: premier.nom }).returning()
        familleId = nouvelle!.id
        await tx.insert(responsables).values({
          familleId,
          personneId: personneParentId,
          lien: premier.lien,
          autoriteParentale: premier.autoriteParentale,
          destinataireFacture: premier.destinataireFacture,
          ordreAppel: 1,
        })
      }
    } else {
      const [nouvelle] = await tx.insert(familles).values({ nom: premier.nom }).returning()
      familleId = nouvelle!.id

      const adr = premier.memeAdresseQueLEnfant ? dossier.enfant.adresse : premier.adresse
      const [p] = await tx
        .insert(personnes)
        .values({
          prenom: premier.prenom,
          nom: premier.nom,
          email: premier.email,
          telephone: premier.telephone,
          rue: adr?.rue, numero: adr?.numero, codePostal: adr?.codePostal,
          localite: adr?.localite, pays: adr?.pays ?? 'BE',
        })
        .returning()
      personneParentId = p!.id

      const [c] = await tx
        .insert(comptes)
        .values({ personneId: personneParentId, email: premier.email, empreinte: empreinteMdp! })
        .returning()
      compteParentId = c!.id
      await tx.insert(rolesCompte).values({ compteId: c!.id, role: 'parent' })

      await tx.insert(responsables).values({
        familleId,
        personneId: personneParentId,
        lien: premier.lien,
        autoriteParentale: premier.autoriteParentale,
        destinataireFacture: premier.destinataireFacture,
        ordreAppel: 1,
      })
    }

    // 2. Les autres responsables. Ils n'ont pas de compte tout de suite : ils
    //    en recevront un par invitation s'ils en veulent un.
    for (const [i, r] of dossier.responsables.slice(1).entries()) {
      const adr = r.memeAdresseQueLEnfant ? dossier.enfant.adresse : r.adresse
      const [p] = await tx
        .insert(personnes)
        .values({
          prenom: r.prenom, nom: r.nom, email: r.email, telephone: r.telephone,
          rue: adr?.rue, numero: adr?.numero, codePostal: adr?.codePostal,
          localite: adr?.localite, pays: adr?.pays ?? 'BE',
        })
        .returning()
      await tx.insert(responsables).values({
        familleId,
        personneId: p!.id,
        lien: r.lien,
        autoriteParentale: r.autoriteParentale,
        destinataireFacture: r.destinataireFacture,
        ordreAppel: i + 2,
      })
    }

    // 3. L'enfant.
    const [personneEnfant] = await tx
      .insert(personnes)
      .values({
        prenom: dossier.enfant.prenom,
        nom: dossier.enfant.nom,
        dateNaissance: dossier.enfant.dateNaissance,
        genre: dossier.enfant.genre,
        email: dossier.enfant.email || null,
        telephone: dossier.enfant.telephone || null,
        rue: dossier.enfant.adresse.rue,
        numero: dossier.enfant.adresse.numero,
        codePostal: dossier.enfant.adresse.codePostal,
        localite: dossier.enfant.adresse.localite,
        pays: dossier.enfant.adresse.pays,
      })
      .returning()

    const [anime] = await tx
      .insert(animes)
      .values({ personneId: personneEnfant!.id, familleId })
      .returning()

    // 4. La cotisation : dégressive à partir du deuxième enfant de la famille.
    const [compte] = await tx
      .select({ dejaInscrits: sql<number>`count(*)::int` })
      .from(inscriptions)
      .innerJoin(animes, eq(animes.id, inscriptions.animeId))
      .where(and(eq(animes.familleId, familleId), eq(inscriptions.saisonId, saison.id)))
    const dejaInscrits = compte?.dejaInscrits ?? 0
    const montant =
      dejaInscrits > 0 && saison.cotisationFratrieCentimes != null
        ? saison.cotisationFratrieCentimes
        : saison.cotisationCentimes

    const [inscription] = await tx
      .insert(inscriptions)
      .values({
        animeId: anime!.id,
        saisonId: saison.id,
        sectionSlug: dossier.enfant.sectionSlug,
        statut: montant > 0 ? 'en-attente-paiement' : 'envoyee',
        cotisationDueCentimes: montant,
        deposeeLe: new Date(),
        remarqueFamille: dossier.remarqueFamille,
      })
      .returning()

    // 5. Les contacts d'urgence.
    if (dossier.contactsUrgence.length) {
      await tx.insert(contactsUrgence).values(
        dossier.contactsUrgence.map((c, i) => ({
          animeId: anime!.id, nom: c.nom, lien: c.lien, telephone: c.telephone, ordre: i + 1,
        })),
      )
    }

    // 6. La fiche santé, chiffrée.
    const coffre = chiffrer(dossier.sante)
    const pointDAttention = Boolean(
      dossier.sante.allergies.length ||
        dossier.sante.traitements.length ||
        dossier.sante.regimesAlimentaires.length ||
        dossier.sante.antecedents,
    )
    await tx.insert(fichesSante).values({
      animeId: anime!.id,
      saisonId: saison.id,
      contenuChiffre: coffre.contenuChiffre,
      vecteur: coffre.vecteur,
      sceau: coffre.sceau,
      versionCle: coffre.versionCle,
      aUnPointDAttention: pointDAttention,
      saitNager: dossier.sante.saitNager ?? null,
    })

    // 7. Les consentements, avec le texte exact signé.
    await tx.insert(tConsentements).values(
      consentementsCatalogue.map((def) => ({
        inscriptionId: inscription!.id,
        type: def.cle,
        accorde: dossier.consentements[def.cle] === true,
        versionTexte: VERSION_CONSENTEMENTS,
        libelleSigne: def.texte,
        donnePar: personneParentId,
        ip,
      })),
    )

    // 8. L'appel de cotisation. Le virement existe toujours, même quand le
    //    paiement en ligne marche : tout le monde n'a pas de carte.
    let communication: string | null = null
    if (montant > 0) {
      communication = communicationStructuree(numeroDossier(annee))
      await tx.insert(paiements).values({
        inscriptionId: inscription!.id,
        montantCentimes: montant,
        moyen: 'virement',
        statut: 'ouvert',
        communication,
      })
    }

    return {
      inscriptionId: inscription!.id,
      animeId: anime!.id,
      montant,
      communication,
      nouveauCompte: !connecte,
    }
  })

  // --- Après coup : la session, et les courriels ---------------------------
  if (resultat.nouveauCompte && compteParentId) {
    await ouvrirSession(event, compteParentId)
    const jeton = await emettreJeton(compteParentId, 'verification')
    await envoyerCourriel({
      a: premier.email,
      sujet: 'Confirmez votre adresse — 16e Fleurus',
      texte: `Bonjour ${premier.prenom},

Votre espace famille est ouvert. Confirmez votre adresse en suivant ce lien :
${urlDuSite()}/connexion/verification?jeton=${jeton}

Vous y retrouverez le dossier de ${dossier.enfant.prenom}, le calendrier de sa section et celui de l'unité.`,
    })
  }

  await envoyerCourriel({
    a: premier.email,
    sujet: `Inscription de ${dossier.enfant.prenom} — bien reçue`,
    texte: `Bonjour ${premier.prenom},

Nous avons bien reçu l'inscription de ${dossier.enfant.prenom} ${dossier.enfant.nom}.

${
  resultat.montant > 0
    ? `Il reste la cotisation : ${(resultat.montant / 100).toFixed(2)} €.
Vous pouvez la payer en ligne depuis votre espace, ou par virement sur le compte de l'unité avec la communication structurée ${resultat.communication}.

L'inscription sera définitive à réception du paiement et après relecture par le staff.`
    : `Le staff relit le dossier et revient vers vous.`
}

Vous pouvez consulter et corriger le dossier à tout moment depuis votre espace :
${urlDuSite()}/mon-espace`,
  })

  await journaliser(event, 'creation', 'inscription', resultat.inscriptionId, dossier.enfant.sectionSlug)

  return {
    ok: true,
    inscriptionId: resultat.inscriptionId,
    montantCentimes: resultat.montant,
    communication: resultat.communication,
  }
})
