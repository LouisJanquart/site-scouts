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
    date: '2026-09-05',
    heure: '14:00 – 17:30',
    lieu: 'Local de l’unité, Fleurus',
    section: null,
    resume:
      'La première réunion de la saison, ouverte à tout le monde. On vient voir, on repart inscrit ou pas.',
    description:
      "Le samedi des portes ouvertes est le seul moment de l'année où l'on peut débarquer sans prévenir. Toutes les sections sont sur place, les chefs répondent aux questions des parents, et les enfants passent l'après-midi avec la section de leur âge. Le staff d'unité tient un CU dans la foulée.",
    public: 'tous',
    inscription: false,
    photo: '/images/camp-prairie.jpg',
  },
  {
    slug: 'passages-2026',
    titre: 'Réunion des passages',
    date: '2026-09-12',
    heure: '14:00 – 17:30',
    lieu: 'À préciser par le staff d’unité',
    section: null,
    resume:
      'Le jour où chacun change de section. Réunion d’unité pour tout le monde, bar tenu par la Route.',
    description:
      "Les passages marquent le vrai début de l'année scoute : les plus grands de chaque section montent d'un cran. C'est une réunion d'unité, toutes sections mélangées, avec un bar tenu par la Route pour les parents qui accompagnent.",
    public: 'parents',
    photo: '/images/foret-clairiere.jpg',
  },
  {
    slug: 'souper-dias-2026',
    titre: 'Souper dias',
    date: '2026-10-10',
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
    date: '2026-12-05',
    heure: '14:00 – 17:00',
    lieu: 'Local de l’unité, Fleurus',
    section: null,
    resume: 'Dernière réunion avant les vacances d’hiver, en réunion spéciale dans plusieurs sections.',
    description:
      "La Saint-Nicolas clôt le premier quadrimestre. Plusieurs sections passent en réunion spéciale, les Horizons préparent les bonbons. C'est la dernière réunion avant la coupure de Noël, les réunions reprennent début février.",
    public: 'animes',
  },
  {
    slug: 'veillee-noel-2026',
    titre: 'Veillée de Noël',
    date: '2026-12-19',
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
    date: '2027-02-13',
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
    date: '2027-03-07',
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
    date: '2027-04-03',
    lieu: 'Fleurus',
    section: null,
    resume: 'La cavalcade de Fleurus, précédée de trois soumonces en mars.',
    description:
      "La cavalcade est le rendez-vous de la ville, et l'unité y participe chaque année. Les soumonces des 7, 21 mars et du 8 mars la précèdent. Les réunions du samedi sont adaptées en conséquence.",
    public: 'tous',
  },
  {
    slug: 'temps-unite-2027',
    titre: 'Temps d’unité',
    date: '2027-04-10',
    lieu: 'À préciser',
    section: null,
    resume: 'Toutes les sections en relâche, l’unité se retrouve au complet.',
    description:
      "Le temps d'unité rassemble toutes les sections sur une même journée. Toutes les sections sont en relâche ce samedi-là : il n'y a pas de réunion classique.",
    public: 'parents',
  },
  {
    slug: 'fun-fest-2027',
    titre: 'Fun Fest',
    date: '2027-05-15',
    lieu: 'Fleurus',
    section: null,
    resume: 'Dernier rendez-vous de la saison, juste après la fin des réunions.',
    description:
      "Le Fun Fest marque la fin des réunions de l'année. Après cette date, l'unité bascule en préparation de camp.",
    public: 'tous',
  },
  // ------------------------------------------------------------------------
  // Les rendez-vous de section et les temps forts intermédiaires. Comme le
  // reste de ce fichier : rédigé à partir du classeur et des comptes rendus,
  // à relire par le staff avant publication. Aucun nom de chef n'y figure.
  // ------------------------------------------------------------------------
  {
    slug: 'hike-guides-2026',
    titre: 'Hike des Guides',
    date: '2026-10-03',
    dateFin: '2026-10-04',
    heure: 'Départ samedi 9h00',
    lieu: 'Hautes Fagnes, départ du local',
    section: 'guides',
    resume: 'Deux jours de marche et une nuit sous tente pour la Compagnie.',
    description:
      "Le premier hike de l'année pour les Guides. Vingt kilomètres le samedi, bivouac, et retour par un autre itinéraire le dimanche. Chaque patrouille porte son matériel de cuisine et prépare ses repas. La liste de matériel part par courriel deux semaines avant ; les chaussures de marche déjà faites sont indispensables.",
    public: 'parents',
    inscription: true,
  },
  {
    slug: 'week-end-staff-2026',
    titre: 'Week-end de staff d’unité',
    date: '2026-10-17',
    dateFin: '2026-10-18',
    lieu: 'Gîte à Han-sur-Lesse',
    section: null,
    resume: 'Le staff se pose deux jours pour caler l’année.',
    description:
      "Deux jours pour relire le calendrier, répartir les charges de l'année, préparer les dossiers de camp et faire le point sur le matériel. Les sections ne se réunissent pas ce week-end-là.",
    public: 'chefs',
  },
  {
    slug: 'reunion-nutons-halloween-2026',
    titre: 'Réunion déguisée des Nutons',
    date: '2026-10-24',
    heure: '14:00 – 17:00',
    lieu: 'Local de l’unité, Fleurus',
    section: 'nutons',
    resume: 'Première réunion à l’horaire d’hiver, et tout le monde est déguisé.',
    description:
      "Grand jeu sur le thème des monstres pas si méchants, goûter, et un petit spectacle préparé par les chefs. Les Nutons viennent déguisés ; les déguisements qui grattent ou qui gênent pour courir sont déconseillés. Fin à 17h00, c'est le passage à l'horaire d'hiver.",
    public: 'tous',
  },
  {
    slug: 'operation-calendriers-2026',
    titre: 'Vente des calendriers',
    date: '2026-11-07',
    heure: '13:30 – 17:30',
    lieu: 'Rues de Fleurus, départ du local',
    section: null,
    resume: 'L’action financière de l’automne : porte-à-porte par équipes, toutes sections mêlées.',
    description:
      "Chaque équipe part avec un chef et un secteur. Les calendriers de l'unité se vendent 5 €, et la recette finance le matériel de camp et le tarif social. Les animés rentrent au local pour 17h30 ; les parents qui veulent accompagner une équipe sont les bienvenus, il en manque toujours.",
    public: 'parents',
    inscription: true,
  },
  {
    slug: 'jeu-de-nuit-scouts-2026',
    titre: 'Jeu de nuit des Scouts',
    date: '2026-11-21',
    heure: '18:00 – 23:00',
    lieu: 'Bois de Soleilmont',
    section: 'scouts',
    resume: 'Cinq heures dans le bois, à la lampe frontale.',
    description:
      "Un grand jeu de nuit en patrouilles, dans le bois de Soleilmont. Rendez-vous au local à 18h avec une lampe frontale qui marche, des vêtements chauds et de quoi se salir. Souper sur place, retour au local à 23h. Les parents récupèrent leur scout au local, pas dans le bois.",
    public: 'parents',
    inscription: true,
  },
  {
    slug: 'marche-parrainage-lutins-2026',
    titre: 'Marche de parrainage des Lutins',
    date: '2026-11-28',
    heure: '14:00 – 17:00',
    lieu: 'Départ du local, boucle de 6 km',
    section: 'lutins',
    resume: 'Chaque lutine fait parrainer ses kilomètres au profit du camp.',
    description:
      "Une boucle de 6 km, à faire en entier ou en partie, avec un carnet de parrainage rempli à l'avance. L'argent récolté va dans la caisse de la section pour alléger le prix du camp. Goûter à l'arrivée, et le carnet du plus gros marcheur est affiché au local.",
    public: 'tous',
  },
  {
    slug: 'bourse-aux-jouets-2026',
    titre: 'Bourse aux jouets',
    date: '2026-12-13',
    heure: '10:00 – 16:00',
    lieu: 'Salle paroissiale, Fleurus',
    section: null,
    resume: 'On vide les greniers, l’unité tient le bar et la petite restauration.',
    description:
      "Les emplacements se réservent à l'avance auprès du staff d'unité. L'unité ne prend pas de commission sur les ventes : elle tient le bar, les crêpes et la soupe, et c'est là qu'est la recette. Un coup de main d'une heure ou deux fait une vraie différence.",
    public: 'tous',
    inscription: true,
  },
  {
    slug: 'reunion-passages-blanche-2027',
    titre: 'Réunion « page blanche »',
    date: '2027-01-09',
    heure: '14:00 – 17:00',
    lieu: 'Local de l’unité, Fleurus',
    section: null,
    resume: 'La première réunion de l’année, et ce sont les animés qui décident du programme.',
    description:
      "Une fois par an, le programme n'est pas écrit par les chefs. Chaque section arrive avec ses envies, on discute, on tranche, et ce qui sort de là entre vraiment dans le calendrier du second semestre. C'est aussi le moment où remontent les choses qui ne vont pas.",
    public: 'animes',
  },
  {
    slug: 'we-louveteaux-2027',
    titre: 'Week-end de la Meute',
    date: '2027-01-23',
    dateFin: '2027-01-24',
    lieu: 'Gîte à Gerpinnes',
    section: 'louveteaux',
    resume: 'Un week-end en dur, premier découchage de l’année pour les Louveteaux.',
    description:
      "Deux jours en gîte, avec veillée, grand jeu et cuisine faite par les sizaines. Pour beaucoup c'est le premier découchage sans les parents : le staff prévoit le coup et il n'y a jamais eu de retour anticipé. Fiche santé à jour obligatoire.",
    public: 'parents',
    inscription: true,
  },
  {
    slug: 'formation-secourisme-2027',
    titre: 'Formation premiers secours',
    date: '2027-02-06',
    heure: '09:00 – 17:00',
    lieu: 'Croix-Rouge, Charleroi',
    section: null,
    resume: 'Journée de brevet pour les chefs et les Horizons volontaires.',
    description:
      "Formation d'une journée, prise en charge par l'unité. Elle est exigée pour au moins un chef par section en camp, et les Horizons qui la suivent repartent avec un brevet valable en dehors du scoutisme. Inscription obligatoire, les places sont limitées à douze.",
    public: 'chefs',
    inscription: true,
  },
  {
    slug: 'souper-spaghetti-2027',
    titre: 'Souper spaghetti',
    date: '2027-03-20',
    heure: '18:00 – 22:00',
    lieu: 'Salle paroissiale, Fleurus',
    section: null,
    resume: 'Le gros rendez-vous financier du printemps.',
    description:
      "Bolognaise ou végétarienne, dessert compris. Les Horizons servent en salle, la Route tient le bar, les Scouts et les Guides font la plonge. Les réservations se prennent à l'avance ; sans réservation on peut venir, mais il n'y a pas de garantie d'assiette après 20h.",
    public: 'tous',
    inscription: true,
  },
  {
    slug: 'hike-horizons-2027',
    titre: 'Hike de printemps des Horizons',
    date: '2027-04-24',
    dateFin: '2027-04-25',
    heure: 'Départ samedi 8h00',
    lieu: 'Vallée de l’Ourthe',
    section: 'horizons',
    resume: 'Deux jours en autonomie complète, itinéraire choisi par les Horizons eux-mêmes.',
    description:
      "Les Horizons préparent l'itinéraire, le budget et les repas ; les chefs suivent à distance et ne sont là qu'en cas de pépin. C'est la répétition générale du camp, où l'autonomie est la règle. Départ 8h du local, retour dimanche en fin d'après-midi.",
    public: 'parents',
    inscription: true,
  },
  {
    slug: 'journee-passages-2027',
    titre: 'Journée des passages',
    date: '2027-05-29',
    heure: '10:00 – 17:00',
    lieu: 'Local de l’unité, Fleurus',
    section: null,
    resume: 'Le passage d’une section à l’autre, et la remise des foulards.',
    description:
      "La journée où les plus grands de chaque section passent dans la suivante. Épreuves préparées par les chefs, remise des foulards devant tout le monde, et barbecue à midi. Les parents sont attendus à partir de 15h pour la cérémonie.",
    public: 'tous',
  },
  {
    slug: 'reunion-parents-camp-2027',
    titre: 'Réunion parents avant les camps',
    date: '2027-06-12',
    heure: '10:30 – 12:00',
    lieu: 'Local de l’unité, Fleurus',
    section: null,
    resume: 'Tout ce qu’il faut savoir avant de déposer son enfant au car.',
    description:
      "Une réunion par section, en parallèle. Lieu du camp, trajet, liste de matériel, jour des visites, contacts d'urgence, fiches santé, et le point sur les cotisations. C'est aussi le moment de signaler ce qui doit l'être en privé à un chef.",
    public: 'parents',
  },
  {
    slug: 'camp-nutons-2027',
    titre: 'Camp des Nutons',
    date: '2027-07-16',
    dateFin: '2027-07-19',
    lieu: 'Ferme pédagogique, Sivry-Rance',
    section: 'nutons',
    resume: 'Quatre jours en dur, le premier camp de la vie scoute.',
    description:
      "Quatre jours seulement, et en dur : pour des enfants de 5 à 7 ans, c'est déjà beaucoup. Journée des parents le samedi après-midi. Les doudous sont autorisés et personne ne se moque.",
    public: 'parents',
    inscription: true,
    photo: '/images/foret-clairiere.jpg',
  },
  {
    slug: 'camp-louveteaux-2027',
    titre: 'Camp de la Meute',
    date: '2027-07-16',
    dateFin: '2027-07-26',
    lieu: 'Bastogne',
    section: 'louveteaux',
    resume: 'Dix jours sous tente, avec les constructions et la journée des parents.',
    description:
      "Dix jours de camp avec un thème tenu du premier au dernier jour. Le car part du local le 16 au matin. Journée des parents le dimanche 22, à partir de 11h : c'est le seul jour de visite, et il vaut mieux prévenir si on ne peut pas venir.",
    public: 'parents',
    inscription: true,
    photo: '/images/camp-constructions.jpg',
  },
  {
    slug: 'camp-scouts-2027',
    titre: 'Camp de la Troupe',
    date: '2027-07-15',
    dateFin: '2027-07-30',
    lieu: 'Bastogne',
    section: 'scouts',
    resume: 'Quinze jours, constructions en bois et hike de trois jours au milieu.',
    description:
      "Le camp le plus long de l'unité. Chaque patrouille monte son coin, sa table et sa tour, et part trois jours en hike au milieu du camp. Journée des parents le dimanche 26. Le matériel de patrouille est vérifié au local la semaine d'avant.",
    public: 'parents',
    inscription: true,
    photo: '/images/camp-prairie.jpg',
  },
  {
    slug: 'camp-guides-2027',
    titre: 'Camp de la Compagnie',
    date: '2027-07-15',
    dateFin: '2027-07-30',
    lieu: 'Bastogne',
    section: 'guides',
    resume: 'Quinze jours, mêmes dates que la Troupe, terrain voisin.',
    description:
      "La Compagnie campe à côté de la Troupe, avec ses propres constructions et son propre programme. Les deux sections se retrouvent pour la veillée de mi-camp et pour la journée des parents du dimanche 26.",
    public: 'parents',
    inscription: true,
    photo: '/images/camp-prairie-large.jpg',
  },
  {
    slug: 'camp-horizons-2027',
    titre: 'Camp des Horizons',
    date: '2027-08-01',
    dateFin: '2027-08-14',
    lieu: 'Destination annoncée en juin',
    section: 'horizons',
    resume: 'Le camp itinérant, préparé par les Horizons de bout en bout.',
    description:
      "Quinze jours en itinérance, avec un projet de service quelque part au milieu. La destination est choisie par les Horizons en février et annoncée à la réunion parents de juin. Budget, itinéraire et intendance sont entièrement de leur ressort.",
    public: 'parents',
    inscription: true,
  },
  {
    slug: 'demontage-materiel-2027',
    titre: 'Rangement du matériel d’unité',
    date: '2027-08-29',
    heure: '10:00 – 16:00',
    lieu: 'Local de l’unité, Fleurus',
    section: null,
    resume: 'Le jour le moins glorieux de l’année, et l’un des plus utiles.',
    description:
      "On sort tout, on trie, on répare, on jette ce qui est mort et on note ce qu'il faut racheter. Tentes à sécher, malles à vider, frigo à nettoyer. Toute personne qui passe une heure est une personne de gagnée.",
    public: 'chefs',
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
