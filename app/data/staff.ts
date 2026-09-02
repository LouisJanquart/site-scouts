// ---------------------------------------------------------------------------
// DÉCISION DE CONCEPTION — à relire avant de toucher à ce fichier.
//
// Le classeur « Contacts Staffs » contient, pour 63 personnes, le nom de
// famille, le numéro de téléphone personnel et l'adresse mail personnelle.
// Rien de tout cela n'est repris ici, et ce n'est pas un oubli.
//
// Ce site est généré en statique : tout ce qui se trouve dans ce fichier est
// téléchargé par n'importe quel visiteur, quel que soit le rôle affiché à
// l'écran. Le sélecteur de rôle masque des informations, il ne les protège
// pas. Publier 63 numéros de téléphone derrière un simple masquage côté
// navigateur reviendrait à les publier tout court.
//
// Les coordonnées personnelles n'apparaîtront donc qu'une fois qu'une vraie
// authentification et un rendu côté serveur existeront. En attendant, les
// vues « parent » et « animé » affichent l'adresse mail de section, qui est
// une adresse de fonction déjà partagée par l'unité.
// ---------------------------------------------------------------------------

export interface Chef {
  prenom: string
  totem: string | null
  section: string
  chefDeStaff?: boolean
  note?: string
}

export const chefs: Chef[] = [
  // Staff d'unité
  { prenom: 'Raphaël', totem: 'Ourson', section: 'staff', chefDeStaff: true },
  { prenom: 'Jean-Christophe', totem: 'Panda', section: 'staff' },
  { prenom: 'Marine', totem: 'Dik-dik', section: 'staff' },
  { prenom: 'Pierre', totem: 'Chico', section: 'staff' },
  { prenom: 'Aurélie', totem: null, section: 'staff' },
  { prenom: 'Perrine', totem: 'Chousingha', section: 'staff' },

  // Nutons
  { prenom: 'Maëlle', totem: 'Caligata', section: 'nutons', chefDeStaff: true },
  { prenom: 'Lou', totem: 'Athéris', section: 'nutons' },
  { prenom: 'Romane', totem: 'Alquimi', section: 'nutons' },
  { prenom: 'Danaé', totem: 'Aluco', section: 'nutons' },
  { prenom: 'Léa', totem: 'Kumea', section: 'nutons' },

  // Lutins
  { prenom: 'Romy', totem: 'Gyra', section: 'lutins', chefDeStaff: true },
  { prenom: 'Ève', totem: 'Aotus', section: 'lutins' },
  { prenom: 'Nelly', totem: 'Cotinga', section: 'lutins' },
  { prenom: 'Janelle', totem: 'Baïlaohu', section: 'lutins', note: 'mi-temps' },
  { prenom: 'Alycia', totem: 'Koala', section: 'lutins' },
  { prenom: 'Marine', totem: 'Colibri', section: 'lutins' },
  { prenom: 'Arto', totem: 'Masaï', section: 'lutins' },
  { prenom: 'Emma', totem: 'Chrysopelea', section: 'lutins' },
  { prenom: 'Jade', totem: 'Bassaris', section: 'lutins' },
  { prenom: 'Yanis', totem: 'Alaskan', section: 'lutins' },

  // Louveteaux
  { prenom: 'Julia', totem: 'Abyssin', section: 'louveteaux', chefDeStaff: true },
  { prenom: 'Elena', totem: 'Dik-Dik', section: 'louveteaux' },
  { prenom: 'Florian', totem: 'Aonyx', section: 'louveteaux' },
  { prenom: 'Théodore', totem: 'Boomslang', section: 'louveteaux' },
  { prenom: 'Célia', totem: 'Hermine', section: 'louveteaux' },
  { prenom: 'Gianni', totem: 'Monax', section: 'louveteaux' },
  { prenom: 'Félix', totem: 'Merens', section: 'louveteaux', note: 'présent au camp' },

  // Guides
  { prenom: 'Louise', totem: 'Chinga', section: 'guides', chefDeStaff: true },
  { prenom: 'Lisa', totem: 'Lemming', section: 'guides', note: 'second quadrimestre' },
  { prenom: 'Isaline', totem: 'Isatis', section: 'guides' },
  { prenom: 'Adrien', totem: 'Orignal', section: 'guides' },
  { prenom: 'Nathan', totem: 'Galago', section: 'guides' },
  { prenom: 'Fantine', totem: 'Calocitta', section: 'guides' },
  { prenom: 'Zoé', totem: 'Altaïca', section: 'guides' },

  // Scouts
  { prenom: 'Célestine', totem: 'Suricate', section: 'scouts', chefDeStaff: true },
  { prenom: 'Simon', totem: 'Simensis', section: 'scouts' },
  { prenom: 'Théo', totem: 'Epaulard', section: 'scouts' },
  { prenom: 'Fantine', totem: 'Pudu', section: 'scouts' },
  { prenom: 'Maël', totem: 'Springbok', section: 'scouts' },
  { prenom: 'Teerohn', totem: 'Kangal', section: 'scouts' },

  // Pios
  { prenom: 'Camille', totem: 'Tenkile', section: 'pios', chefDeStaff: true },
  { prenom: 'Simon', totem: 'Jaco', section: 'pios' },
  { prenom: 'Clarisse', totem: 'Pajero', section: 'pios' },
  { prenom: 'Justin', totem: 'Oryctérope', section: 'pios' },

  // Route
  { prenom: 'Alexis', totem: 'Saki', section: 'route', chefDeStaff: true },
  { prenom: 'Jean-Nicolas', totem: 'Addax', section: 'route' },
  { prenom: 'Anne-Camille', totem: 'Alpaga', section: 'route' },
  { prenom: 'Marie-Pauline', totem: 'Anatis', section: 'route' },
  { prenom: 'Grégoire', totem: 'Aubrac', section: 'route' },
  { prenom: 'Marie', totem: 'Azara', section: 'route' },
  { prenom: 'Thomas', totem: 'Hyrax', section: 'route' },
  { prenom: 'Victor', totem: 'Goéland', section: 'route' },
  { prenom: 'Aaron', totem: 'Irbis', section: 'route' },
  { prenom: 'Louis', totem: 'Jabiru', section: 'route' },
  { prenom: 'Zoé', totem: 'Madoqua', section: 'route' },
  { prenom: 'Pauline', totem: 'Maki', section: 'route' },
  { prenom: 'Alicia', totem: 'Mara', section: 'route' },
  { prenom: 'Rémi', totem: 'Racoon', section: 'route' },
  { prenom: 'Esteban', totem: 'Tamandua', section: 'route' },
  { prenom: 'Martin', totem: 'Verdier', section: 'route' },
  { prenom: 'Jérôme', totem: 'Yearling', section: 'route' },
  { prenom: 'Emma', totem: 'Zibeline', section: 'route' },
]

export function chefsDeSection(slug: string): Chef[] {
  return chefs
    .filter((c) => c.section === slug)
    .sort((a, b) => Number(b.chefDeStaff ?? false) - Number(a.chefDeStaff ?? false))
}

export const totalChefs = chefs.length
