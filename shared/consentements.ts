// ---------------------------------------------------------------------------
// Le catalogue des autorisations demandées à l'inscription.
//
// Chaque case cochée sera rangée en base AVEC son libellé exact et le numéro de
// version de ce fichier. Si le texte change l'an prochain, ce qui a été signé
// cette année reste lisible tel qu'il a été signé. C'est la seule façon de
// prouver un consentement, et le RGPD le demande explicitement.
//
// Règle de rédaction : une case = une finalité, en français ordinaire. Pas de
// case pré-cochée, pas de bloc « j'accepte tout ». Un consentement groupé n'est
// pas un consentement libre.
// ---------------------------------------------------------------------------

export const VERSION_CONSENTEMENTS = '2026-09'

export type GroupeConsentement = 'participation' | 'sante' | 'image' | 'donnees'

export interface DefinitionConsentement {
  cle: string
  groupe: GroupeConsentement
  titre: string
  texte: string
  /** Une inscription ne peut pas être déposée sans cette case. */
  obligatoire: boolean
  /** Ce que ça change concrètement si la case reste décochée. */
  siRefus?: string
}

export const consentementsCatalogue: DefinitionConsentement[] = [
  {
    cle: 'reglement',
    groupe: 'participation',
    titre: 'Règlement de l’unité',
    texte:
      'J’ai lu le règlement d’ordre intérieur de la 16e Fleurus et je m’engage, avec mon enfant, à le respecter.',
    obligatoire: true,
  },
  {
    cle: 'participation',
    groupe: 'participation',
    titre: 'Participation aux activités',
    texte:
      'J’autorise mon enfant à participer aux réunions, hikes, week-ends et camps organisés par l’unité, y compris aux déplacements et aux activités extérieures qui s’y rattachent.',
    obligatoire: true,
  },
  {
    cle: 'soins-medicaux',
    groupe: 'sante',
    titre: 'Soins médicaux urgents',
    texte:
      'J’autorise le staff à faire pratiquer sur mon enfant les soins médicaux urgents que son état exigerait, y compris une intervention chirurgicale, si je ne peux pas être joint à temps.',
    obligatoire: true,
  },
  {
    cle: 'medicaments-courants',
    groupe: 'sante',
    titre: 'Médicaments courants',
    texte:
      'J’autorise le staff à administrer à mon enfant, en cas de besoin, du paracétamol aux doses prévues pour son âge et son poids.',
    obligatoire: false,
    siRefus: 'Le staff vous appellera avant de donner quoi que ce soit.',
  },
  {
    cle: 'transport-vehicule',
    groupe: 'participation',
    titre: 'Transport en voiture',
    texte:
      'J’autorise mon enfant à être transporté dans le véhicule privé d’un membre du staff ou d’un parent, dans le cadre des activités de l’unité.',
    obligatoire: false,
    siRefus: 'Vous serez prévenu à chaque fois qu’un déplacement en voiture est prévu.',
  },
  {
    cle: 'rentrer-seul',
    groupe: 'participation',
    titre: 'Retour seul après la réunion',
    texte:
      'J’autorise mon enfant à quitter seul le lieu de réunion à l’heure de fin annoncée.',
    obligatoire: false,
    siRefus: 'Votre enfant ne sera confié qu’à un adulte que vous aurez désigné.',
  },

  // --- Droit à l'image : une case par usage, jamais une seule pour tout. ----
  {
    cle: 'image-interne',
    groupe: 'image',
    titre: 'Photos dans les supports de l’unité',
    texte:
      'J’autorise l’unité à photographier ou filmer mon enfant pendant les activités, et à utiliser ces images dans ses supports internes : montage de fin d’année, album de camp, panneaux affichés au local.',
    obligatoire: false,
    siRefus: 'Aucune image de votre enfant ne sera utilisée, même en interne.',
  },
  {
    cle: 'image-site',
    groupe: 'image',
    titre: 'Photos sur le site de l’unité',
    texte:
      'J’autorise la publication de photos où mon enfant apparaît sur le site internet de l’unité, dans la partie réservée aux familles.',
    obligatoire: false,
  },
  {
    cle: 'image-reseaux',
    groupe: 'image',
    titre: 'Photos sur les réseaux sociaux',
    texte:
      'J’autorise la publication de photos où mon enfant apparaît sur les comptes publics de l’unité (Facebook, Instagram).',
    obligatoire: false,
    siRefus:
      'Rien ne sera publié publiquement. C’est le refus le plus fréquent, et il ne pose aucun problème.',
  },
  {
    cle: 'image-presse',
    groupe: 'image',
    titre: 'Photos dans la presse et les affiches',
    texte:
      'J’autorise l’utilisation de photos où mon enfant apparaît dans la presse locale, sur les affiches et les tracts annonçant les activités de l’unité.',
    obligatoire: false,
  },

  // --- Données --------------------------------------------------------------
  {
    cle: 'donnees-federation',
    groupe: 'donnees',
    titre: 'Transmission à la fédération',
    texte:
      'J’ai compris que le nom, le prénom, la date de naissance et l’adresse de mon enfant sont transmis à la fédération scoute à laquelle l’unité est affiliée, pour l’assurance et l’affiliation. C’est une condition de l’inscription.',
    obligatoire: true,
  },
  {
    cle: 'communications',
    groupe: 'donnees',
    titre: 'Courriels de l’unité',
    texte:
      'J’accepte de recevoir par courriel les informations pratiques de l’unité : convocations, changements d’horaire, préparation des camps.',
    obligatoire: false,
    siRefus:
      'Nous vous joindrons par téléphone. Les messages urgents vous seront envoyés quoi qu’il arrive : ils relèvent de la sécurité, pas de la communication.',
  },
]

export const consentementsObligatoires = consentementsCatalogue
  .filter((c) => c.obligatoire)
  .map((c) => c.cle)

export function consentementParCle(cle: string) {
  return consentementsCatalogue.find((c) => c.cle === cle)
}
