// Les grands rendez-vous de l'unité, extraits de la colonne « Evenement » du
// classeur de planning 2026-2027 et des comptes rendus de réunion route.
// Les descriptions sont à relire par le staff d'unité avant publication.

// « tous » = ouvert au dehors, un visiteur qui découvre l'unité peut venir.
// « parents » et « animes » = ça concerne les familles de l'unité.
// « chefs » = interne au staff.
export type PublicCible = 'tous' | 'parents' | 'animes' | 'chefs'

export interface Evenement {
  slug: string
  titre: string
  date: string
  dateFin?: string
  heure?: string
  lieu: string
  section: string | null
  resume: string
  description: string
  public: PublicCible
  inscription?: boolean
  photo?: string
}

export const evenements: Evenement[] = [
  {
    slug: 'portes-ouvertes-2026',
    titre: 'Portes ouvertes',
    date: '2026-09-06',
    heure: '14:00 – 17:30',
    lieu: 'Local de l’unité, Fleurus',
    section: null,
    resume:
      'La première réunion de la saison, ouverte à tout le monde. On vient voir, on repart inscrit ou pas.',
    description:
      "Le dimanche des portes ouvertes est le seul moment de l'année où l'on peut débarquer sans prévenir. Toutes les sections sont sur place, les chefs répondent aux questions des parents, et les enfants passent l'après-midi avec la section de leur âge. Le staff d'unité tient un CU dans la foulée.",
    public: 'tous',
    inscription: false,
    photo: '/images/camp-prairie.jpg',
  },
  {
    slug: 'passages-2026',
    titre: 'Réunion des passages',
    date: '2026-09-13',
    heure: '14:00 – 17:30',
    lieu: 'À préciser par le staff d’unité',
    section: null,
    resume:
      'Le dimanche où chacun change de section. Réunion d’unité pour tout le monde, bar tenu par la Route.',
    description:
      "Les passages marquent le vrai début de l'année scoute : les plus grands de chaque section montent d'un cran. C'est une réunion d'unité, toutes sections mélangées, avec un bar tenu par la Route pour les parents qui accompagnent.",
    public: 'parents',
    photo: '/images/foret-clairiere.jpg',
  },
  {
    slug: 'souper-dias-2026',
    titre: 'Souper dias',
    date: '2026-10-11',
    lieu: 'Local de l’unité, Fleurus',
    section: null,
    resume:
      'Le souper de rentrée où l’on projette les photos des camps de l’été devant les parents.',
    description:
      "Réunion d'unité toute la journée, puis souper le soir : les sections projettent les photos et les vidéos de leur camp. C'est le premier gros événement de récolte de fonds de l'année, et l'occasion pour les parents de voir à quoi ressemble vraiment un camp.",
    public: 'tous',
    inscription: true,
  },
  {
    slug: 'saint-nicolas-2026',
    titre: 'Réunion Saint-Nicolas',
    date: '2026-12-06',
    heure: '14:00 – 17:00',
    lieu: 'Local de l’unité, Fleurus',
    section: null,
    resume: 'Dernière réunion avant les vacances d’hiver, en réunion spéciale dans plusieurs sections.',
    description:
      "La Saint-Nicolas clôt le premier quadrimestre. Plusieurs sections passent en réunion spéciale, les Pios préparent les bonbons. C'est la dernière réunion avant la coupure de Noël, les réunions reprennent début février.",
    public: 'animes',
  },
  {
    slug: 'veillee-noel-2026',
    titre: 'Veillée de Noël',
    date: '2026-12-20',
    lieu: 'Local de l’unité, Fleurus',
    section: 'route',
    resume: 'La veillée organisée par la Route, toutes sections réunies, en réunion spéciale.',
    description:
      "Chaque année, la Route monte la veillée de Noël pour l'ensemble de l'unité. Réunion spéciale pour toutes les sections, occupation du local en soirée.",
    public: 'parents',
  },
  {
    slug: 'carnaval-2027',
    titre: 'Carnaval',
    date: '2027-02-14',
    lieu: 'Fleurus',
    section: null,
    resume: 'Le carnaval de Fleurus, pendant le congé de détente.',
    description:
      "Le carnaval tombe pendant le congé de détente. Les réunions sont maintenues, et l'unité suit les soumonces des semaines suivantes.",
    public: 'tous',
  },
  {
    slug: 'marche-adeps-2027',
    titre: 'Marche Adeps',
    date: '2027-03-08',
    heure: '07:00 – 19:30',
    lieu: 'Fleurus, départ au local',
    section: 'route',
    resume:
      'Quatre parcours balisés par la Route, de 5 à 20 km. Une des principales rentrées d’argent de l’unité.',
    description:
      "La marche Adeps est organisée par la Route : balisage la veille, tenue du bar et du ravitaillement le jour même. Quatre parcours de 5, 10, 15 et 20 kilomètres, tracés dans la région. Le local est occupé toute la journée, et une réunion de préparation est prévue quelques semaines avant.",
    public: 'tous',
    photo: '/images/foret-sentier.jpg',
  },
  {
    slug: 'cavalcade-2027',
    titre: 'Cavalcade de Pâques',
    date: '2027-04-04',
    lieu: 'Fleurus',
    section: null,
    resume: 'La cavalcade de Fleurus, précédée de trois soumonces en mars.',
    description:
      "La cavalcade est le rendez-vous de la ville, et l'unité y participe chaque année. Les soumonces des 7, 21 mars et du 8 mars la précèdent. Les réunions du dimanche sont adaptées en conséquence.",
    public: 'tous',
  },
  {
    slug: 'temps-unite-2027',
    titre: 'Temps d’unité',
    date: '2027-04-11',
    lieu: 'À préciser',
    section: null,
    resume: 'Toutes les sections en relâche, l’unité se retrouve au complet.',
    description:
      "Le temps d'unité rassemble toutes les sections sur une même journée. Toutes les sections sont en relâche ce dimanche-là : il n'y a pas de réunion classique.",
    public: 'parents',
  },
  {
    slug: 'fun-fest-2027',
    titre: 'Fun Fest',
    date: '2027-05-16',
    lieu: 'Fleurus',
    section: null,
    resume: 'Dernier rendez-vous de la saison, juste après la fin des réunions.',
    description:
      "Le Fun Fest marque la fin des réunions de l'année. Après cette date, l'unité bascule en préparation de camp.",
    public: 'tous',
  },
]

const RANG: Record<PublicCible, number> = { tous: 0, parents: 1, animes: 1, chefs: 2 }

function niveau(role: string): number {
  if (role === 'chef') return 2
  if (role === 'visiteur') return 0
  return 1
}

/** Les événements qu'un rôle a le droit de voir. */
export function evenementsVisibles(role: string): Evenement[] {
  return evenements.filter((e) => RANG[e.public] <= niveau(role))
}

/** L'événement public qui tombe ce jour-là, s'il y en a un. */
export function evenementPublicDuJour(date: string): Evenement | null {
  return evenements.find((e) => e.date === date && e.public === 'tous') ?? null
}
