// Arborescence des documents. Les fichiers eux-mêmes ne sont pas dans ce dépôt :
// cette liste décrit ce que l'espace doit contenir et pour qui, à partir de ce
// que l'unité fait déjà circuler par mail et par Drive.

export interface Document {
  titre: string
  description: string
  categorie: string
  pour: 'tous' | 'parents' | 'animes' | 'chefs'
  format: 'pdf' | 'docx' | 'xlsx' | 'lien'
  disponible: boolean
  url?: string
}

export const categories = [
  { cle: 'inscription', nom: 'Inscription et cotisation' },
  { cle: 'camp', nom: 'Camps et weekends' },
  { cle: 'vie-unite', nom: "Vie de l'unité" },
  { cle: 'animation', nom: 'Ressources d’animation' },
  { cle: 'administratif', nom: 'Administratif du staff' },
]

export const documents: Document[] = [
  {
    titre: 'Fiche médicale',
    description:
      "À remplir une fois par an, avant le premier camp, dans l'espace famille de ce site. Elle est relue par le staff de la section et revue avant chaque camp.",
    categorie: 'inscription',
    pour: 'parents',
    format: 'lien',
    disponible: false,
  },
  {
    titre: 'Note sur les cotisations',
    description:
      "Ce que couvre la cotisation annuelle, ce qui revient à la fédération et la part qui revient à la section pour les goûters et le matériel.",
    categorie: 'inscription',
    pour: 'parents',
    format: 'pdf',
    disponible: false,
  },
  {
    titre: 'Liste de matériel de camp',
    description: 'Une liste par section, mise à jour chaque printemps par le staff concerné.',
    categorie: 'camp',
    pour: 'parents',
    format: 'pdf',
    disponible: false,
  },
  {
    titre: 'Autorisation parentale de sortie',
    description: 'Pour les hikes, grandes sorties et weekends hors du local.',
    categorie: 'camp',
    pour: 'parents',
    format: 'pdf',
    disponible: false,
  },
  {
    titre: 'Planning annuel des réunions',
    description:
      "Le classeur partagé qui fait référence pour toutes les sections. C'est lui qui alimente le calendrier de ce site.",
    categorie: 'vie-unite',
    pour: 'tous',
    format: 'lien',
    disponible: false,
  },
  {
    titre: 'Chansonnier de l’unité',
    description:
      "Les chants à connaître, des totems au coquelicot. Une version imprimable pour le camp est prévue.",
    categorie: 'animation',
    pour: 'animes',
    format: 'pdf',
    disponible: false,
  },
  {
    titre: 'Recueil de grands jeux',
    description: 'Grands jeux, petits jeux, jeux de veillée, jeu de piste. Consultable hors ligne.',
    categorie: 'animation',
    pour: 'chefs',
    format: 'pdf',
    disponible: false,
  },
  {
    titre: 'Liste des totems attribués',
    description: 'Qui porte quoi, et depuis quand. Utile avant chaque totémisation.',
    categorie: 'animation',
    pour: 'chefs',
    format: 'xlsx',
    disponible: false,
  },
  {
    titre: 'Comptes rendus de réunion route',
    description: 'Les PV des conseils de route et des réunions de staff, année par année.',
    categorie: 'administratif',
    pour: 'chefs',
    format: 'pdf',
    disponible: false,
  },
  {
    titre: 'Contacts des staffs',
    description:
      "Le tableau des 63 animateurs. Ne sera accessible qu'une fois l'authentification en place : ces coordonnées ne peuvent pas être publiées sur un site statique.",
    categorie: 'administratif',
    pour: 'chefs',
    format: 'xlsx',
    disponible: false,
  },
  {
    titre: 'Dimensions des ridelles',
    description: 'Pour le chargement du matériel de camp dans la remorque.',
    categorie: 'administratif',
    pour: 'chefs',
    format: 'pdf',
    disponible: false,
  },
]

export function documentsPour(role: string): Document[] {
  const niveau = role === 'chef' ? 3 : role === 'anime' ? 2 : role === 'parent' ? 2 : 1
  const rang: Record<string, number> = { tous: 1, parents: 2, animes: 2, chefs: 3 }
  return documents.filter((d) => rang[d.pour] <= niveau)
}
