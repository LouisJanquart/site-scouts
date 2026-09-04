// Les huit entrées du rail de navigation, dans l'ordre des maquettes Figma.
// Les noms sont ceux du fichier Figma (Louveteaux, Pios) et non ceux du
// classeur de planning (Loups, Horizons) : le mapping se fait ici.
//
// Pourquoi des noms scouts dans une unité guide
// ---------------------------------------------
// La 16e est née de la fusion de deux unités non mixtes. L'ensemble est affilié
// aux GUIDES — il y avait une embrouille avec la fédération scoute au moment de
// la fusion. Mais les sections non mixtes ont été gardées (Lutins et Guides
// d'un côté, Louveteaux et Scouts de l'autre), avec leurs noms et leur lore.
//
// Conséquence pratique : un seul barème de cotisation, celui des Guides, pour
// toutes les sections. Voir shared/cotisations.ts. Ne pas se laisser tromper
// par les noms.
//
// Ce fichier est PUBLIC
// ---------------------
// Il part dans le paquet JavaScript téléchargé par n'importe quel visiteur.
// N'y mettre que ce qui peut être lu par tout le monde : l'identité des
// sections, leurs âges, leur résumé. Les adresses de contact, le planning, le
// staff et les documents vivent dans server/donnees/ et passent par l'API,
// qui vérifie les droits à chaque requête.

export interface Section {
  slug: string
  nom: string
  /** Version courte pour le rail, quand le nom complet déborde. */
  nomCourt?: string
  cleplanning: string | null
  ages: string | null
  genre: 'mixte' | 'filles' | 'garcons' | null
  icone: string
  resume: string
  description: string
  photo: string
  animee: boolean
}

export const sections: Section[] = [
  {
    slug: 'nutons',
    nom: 'Nutons',
    cleplanning: 'nutons',
    ages: '5 à 7 ans',
    genre: 'mixte',
    icone: 'neige',
    resume: 'La première section. On y arrive avant de savoir lire, on en repart en sachant faire un nœud.',
    description:
      "Les Nutons, c'est l'entrée dans l'unité. Des réunions courtes, beaucoup de jeu, des histoires, et la découverte de la vie en groupe. Le camp dure quelques jours seulement, souvent en dur plutôt que sous tente.",
    photo: '/images/foret-sentier.jpg',
    animee: true,
  },
  {
    slug: 'lutins',
    nom: 'Lutins',
    cleplanning: 'lutins',
    ages: '7 à 11 ans',
    genre: 'filles',
    icone: 'eau',
    resume: 'La plus grande section de l’unité, et celle qui ne tient jamais en place.',
    description:
      "Chez les Lutins, on apprend à vivre en sizaine, on part en hike, on construit, on chante. La section a le plus grand staff de l'unité, ce qui permet des grands jeux ambitieux et des réunions spéciales régulières.",
    photo: '/images/foret-clairiere.jpg',
    animee: true,
  },
  {
    slug: 'louveteaux',
    nom: 'Louveteaux',
    cleplanning: 'louveteaux',
    ages: '8 à 11 ans',
    genre: 'garcons',
    icone: 'feuille',
    resume: 'La meute. Akela, les sizaines, et un camp sous tente qui compte comme un premier vrai camp.',
    description:
      "Les Louveteaux fonctionnent en meute, avec des sizaines menées par les plus grands. C'est l'âge où l'on prend ses premières responsabilités, où l'on part en hike sur deux jours et où le camp se fait sous tente.",
    photo: '/images/foret-brume.jpg',
    animee: true,
  },
  {
    slug: 'guides',
    nom: 'Guides',
    cleplanning: 'guides',
    ages: '11 à 16 ans',
    genre: 'filles',
    icone: 'tente',
    resume: 'Compagnies, hikes de plusieurs jours, et un camp qu’on construit soi-même.',
    description:
      "Les Guides vivent en compagnie, réparties en patrouilles autonomes. Le camp d'été dure une dizaine de jours, avec des constructions en bois, un hike de plusieurs jours et une vraie prise en charge de l'intendance par les animées.",
    photo: '/images/camp-prairie.jpg',
    animee: true,
  },
  {
    slug: 'scouts',
    nom: 'Scouts',
    cleplanning: 'scouts',
    ages: '11 à 16 ans',
    genre: 'garcons',
    icone: 'feu',
    resume: 'Patrouilles, constructions, hikes traqueurs. La section qui campe le plus longtemps.',
    description:
      "La troupe est découpée en patrouilles qui vivent leur camp presque en autonomie : leur coin, leurs constructions, leur intendance. Réunion de patrouille, hike traqueur, grande sortie, et un camp d'été qui va au bout des dix jours.",
    photo: '/images/camp-constructions.jpg',
    animee: true,
  },
  {
    slug: 'pios',
    nom: 'Pios',
    cleplanning: 'pios',
    ages: '16 à 18 ans',
    genre: 'mixte',
    icone: 'montagne',
    resume: 'Le moment où l’on passe de l’autre côté : on organise autant qu’on participe.',
    description:
      "Les Pios montent leurs propres projets : le bar de l'unité, des animations pour les plus jeunes, des réunions thunes pour financer un camp qui se construit à plusieurs. C'est la section charnière avant la Route ou l'entrée dans un staff.",
    photo: '/images/foret-lumiere.jpg',
    animee: true,
  },
  {
    slug: 'route',
    nom: 'Route',
    cleplanning: 'route',
    ages: '18 ans et plus',
    genre: 'mixte',
    icone: 'arbre',
    resume: 'Les plus de dix-huit ans. Le bar, la marche Adeps, la cavalcade, la veillée de Noël.',
    description:
      "La Route rassemble les plus de dix-huit ans qui ne sont pas (ou pas seulement) dans un staff. C'est elle qui porte les gros événements de l'unité : le bar, la marche Adeps, la cavalcade, la veillée de Noël, le beer pong. Et qui finance une bonne partie du matériel.",
    photo: '/images/camp-crepuscule.jpg',
    animee: false,
  },
  {
    slug: 'staff',
    nom: "Staff d'U",
    nomCourt: 'Staff',
    cleplanning: null,
    ages: null,
    genre: 'mixte',
    icone: 'lys',
    resume: 'Celles et ceux qui tiennent la baraque : le calendrier, le local, le matériel, les comptes.',
    description:
      "Le staff d'unité coordonne les six sections animées et la Route : le calendrier commun, le local, le matériel, les inscriptions, les relations avec la fédération et les parents. C'est aussi lui qui organise les temps d'unité et les portes ouvertes.",
    photo: '/images/camp-prairie-large.jpg',
    animee: false,
  },
]

export const parSlug = Object.fromEntries(sections.map((s) => [s.slug, s]))

export const sectionsAnimees = sections.filter((s) => s.animee)
