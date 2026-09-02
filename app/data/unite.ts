// Identité et informations pratiques de l'unité.
// Les champs marqués `aCompleter` n'ont pas été trouvés dans les sources
// consultées (archives, Drive, Obsidian) : ils doivent être remplis par le
// staff d'unité avant toute mise en ligne publique.

export const unite = {
  numero: '16e',
  ville: 'Fleurus',
  nomComplet: '16e Fleurus — Notre-Dame des Champs',
  paroisse: 'Notre-Dame des Champs',
  region: 'Hainaut Est',
  fondation: 1968,
  emailUnite: 'scout.fleu@gmail.com',
  devise: 'Depuis 1968',
}

export const horaires = [
  {
    cle: 'ete',
    nom: 'Horaire d’été',
    heures: '14h00 – 17h30',
    periode: 'De la rentrée au 18 octobre, puis du 7 mars à la fin des réunions',
  },
  {
    cle: 'hiver',
    nom: 'Horaire d’hiver',
    heures: '14h00 – 17h00',
    periode: 'Du 25 octobre au 28 février',
  },
]

export interface InfoPratique {
  question: string
  reponse: string
  aCompleter?: boolean
}

export const infosPratiques: InfoPratique[] = [
  {
    question: 'Quand ont lieu les réunions ?',
    reponse:
      "Le dimanche après-midi, de septembre à mai. En horaire d'été de 14h à 17h30, en horaire d'hiver de 14h à 17h. Les hikes, grandes sorties et réunions spéciales ont des horaires propres, annoncés par chaque section.",
  },
  {
    question: 'Où se trouve le local ?',
    reponse: "L'adresse du local reste à compléter par le staff d'unité.",
    aCompleter: true,
  },
  {
    question: 'Comment inscrire son enfant ?',
    reponse:
      "Le plus simple est de venir aux portes ouvertes, début septembre : on y rencontre le staff de la section concernée et on repart avec les informations. L'inscription administrative et la cotisation passent ensuite par Desk, l'outil de la fédération, et non par ce site.",
  },
  {
    question: 'Combien coûte une année ?',
    reponse:
      "Le montant de la cotisation reste à préciser. Elle couvre l'affiliation à la fédération, l'assurance, et une part qui revient à la section pour les goûters et le matériel.",
    aCompleter: true,
  },
  {
    question: 'Que faut-il comme uniforme ?',
    reponse:
      "Le foulard de l'unité, plus la chemise et le pull de la section. La liste précise et les points de vente restent à compléter.",
    aCompleter: true,
  },
  {
    question: 'Mon enfant peut-il essayer avant de s’inscrire ?',
    reponse:
      "Oui. Les portes ouvertes sont faites pour ça, et une ou deux réunions d'essai sont possibles en dehors de cette date : il suffit d'écrire à l'adresse de la section.",
  },
  {
    question: 'Il y a un camp chaque année ?',
    reponse:
      "Oui, en juillet. Sa durée dépend de la section : quelques jours chez les Nutons, une dizaine de jours chez les Guides et les Scouts, sous tente et avec des constructions en bois.",
  },
  {
    question: 'Comment devenir animateur ?',
    reponse:
      "En passant par la Route, ou en contactant directement le staff d'unité. Les nouveaux chefs suivent une formation reconnue par la fédération.",
  },
]

export const reseaux = [
  { nom: 'Facebook', url: null, icone: 'facebook' },
  { nom: 'Instagram', url: null, icone: 'instagram' },
  { nom: 'YouTube', url: null, icone: 'youtube' },
  { nom: 'TikTok', url: null, icone: 'tiktok' },
]
