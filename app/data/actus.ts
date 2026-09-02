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
}

export const actus: Actu[] = [
  {
    slug: 'rentree-2026',
    titre: 'La saison 2026-2027 commence le 6 septembre',
    date: '2026-09-02',
    sections: ['nutons', 'lutins', 'louveteaux', 'guides', 'scouts', 'pios', 'route'],
    chapo:
      'Portes ouvertes le dimanche 6 septembre de 14h à 17h30, puis réunion des passages la semaine suivante.',
    corps: [
      "Le calendrier de l'année est bouclé. Il démarre par les portes ouvertes du 6 septembre, ouvertes à tout le monde et sans inscription préalable : c'est le moment pour venir voir à quoi ressemble une réunion avant de s'engager.",
      "Le dimanche suivant, 13 septembre, aura lieu la réunion des passages. Toutes les sections sont concernées, et la Route tient le bar pour les parents qui restent.",
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
    titre: 'Souper dias le 11 octobre : on cherche des bras',
    date: '2026-08-28',
    sections: ['route'],
    chapo:
      'Réunion d’unité la journée, souper et projection le soir. La préparation commence deux semaines avant.',
    corps: [
      "Le souper dias est le premier gros événement de l'année. Les sections y projettent les photos de leur camp, et c'est une rentrée d'argent qui compte pour le matériel.",
      "Les Pios sont sur la préparation, mais il faut du monde en cuisine, au bar et au rangement. Un tour de rôle sera proposé à la prochaine réunion route.",
    ],
    public: 'chefs',
  },
]

export function actusVisibles(role: string): Actu[] {
  const ordre: Record<string, number> = { tous: 0, parents: 1, animes: 1, chefs: 2 }
  const niveau = role === 'chef' ? 2 : role === 'visiteur' ? 0 : 1
  return actus
    .filter((a) => ordre[a.public] <= niveau)
    .sort((a, b) => b.date.localeCompare(a.date))
}
