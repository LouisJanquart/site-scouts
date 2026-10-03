// Brouillons d'actualités. Le contenu est rédigé à partir des comptes rendus
// de réunion route et du planning : il tient debout, mais il doit être relu et
// validé par le staff avant toute publication réelle.

export interface Actu {
  slug: string
  titre: string
  date: string
  sections: string[]
  chapo: string
  corps: string[]
  public: 'tous' | 'parents' | 'animes' | 'chefs'
  /** Importé du fichier et pas encore relu par un staff. */
  aRelire?: boolean
}

export const actus: Actu[] = [
  {
    slug: 'rentree-2026',
    titre: 'La saison 2026-2027 commence le 5 septembre',
    date: '2026-09-02',
    sections: ['nutons', 'lutins', 'louveteaux', 'guides', 'scouts', 'horizons', 'route'],
    chapo:
      'Portes ouvertes le samedi 5 septembre de 14h à 17h30, puis réunion des passages la semaine suivante.',
    corps: [
      "Le calendrier de l'année est bouclé. Il démarre par les portes ouvertes du 5 septembre, ouvertes à tout le monde et sans inscription préalable : c'est le moment pour venir voir à quoi ressemble une réunion avant de s'engager.",
      "Le samedi suivant, 12 septembre, aura lieu la réunion des passages. Toutes les sections sont concernées, et la Route tient le bar pour les parents qui restent.",
      "Jusqu'à la mi-octobre, les réunions se tiennent à l'horaire d'été, de 14h à 17h30. À partir du 25 octobre, on passe à l'horaire d'hiver, de 14h à 17h.",
    ],
    public: 'tous',
  },
  {
    slug: 'horaires-ete-hiver',
    titre: 'Deux horaires dans l’année, et une bascule fin octobre',
    date: '2026-08-30',
    sections: [],
    chapo:
      'Horaire d’été de 14h à 17h30 jusqu’au 18 octobre, horaire d’hiver de 14h à 17h à partir du 25.',
    corps: [
      "L'unité fonctionne avec deux horaires. En été, les réunions se terminent à 17h30. En hiver, à 17h, parce que la nuit tombe plus tôt et que la plupart des activités se font dehors.",
      "La bascule se fait au changement d'heure, le week-end du 25 octobre. On repasse à l'horaire d'été le 7 mars.",
      "Attention : ces horaires valent pour une réunion normale. Les hikes, grandes sorties et réunions spéciales ont leurs propres horaires, communiqués par chaque section.",
    ],
    public: 'parents',
  },
  {
    slug: 'souper-dias-appel',
    titre: 'Souper dias le 10 octobre : on cherche des bras',
    date: '2026-08-28',
    sections: ['route'],
    chapo:
      'Réunion d’unité la journée, souper et projection le soir. La préparation commence deux semaines avant.',
    corps: [
      "Le souper dias est le premier gros événement de l'année. Les sections y projettent les photos de leur camp, et c'est une rentrée d'argent qui compte pour le matériel.",
      "Les Horizons sont sur la préparation, mais il faut du monde en cuisine, au bar et au rangement. Un tour de rôle sera proposé à la prochaine réunion route.",
    ],
    public: 'chefs',
  },
  {
    slug: 'cotisations-2026-2027',
    titre: 'Les cotisations de la saison, et ce qu’elles couvrent',
    date: '2026-09-05',
    sections: [],
    chapo:
      '57,50 € pour un enfant seul, 46 € par enfant à deux, 39 € à partir de trois. Le tarif social existe et il se demande.',
    corps: [
      "La cotisation est celle de la fédération : elle couvre l'assurance de l'année, l'affiliation et l'accès aux formations. Elle ne couvre pas les camps, qui se paient séparément.",
      "Le montant baisse dès qu'il y a plusieurs enfants d'une même famille inscrits — y compris dans une autre unité affiliée, auquel cas il faut le signaler au staff, le site ne peut pas le deviner.",
      "Un tarif social à 5 € existe. Il ne se coche pas dans un formulaire : il s'accorde après une conversation avec le staff d'unité, et personne d'autre n'en est informé. Aucun enfant n'est refusé pour une question d'argent.",
    ],
    public: 'tous',
  },
  {
    slug: 'nouveau-site',
    titre: 'L’unité a un site, et voici ce qu’on peut y faire',
    date: '2026-09-04',
    sections: [],
    chapo:
      'Inscriptions en ligne, calendriers par section, fiches santé et suivi des cotisations. Tout n’est pas encore ouvert.',
    corps: [
      "Le site remplace les fichiers qui circulaient par courriel. Les inscriptions se font en ligne, la fiche santé se remplit une fois par an, et chaque famille voit où en sont ses cotisations.",
      "Une partie du contenu est réservée : le calendrier détaillé de chaque section, les contacts des staffs et les photos ne sont visibles qu'avec un compte. Un visiteur voit les horaires et les événements ouverts à tous, et rien d'autre.",
      "Le compte se crée tout seul au moment de la première inscription. Un parent voit ses enfants, un animé voit sa section.",
    ],
    public: 'tous',
  },
  {
    slug: 'appel-calendriers-2026',
    titre: 'Vente des calendriers : il manque des accompagnants',
    date: '2026-10-20',
    sections: ['nutons', 'lutins', 'louveteaux', 'guides', 'scouts'],
    chapo: 'Le 8 novembre, chaque équipe a besoin d’un adulte. Il en manque quatre.',
    corps: [
      "Le porte-à-porte se fait par équipes de six ou sept animés, chacune accompagnée d'un chef et, idéalement, d'un parent. Sans accompagnant, l'équipe ne part pas.",
      "Ça prend un après-midi, il n'y a rien à préparer, et c'est de loin la meilleure façon de comprendre comment fonctionne l'unité de l'intérieur.",
    ],
    public: 'parents',
  },
  {
    slug: 'retour-hike-guides-2026',
    titre: 'Vingt-deux kilomètres et zéro ampoule chez les Guides',
    date: '2026-10-06',
    sections: ['guides'],
    chapo: 'Le hike d’octobre s’est fait sous un temps improbable pour la saison.',
    corps: [
      "Deux jours secs, ce qui n'était pas arrivé depuis trois ans sur ce hike. Les patrouilles ont bouclé les vingt-deux kilomètres annoncés, plus deux de rab à cause d'un chemin barré.",
      "Le bivouac s'est monté en vingt minutes, ce qui est un record pour un début d'année. La cuisine a été moins rapide, mais tout le monde a mangé chaud.",
    ],
    public: 'parents',
  },
  {
    slug: 'fiches-sante-rappel',
    titre: 'Fiche santé : à remplir avant le premier découchage',
    date: '2026-11-02',
    sections: [],
    chapo: 'Sans fiche santé à jour, un animé ne peut pas partir en week-end ni en camp.',
    corps: [
      "La fiche se remplit depuis l'espace des familles. Elle demande les allergies, les traitements en cours, les régimes alimentaires et si l'enfant sait nager.",
      "Elle est chiffrée dans la base et n'est lisible que par les chefs de la section concernée et le staff d'unité. Elle est effacée automatiquement un an après la fin de la saison.",
      "Un animé peut voir sa propre fiche mais pas la modifier : c'est un responsable qui la remplit.",
    ],
    public: 'parents',
  },
  {
    slug: 'record-noeuds-2026',
    titre: 'Record battu : la tour des Scouts tient à 4,20 m',
    date: '2026-11-23',
    sections: ['scouts', 'guides'],
    chapo: 'Trois heures de brêlage, une tour qui tient, et une patrouille qui monte dessus.',
    corps: [
      "Le défi lancé en début d'année était de dépasser les 3,80 m de l'an dernier. La patrouille des Faucons a monté 4,20 m avec quinze perches et beaucoup de ficelle.",
      "La tour a tenu le temps du goûter, puis a été démontée dans les règles. Les Guides ont annoncé qu'elles feraient mieux au camp.",
    ],
    public: 'tous',
  },
  {
    slug: 'materiel-perdu-2026',
    titre: 'Le bac des objets perdus déborde',
    date: '2026-12-01',
    sections: [],
    chapo: 'Onze gourdes, quatre polaires, deux paires de bottes et un doudou.',
    corps: [
      "Le bac est au fond du local, à droite en entrant. Tout ce qui n'est pas récupéré avant les vacances de Noël part à la donnerie de Fleurus.",
      "Le doudou, lui, est mis de côté indéfiniment. On sait ce que c'est.",
      "Marquer le nom sur les affaires règle 90 % du problème.",
    ],
    public: 'parents',
  },
  {
    slug: 'nutons-halloween-2026',
    titre: 'Vingt-trois monstres et un chef déguisé en frigo',
    date: '2026-10-26',
    sections: ['nutons'],
    chapo: 'La réunion déguisée des Nutons a tenu toutes ses promesses.',
    corps: [
      "Le grand jeu tournait autour de monstres qui avaient perdu leur cri. Il a fallu leur en retrouver un, ce qui a produit une demi-heure de hurlements que les voisins ont sûrement appréciée.",
      "Le meilleur déguisement était celui d'un chef, en frigo, qui n'a pas pu s'asseoir de l'après-midi.",
    ],
    public: 'tous',
  },
  {
    slug: 'we-louveteaux-retour-2027',
    titre: 'Premier découchage : tout le monde est rentré',
    date: '2027-01-25',
    sections: ['louveteaux'],
    chapo: 'Vingt-huit Louveteaux, deux nuits, aucun retour anticipé.',
    corps: [
      "Le week-end de janvier est souvent le premier découchage. Cette année, personne n'a demandé à rentrer, ce qui n'arrive pas tous les ans.",
      "La veillée du samedi a duré un peu plus longtemps que prévu et le réveil du dimanche a été laborieux. C'est le prix à payer.",
      "Merci aux parents qui ont assuré les trajets : sans eux le gîte n'est pas atteignable.",
    ],
    public: 'parents',
  },
  {
    slug: 'brevets-2027',
    titre: 'Trois chefs partent en formation cette année',
    date: '2027-02-10',
    sections: [],
    chapo: 'Les brevets d’animation sont pris en charge par l’unité.',
    corps: [
      "La fédération demande un nombre minimum de chefs brevetés par section en camp. Trois personnes du staff partent cette année en formation d'animateur, et une en formation de coordinateur.",
      "Les frais sont couverts par l'unité. Un animé breveté bénéficie d'une réduction de 5 € sur sa cotisation : c'est peu, mais c'est la règle de la fédération.",
    ],
    public: 'parents',
  },
  {
    slug: 'spaghetti-bilan-2027',
    titre: 'Souper spaghetti : 214 assiettes servies',
    date: '2027-03-23',
    sections: [],
    chapo: 'La meilleure soirée depuis quatre ans, et la cuisine a tenu.',
    corps: [
      "214 assiettes, contre 180 l'an dernier. La version végétarienne a représenté un tiers des commandes, ce qui change des années précédentes et sera pris en compte pour la prochaine fois.",
      "La recette part intégralement dans le matériel de camp : deux tentes à remplacer et une remorque à remettre en état.",
      "Merci aux Horizons pour le service, qui n'ont pas cassé une assiette.",
    ],
    public: 'tous',
  },
  {
    slug: 'inscriptions-camps-2027',
    titre: 'Inscriptions de camp ouvertes jusqu’au 31 mai',
    date: '2027-04-18',
    sections: ['nutons', 'lutins', 'louveteaux', 'guides', 'scouts', 'horizons'],
    chapo: 'Un formulaire par enfant, un acompte, et la fiche santé à jour.',
    corps: [
      "Les inscriptions se font depuis l'espace des familles. Chaque camp a son prix, indiqué au moment de l'inscription, avec un acompte à verser dans les quinze jours.",
      "Comme pour la cotisation, un aménagement est possible : le camp ne doit empêcher personne de partir. Il suffit d'en parler au staff d'unité, et ça reste entre vous et lui.",
      "Après le 31 mai, l'inscription reste possible mais l'intendance est déjà commandée : ça devient compliqué.",
    ],
    public: 'parents',
  },
  {
    slug: 'terrain-camp-2027',
    titre: 'Le terrain de camp est réservé',
    date: '2027-03-02',
    sections: ['louveteaux', 'guides', 'scouts'],
    chapo: 'Bastogne, comme l’an dernier, mais sur la prairie du haut.',
    corps: [
      "La convention est signée avec le propriétaire. Même ferme, mais cette fois sur la prairie du haut, mieux drainée — l'épisode de boue de l'an dernier a laissé des souvenirs.",
      "Point d'eau à cent mètres, bois mort autorisé pour les constructions, et la commune a confirmé l'accès pompiers.",
    ],
    public: 'chefs',
  },
  {
    slug: 'droit-image-2027',
    titre: 'Photos : ce qu’on publie, et comment refuser',
    date: '2027-05-04',
    sections: [],
    chapo: 'Aucune photo d’un animé n’est publiée sans autorisation, et l’autorisation se retire.',
    corps: [
      "L'autorisation à l'image se donne au moment de l'inscription, séparément du reste. Elle distingue les photos de groupe, les gros plans et la diffusion en dehors du site.",
      "Elle se retire à tout moment depuis l'espace des familles, sans avoir à se justifier. La photo est alors retirée du site.",
      "Les photos de camp publiées sur le site sont réservées aux familles de l'unité : elles ne sont pas visibles depuis l'extérieur et ne sont pas indexées par les moteurs de recherche.",
    ],
    public: 'tous',
  },
  {
    slug: 'passages-2027-annonce',
    titre: 'Qui passe où le 29 mai',
    date: '2027-05-18',
    sections: ['nutons', 'lutins', 'louveteaux', 'guides', 'scouts', 'horizons'],
    chapo: 'Les listes de passage sont affichées au local et envoyées par courriel.',
    corps: [
      "Le passage se fait sur l'âge, mais pas seulement : le staff regarde aussi où en est chacun. Un enfant peut rester une année de plus dans sa section si c'est mieux pour lui, et ça se discute avec les parents avant, jamais le jour même.",
      "La cérémonie a lieu à 15h, les parents sont attendus. Chaque animé qui passe reçoit le foulard de sa nouvelle section.",
    ],
    public: 'parents',
  },
  {
    slug: 'route-projet-2027',
    titre: 'La Route part construire une école au Sénégal',
    date: '2027-02-22',
    sections: ['route'],
    chapo: 'Trois semaines en août, et un an de préparation qui commence maintenant.',
    corps: [
      "Le projet est monté avec une association locale déjà installée sur place, ce qui évite le tourisme humanitaire. La Route participe à un chantier déjà lancé, elle ne débarque pas avec ses idées.",
      "Le financement passe par les actions de l'année : souper, calendriers, et un dossier déposé auprès de la fédération.",
      "Les personnes qui veulent aider sur la préparation logistique sont les bienvenues, il y a du travail administratif.",
    ],
    public: 'tous',
  },
  {
    slug: 'local-travaux-2027',
    titre: 'Le local ferme deux semaines en avril',
    date: '2027-03-15',
    sections: [],
    chapo: 'Réfection du sol de la grande salle. Les réunions se font dehors.',
    corps: [
      "Le sol de la grande salle est refait du 12 au 25 avril. Le local reste inaccessible pendant toute la durée du chantier, y compris pour prendre du matériel.",
      "Les réunions des deux samedis concernés se tiennent au bois de Soleilmont, rendez-vous directement sur place. En cas de gros temps, l'annulation est décidée la veille au soir et annoncée sur le site.",
    ],
    public: 'parents',
  },
  {
    slug: 'nouvelle-remorque-2027',
    titre: 'Une remorque de plus pour les camps',
    date: '2027-06-02',
    sections: [],
    chapo: 'Achetée d’occasion avec la recette du souper spaghetti.',
    corps: [
      "L'unité passe de deux à trois remorques, ce qui permet de ne plus faire deux voyages pour la Troupe et la Compagnie qui campent aux mêmes dates.",
      "Elle a besoin d'un contrôle technique et d'un jeu de feux neufs avant juillet. Toute personne qui s'y connaît un peu est la bienvenue.",
    ],
    public: 'chefs',
  },
]

// Depuis le 02/10/2026, les actus vivent en base : ce fichier n'a servi qu'à
// la remplir (scripts/importer-publications.ts). La règle de visibilité, elle,
// reste ici et s'applique à la liste qu'on lui donne.
export function actusVisibles(role: string, liste: Actu[] = actus): Actu[] {
  const ordre: Record<string, number> = { tous: 0, parents: 1, animes: 1, chefs: 2 }
  const niveau = role === 'chef' ? 2 : role === 'visiteur' ? 0 : 1
  return liste
    .filter((a) => ordre[a.public] <= niveau)
    .sort((a, b) => b.date.localeCompare(a.date))
}
