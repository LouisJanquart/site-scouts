// Planning de la saison 2026-2027, transcrit depuis le classeur
// « [HE16] Planning Annuel Réunions — toutes sections » partagé par
// scout.fleu@gmail.com. Source unique de vérité : le classeur. Ce fichier
// est une copie figée, à remplacer par une lecture des flux iCal que le
// classeur génère déjà (voir composables/usePlanning.ts).

// Les types vivent dans shared/planning.ts : le navigateur en a besoin pour
// afficher ce que l'API lui envoie, mais il ne doit jamais recevoir les dates.
export type { TypeReunion, JourPlanning } from '../../shared/planning'
import type { JourPlanning } from '../../shared/planning'

export const saison = '2026-2027'

export const planning: JourPlanning[] = [
  {
    "date": "2026-09-06",
    "horaire": "ete",
    "remarque": null,
    "evenement": "Portes Ouvertes + CU",
    "occupation": null,
    "rangement": null,
    "sections": {}
  },
  {
    "date": "2026-09-13",
    "horaire": "ete",
    "remarque": null,
    "evenement": "Passages",
    "occupation": null,
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "RU : Réunion des Passages",
        "type": "unite"
      },
      "lutins": {
        "libelle": "RU : Réunion des Passages",
        "type": "unite"
      },
      "louveteaux": {
        "libelle": "RU : Réunion des Passsages",
        "type": "unite"
      },
      "guides": {
        "libelle": "RU : Passages",
        "type": "unite"
      },
      "scouts": {
        "libelle": "RU : Réunion des Passages",
        "type": "unite"
      },
      "pios": {
        "libelle": "RU : Réunion des Passages",
        "type": "unite"
      },
      "route": {
        "libelle": "Bar : Passages",
        "type": "bar"
      }
    }
  },
  {
    "date": "2026-09-20",
    "horaire": "ete",
    "remarque": null,
    "evenement": null,
    "occupation": null,
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "lutins": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "guides": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "scouts": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "pios": {
        "libelle": "RN : Réunion normale + bbq",
        "type": "normale"
      }
    }
  },
  {
    "date": "2026-09-27",
    "horaire": "ete",
    "remarque": "Fête Communauté Française",
    "evenement": null,
    "occupation": null,
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "lutins": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "guides": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "scouts": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "pios": {
        "libelle": "Réunion Normale",
        "type": "normale"
      }
    }
  },
  {
    "date": "2026-10-04",
    "horaire": "ete",
    "remarque": null,
    "evenement": null,
    "occupation": null,
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "lutins": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "guides": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "scouts": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "pios": {
        "libelle": "RN : Animation section",
        "type": "normale"
      }
    }
  },
  {
    "date": "2026-10-11",
    "horaire": "ete",
    "remarque": null,
    "evenement": "Souper Dia",
    "occupation": null,
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "RU : Souper Dia",
        "type": "unite"
      },
      "lutins": {
        "libelle": "RU : Souper Dia",
        "type": "unite"
      },
      "louveteaux": {
        "libelle": "RU : Souper Dia",
        "type": "unite"
      },
      "guides": {
        "libelle": "RU : Souper Dia",
        "type": "unite"
      },
      "scouts": {
        "libelle": "RU : Souper Dia",
        "type": "unite"
      },
      "pios": {
        "libelle": "RN : Prépa souper dia",
        "type": "normale"
      },
      "route": {
        "libelle": "RU : Souper Dia",
        "type": "unite"
      }
    }
  },
  {
    "date": "2026-10-18",
    "horaire": "ete",
    "remarque": "Congé d'automne (Toussaint)",
    "evenement": null,
    "occupation": null,
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Relâche",
        "type": "relache"
      },
      "lutins": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "guides": {
        "libelle": "Grande Sortie",
        "type": "grande-sortie"
      },
      "scouts": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "pios": {
        "libelle": "Réunion Normale",
        "type": "normale"
      }
    }
  },
  {
    "date": "2026-10-25",
    "horaire": "hiver",
    "remarque": "J+1 : 3h00 → 2h00",
    "evenement": "Congé d'automne (Toussaint)",
    "occupation": "CU (après GS lutin)",
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Nutons (14:00 -> 17:30)",
        "type": "normale"
      },
      "lutins": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "Grande Sortie",
        "type": "grande-sortie"
      },
      "guides": {
        "libelle": "Réunion Spéciale",
        "type": "speciale"
      },
      "scouts": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "pios": {
        "libelle": "Relâche",
        "type": "relache"
      },
      "route": {
        "libelle": "RS : Réunion argent",
        "type": "speciale"
      }
    }
  },
  {
    "date": "2026-11-01",
    "horaire": "hiver",
    "remarque": "Congé d'automne (Toussaint)",
    "evenement": null,
    "occupation": null,
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "lutins": {
        "libelle": "Relâche",
        "type": "relache"
      },
      "louveteaux": {
        "libelle": "Hike",
        "type": "hike"
      },
      "guides": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "scouts": {
        "libelle": "Hike",
        "type": "hike"
      },
      "pios": {
        "libelle": "Relâche",
        "type": "relache"
      }
    }
  },
  {
    "date": "2026-11-08",
    "horaire": "hiver",
    "remarque": null,
    "evenement": null,
    "occupation": "Route (18:30 → 23:00)",
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "lutins": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "Relâche",
        "type": "relache"
      },
      "guides": {
        "libelle": "Hike",
        "type": "hike"
      },
      "scouts": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "pios": {
        "libelle": "RN : Animation section",
        "type": "normale"
      },
      "route": {
        "libelle": "Bar : Beer Pong",
        "type": "bar"
      }
    }
  },
  {
    "date": "2026-11-15",
    "horaire": "hiver",
    "remarque": null,
    "evenement": null,
    "occupation": "Horizons",
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Hike",
        "type": "hike"
      },
      "lutins": {
        "libelle": "Hike",
        "type": "hike"
      },
      "louveteaux": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "guides": {
        "libelle": "Relâche",
        "type": "relache"
      },
      "scouts": {
        "libelle": "Grande Sortie",
        "type": "grande-sortie"
      },
      "pios": {
        "libelle": "Bar : Bar pio",
        "type": "bar"
      }
    }
  },
  {
    "date": "2026-11-22",
    "horaire": "hiver",
    "remarque": null,
    "evenement": null,
    "occupation": "Scouts (14:00 → 23:59)",
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Grande Sortie",
        "type": "grande-sortie"
      },
      "lutins": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "guides": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "scouts": {
        "libelle": "Relâche",
        "type": "relache"
      },
      "pios": {
        "libelle": "Hike",
        "type": "hike"
      }
    }
  },
  {
    "date": "2026-11-29",
    "horaire": "hiver",
    "remarque": null,
    "evenement": null,
    "occupation": "Scouts (09:00 → 17:00)",
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "lutins": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "Grande Sortie",
        "type": "grande-sortie"
      },
      "guides": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "scouts": {
        "libelle": "Réunion Spéciale",
        "type": "speciale"
      },
      "pios": {
        "libelle": "RS : Grande sortie",
        "type": "grande-sortie"
      }
    }
  },
  {
    "date": "2026-12-06",
    "horaire": "hiver",
    "remarque": "FIN DES REUNIONS",
    "evenement": "Saint-Nicolas",
    "occupation": null,
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Réunion Spéciale",
        "type": "speciale"
      },
      "lutins": {
        "libelle": "Réunion Spéciale",
        "type": "speciale"
      },
      "louveteaux": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "guides": {
        "libelle": "Réunion Spéciale",
        "type": "speciale"
      },
      "scouts": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "pios": {
        "libelle": "RS : Saint nicolas",
        "type": "speciale"
      }
    }
  },
  {
    "date": "2026-12-20",
    "horaire": null,
    "remarque": "Vacances d'hiver (Noël)",
    "evenement": "Veillée Noël",
    "occupation": "Veillée Noël",
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Réunion Spéciale",
        "type": "speciale"
      },
      "lutins": {
        "libelle": "Réunion Spéciale",
        "type": "speciale"
      },
      "louveteaux": {
        "libelle": "Réunion Spéciale",
        "type": "speciale"
      },
      "guides": {
        "libelle": "Réunion Spéciale",
        "type": "speciale"
      },
      "scouts": {
        "libelle": "Réunion Spéciale",
        "type": "speciale"
      },
      "pios": {
        "libelle": "Réunion Spéciale",
        "type": "speciale"
      },
      "route": {
        "libelle": "RS : Veillée de Noël",
        "type": "speciale"
      }
    }
  },
  {
    "date": "2026-12-27",
    "horaire": null,
    "remarque": "Vacances d'hiver (Noël)",
    "evenement": null,
    "occupation": null,
    "rangement": null,
    "sections": {}
  },
  {
    "date": "2027-01-03",
    "horaire": null,
    "remarque": "Vacances d'hiver (Noël)",
    "evenement": null,
    "occupation": null,
    "rangement": null,
    "sections": {}
  },
  {
    "date": "2027-02-07",
    "horaire": "hiver",
    "remarque": "REPRISE",
    "evenement": "CU (17h)",
    "occupation": null,
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "lutins": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "scouts": {
        "libelle": "Réunion Normale",
        "type": "normale"
      }
    }
  },
  {
    "date": "2027-02-14",
    "horaire": "hiver",
    "remarque": "Congé de détente (Carnaval)",
    "evenement": "Carnaval",
    "occupation": null,
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "lutins": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "scouts": {
        "libelle": "Réunion Normale",
        "type": "normale"
      }
    }
  },
  {
    "date": "2027-02-21",
    "horaire": "hiver",
    "remarque": "Congé de détente (Carnaval)",
    "evenement": "Soumonce",
    "occupation": "Loups (17:00 à 21h)",
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "lutins": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "Réunion Spéciale",
        "type": "speciale"
      },
      "scouts": {
        "libelle": "Réunion Normale",
        "type": "normale"
      }
    }
  },
  {
    "date": "2027-02-28",
    "horaire": "hiver",
    "remarque": "Congé de détente (Carnaval)",
    "evenement": null,
    "occupation": null,
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Hike",
        "type": "hike"
      },
      "lutins": {
        "libelle": "Grande Sortie",
        "type": "grande-sortie"
      },
      "louveteaux": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "scouts": {
        "libelle": "Réunion Normale",
        "type": "normale"
      }
    }
  },
  {
    "date": "2027-03-07",
    "horaire": "ete",
    "remarque": "Fin des réunions à 17h30",
    "evenement": "Soumonce",
    "occupation": "Route (08/03 07:00 → 08/03 19:30)",
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "scouts": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "route": {
        "libelle": "RS : Marche Adeps",
        "type": "speciale"
      }
    }
  },
  {
    "date": "2027-03-14",
    "horaire": "ete",
    "remarque": null,
    "evenement": null,
    "occupation": "Lutins (14:00 → 17:30)",
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Grande Sortie",
        "type": "grande-sortie"
      },
      "lutins": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "Relâche",
        "type": "relache"
      },
      "scouts": {
        "libelle": "Grande Sortie",
        "type": "grande-sortie"
      }
    }
  },
  {
    "date": "2027-03-21",
    "horaire": "ete",
    "remarque": null,
    "evenement": "Soumonce",
    "occupation": null,
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Relâche",
        "type": "relache"
      },
      "lutins": {
        "libelle": "Réunion Spéciale",
        "type": "speciale"
      },
      "louveteaux": {
        "libelle": "Grande Sortie",
        "type": "grande-sortie"
      },
      "scouts": {
        "libelle": "Relâche",
        "type": "relache"
      }
    }
  },
  {
    "date": "2027-03-28",
    "horaire": "ete",
    "remarque": "J+1 : 2h00 → 3h00",
    "evenement": null,
    "occupation": null,
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "lutins": {
        "libelle": "Hike",
        "type": "hike"
      },
      "louveteaux": {
        "libelle": "Hike",
        "type": "hike"
      },
      "scouts": {
        "libelle": "Réunion Normale",
        "type": "normale"
      }
    }
  },
  {
    "date": "2027-04-04",
    "horaire": "ete",
    "remarque": null,
    "evenement": "Cavalcade (Pâques)",
    "occupation": "scout (17h-18h)",
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "lutins": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "scouts": {
        "libelle": "Réunion Normale",
        "type": "normale"
      }
    }
  },
  {
    "date": "2027-04-11",
    "horaire": "ete",
    "remarque": null,
    "evenement": "TU",
    "occupation": null,
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Relâche",
        "type": "relache"
      },
      "lutins": {
        "libelle": "Relâche",
        "type": "relache"
      },
      "louveteaux": {
        "libelle": "Relâche",
        "type": "relache"
      },
      "scouts": {
        "libelle": "Relâche",
        "type": "relache"
      }
    }
  },
  {
    "date": "2027-04-18",
    "horaire": "ete",
    "remarque": null,
    "evenement": null,
    "occupation": "Nutons (14h->17h30) + (17/04 18h-2h)",
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Réunion Spéciale",
        "type": "speciale"
      },
      "lutins": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "scouts": {
        "libelle": "Réunion Normale",
        "type": "normale"
      }
    }
  },
  {
    "date": "2027-04-25",
    "horaire": "ete",
    "remarque": "Vacances de printemps (Pâques)",
    "evenement": null,
    "occupation": "Loups (14:00 à 17h30)",
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "lutins": {
        "libelle": "Réunion Spéciale",
        "type": "speciale"
      },
      "louveteaux": {
        "libelle": "Réunion Spéciale",
        "type": "speciale"
      },
      "scouts": {
        "libelle": "Hike",
        "type": "hike"
      }
    }
  },
  {
    "date": "2027-05-02",
    "horaire": "ete",
    "remarque": "Vacances de printemps (Pâques)",
    "evenement": null,
    "occupation": null,
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "lutins": {
        "libelle": "Réunion Spéciale",
        "type": "speciale"
      },
      "louveteaux": {
        "libelle": "Réunion Spéciale",
        "type": "speciale"
      },
      "scouts": {
        "libelle": "Réunion Normale",
        "type": "normale"
      }
    }
  },
  {
    "date": "2027-05-09",
    "horaire": "ete",
    "remarque": "Vacances de printemps (Pâques)",
    "evenement": null,
    "occupation": null,
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "lutins": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "scouts": {
        "libelle": "Réunion Normale",
        "type": "normale"
      }
    }
  },
  {
    "date": "2027-05-16",
    "horaire": "ete",
    "remarque": "Fin des réunions",
    "evenement": "Fun Fest",
    "occupation": null,
    "rangement": null,
    "sections": {
      "scouts": {
        "libelle": "Réunion Normale",
        "type": "normale"
      }
    }
  },
  {
    "date": "2027-09-07",
    "horaire": "ete",
    "remarque": "JPO",
    "evenement": null,
    "occupation": null,
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Journée Portes Ouvertes",
        "type": "normale"
      },
      "lutins": {
        "libelle": "Journée Portes Ouvertes",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "Journée Portes Ouvertes",
        "type": "normale"
      },
      "guides": {
        "libelle": "Journée Portes Ouvertes",
        "type": "normale"
      },
      "scouts": {
        "libelle": "Journée Portes Ouvertes",
        "type": "normale"
      },
      "pios": {
        "libelle": "Journée Portes Ouvertes",
        "type": "normale"
      },
      "route": {
        "libelle": "Journée Portes Ouvertes",
        "type": "normale"
      }
    }
  },
  {
    "date": "2027-09-14",
    "horaire": "ete",
    "remarque": "Passages",
    "evenement": null,
    "occupation": null,
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Journée des passages (Forêt des loisirs)",
        "type": "normale"
      },
      "lutins": {
        "libelle": "Journée des passages (Forêt des loisirs)",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "Journée des passages (Forêt des loisirs)",
        "type": "normale"
      },
      "guides": {
        "libelle": "Journée des passages (Forêt des loisirs)",
        "type": "normale"
      },
      "scouts": {
        "libelle": "Journée des passages (Forêt des loisirs)",
        "type": "normale"
      },
      "pios": {
        "libelle": "Journée des passages (Forêt des loisirs)",
        "type": "normale"
      },
      "route": {
        "libelle": "Journée des passages (Forêt des loisirs)",
        "type": "normale"
      }
    }
  },
  {
    "date": "2027-09-21",
    "horaire": "ete",
    "remarque": null,
    "evenement": null,
    "occupation": null,
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Réunion normale",
        "type": "normale"
      },
      "lutins": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "Réunion normale",
        "type": "normale"
      },
      "guides": {
        "libelle": "réunion normale",
        "type": "normale"
      },
      "scouts": {
        "libelle": "Réunion normale",
        "type": "normale"
      },
      "pios": {
        "libelle": "Réunion normale + réu infos parents",
        "type": "normale"
      }
    }
  },
  {
    "date": "2027-09-28",
    "horaire": "ete",
    "remarque": "TU chefs",
    "evenement": null,
    "occupation": null,
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "TU chefs",
        "type": "normale"
      },
      "lutins": {
        "libelle": "TU chefs",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "TU chefs",
        "type": "normale"
      },
      "guides": {
        "libelle": "TU chefs",
        "type": "normale"
      },
      "scouts": {
        "libelle": "TU chefs",
        "type": "normale"
      },
      "pios": {
        "libelle": "TU chefs",
        "type": "normale"
      },
      "route": {
        "libelle": "TU chefs",
        "type": "normale"
      }
    }
  },
  {
    "date": "2027-10-05",
    "horaire": "ete",
    "remarque": "Souper Dias",
    "evenement": null,
    "occupation": null,
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Souper Dias",
        "type": "normale"
      },
      "lutins": {
        "libelle": "Souper Dias",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "Souper Dias",
        "type": "normale"
      },
      "guides": {
        "libelle": "Souper Dias",
        "type": "normale"
      },
      "scouts": {
        "libelle": "Souper Dias",
        "type": "normale"
      },
      "pios": {
        "libelle": "Souper Dias",
        "type": "normale"
      },
      "route": {
        "libelle": "Souper Dias",
        "type": "normale"
      }
    }
  },
  {
    "date": "2027-10-12",
    "horaire": "ete",
    "remarque": null,
    "evenement": null,
    "occupation": null,
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Réunion normale",
        "type": "normale"
      },
      "lutins": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "Réunion spéciale au Centre de Délassement de Marcinelle",
        "type": "speciale"
      },
      "guides": {
        "libelle": "réunion normale",
        "type": "normale"
      },
      "scouts": {
        "libelle": "Réunion normale",
        "type": "normale"
      },
      "pios": {
        "libelle": "Réunion camp",
        "type": "normale"
      }
    }
  },
  {
    "date": "2027-10-19",
    "horaire": "ete",
    "remarque": null,
    "evenement": null,
    "occupation": null,
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Hike",
        "type": "hike"
      },
      "lutins": {
        "libelle": "Grande Sortie",
        "type": "grande-sortie"
      },
      "louveteaux": {
        "libelle": "Réunion au local",
        "type": "normale"
      },
      "guides": {
        "libelle": "réunion normale",
        "type": "normale"
      },
      "scouts": {
        "libelle": "Hike de marche",
        "type": "hike"
      },
      "pios": {
        "libelle": "Réunion normale jeu",
        "type": "normale"
      }
    }
  },
  {
    "date": "2027-10-26",
    "horaire": "ete",
    "remarque": null,
    "evenement": null,
    "occupation": null,
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Réunion normale",
        "type": "normale"
      },
      "lutins": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "Réunion normale",
        "type": "normale"
      },
      "guides": {
        "libelle": "hike",
        "type": "hike"
      },
      "scouts": {
        "libelle": "Réunion Patrouille",
        "type": "normale"
      },
      "pios": {
        "libelle": "Animation en sections",
        "type": "normale"
      }
    }
  },
  {
    "date": "2027-11-02",
    "horaire": "hiver",
    "remarque": null,
    "evenement": null,
    "occupation": null,
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Réunion normale",
        "type": "normale"
      },
      "lutins": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "Réunion normale",
        "type": "normale"
      },
      "guides": {
        "libelle": "réunion normale",
        "type": "normale"
      },
      "scouts": {
        "libelle": "Grande sortie",
        "type": "grande-sortie"
      },
      "pios": {
        "libelle": "Animation en sections",
        "type": "normale"
      }
    }
  },
  {
    "date": "2027-11-09",
    "horaire": "hiver",
    "remarque": null,
    "evenement": null,
    "occupation": null,
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Réunion normale",
        "type": "normale"
      },
      "lutins": {
        "libelle": "Hike",
        "type": "hike"
      },
      "louveteaux": {
        "libelle": "Grande sortie",
        "type": "grande-sortie"
      },
      "guides": {
        "libelle": "relâche (rangement malles par les chefs )",
        "type": "relache"
      },
      "scouts": {
        "libelle": "Réunion Tartouf",
        "type": "normale"
      },
      "pios": {
        "libelle": "Réunion thunes",
        "type": "normale"
      }
    }
  },
  {
    "date": "2027-11-16",
    "horaire": "hiver",
    "remarque": null,
    "evenement": null,
    "occupation": null,
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Grande sortie",
        "type": "grande-sortie"
      },
      "lutins": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "Hike",
        "type": "hike"
      },
      "guides": {
        "libelle": "Grande sortie ville",
        "type": "grande-sortie"
      },
      "scouts": {
        "libelle": "Réunion normale",
        "type": "normale"
      },
      "pios": {
        "libelle": "Hike",
        "type": "hike"
      }
    }
  },
  {
    "date": "2027-11-23",
    "horaire": "hiver",
    "remarque": null,
    "evenement": null,
    "occupation": null,
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Réunion normale",
        "type": "normale"
      },
      "lutins": {
        "libelle": "Marathon de Film (chez Calocitta)",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "Réunion normale",
        "type": "normale"
      },
      "guides": {
        "libelle": "réunion normale",
        "type": "normale"
      },
      "scouts": {
        "libelle": "Réunion normale",
        "type": "normale"
      },
      "pios": {
        "libelle": "Bar pio",
        "type": "bar"
      }
    }
  },
  {
    "date": "2027-11-30",
    "horaire": "hiver",
    "remarque": null,
    "evenement": null,
    "occupation": null,
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Réunion normale",
        "type": "normale"
      },
      "lutins": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "Réunion normale",
        "type": "normale"
      },
      "guides": {
        "libelle": "réuninn normale",
        "type": "normale"
      },
      "scouts": {
        "libelle": "Relâche",
        "type": "relache"
      },
      "pios": {
        "libelle": "Souper savoyard",
        "type": "normale"
      }
    }
  },
  {
    "date": "2027-12-07",
    "horaire": "hiver",
    "remarque": "Saint Nicolas",
    "evenement": null,
    "occupation": null,
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Réunion St-Nicolas (cinéma chez Lemming)",
        "type": "normale"
      },
      "lutins": {
        "libelle": "Réunion St-Nicolas",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "Réunion Saint Nicolas",
        "type": "normale"
      },
      "guides": {
        "libelle": "Grande sortie st Nic'",
        "type": "grande-sortie"
      },
      "scouts": {
        "libelle": "Réunion Saint Nicolas",
        "type": "normale"
      },
      "pios": {
        "libelle": "Réunion Saint-Nicolas (prépa des bonbons)",
        "type": "normale"
      }
    }
  },
  {
    "date": "2027-12-14",
    "horaire": "hiver",
    "remarque": "FIN DES REUNIONS",
    "evenement": null,
    "occupation": null,
    "rangement": null,
    "sections": {
      "guides": {
        "libelle": "FIN DES REUNIONS",
        "type": "normale"
      },
      "pios": {
        "libelle": "Marché de Noël Fleurus",
        "type": "normale"
      }
    }
  },
  {
    "date": "2027-12-21",
    "horaire": "hiver",
    "remarque": "Veillée de Noël",
    "evenement": null,
    "occupation": null,
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Veillée de Noël par la Route",
        "type": "normale"
      },
      "lutins": {
        "libelle": "Veillée de Noël par la Route",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "Veillée de Noël par la Route",
        "type": "normale"
      },
      "guides": {
        "libelle": "Veillée de Noël par la Route",
        "type": "normale"
      },
      "scouts": {
        "libelle": "Veillée de Noël par la Route",
        "type": "normale"
      },
      "pios": {
        "libelle": "Veillée de Noël par la Route",
        "type": "normale"
      },
      "route": {
        "libelle": "Veillée de Noël par la Route",
        "type": "normale"
      }
    }
  },
  {
    "date": "2028-02-01",
    "horaire": "hiver",
    "remarque": null,
    "evenement": null,
    "occupation": null,
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Relâche",
        "type": "relache"
      },
      "lutins": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "Réunion normale",
        "type": "normale"
      },
      "guides": {
        "libelle": "Réunion Guides/ Scouts",
        "type": "normale"
      },
      "scouts": {
        "libelle": "Réunion normale",
        "type": "normale"
      },
      "pios": {
        "libelle": "Réunion camp",
        "type": "normale"
      }
    }
  },
  {
    "date": "2028-02-08",
    "horaire": "hiver",
    "remarque": null,
    "evenement": null,
    "occupation": null,
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Réunion normale",
        "type": "normale"
      },
      "lutins": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "Réunion normale",
        "type": "normale"
      },
      "guides": {
        "libelle": "Réunion normale",
        "type": "normale"
      },
      "scouts": {
        "libelle": "Réunion normale",
        "type": "normale"
      },
      "pios": {
        "libelle": "Bar pio",
        "type": "bar"
      }
    }
  },
  {
    "date": "2028-02-15",
    "horaire": "hiver",
    "remarque": null,
    "evenement": null,
    "occupation": null,
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Réunion normale",
        "type": "normale"
      },
      "lutins": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "Réunion spéciale, à Boignée",
        "type": "speciale"
      },
      "guides": {
        "libelle": "réunion dans le local ( activité peinture )",
        "type": "normale"
      },
      "scouts": {
        "libelle": "Réunion normale",
        "type": "normale"
      },
      "pios": {
        "libelle": "Réunion camp",
        "type": "normale"
      }
    }
  },
  {
    "date": "2028-02-22",
    "horaire": "hiver",
    "remarque": "1er WE Carnaval",
    "evenement": null,
    "occupation": null,
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Réunion normale",
        "type": "normale"
      },
      "lutins": {
        "libelle": "Réunion Bricolage",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "Réunion Bricolage",
        "type": "normale"
      },
      "guides": {
        "libelle": "réunion normale",
        "type": "normale"
      },
      "scouts": {
        "libelle": "Réunion de patrouille",
        "type": "normale"
      },
      "pios": {
        "libelle": "Réunion normale",
        "type": "normale"
      }
    }
  },
  {
    "date": "2028-03-01",
    "horaire": "hiver",
    "remarque": "2e WE Carnaval",
    "evenement": null,
    "occupation": null,
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Réunion normale",
        "type": "normale"
      },
      "lutins": {
        "libelle": "Hike",
        "type": "hike"
      },
      "louveteaux": {
        "libelle": "Réunion normale",
        "type": "normale"
      },
      "guides": {
        "libelle": "Réunion normale",
        "type": "normale"
      },
      "scouts": {
        "libelle": "Hike traqueur (local occupé)",
        "type": "hike"
      },
      "pios": {
        "libelle": "Anim en sections",
        "type": "normale"
      }
    }
  },
  {
    "date": "2028-03-08",
    "horaire": "ete",
    "remarque": "Soumonce en batterie + 3e WE Carnaval",
    "evenement": null,
    "occupation": null,
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Réunion normale",
        "type": "normale"
      },
      "lutins": {
        "libelle": "Relâche",
        "type": "relache"
      },
      "louveteaux": {
        "libelle": "Réunion normale",
        "type": "normale"
      },
      "guides": {
        "libelle": "réunion normale",
        "type": "normale"
      },
      "scouts": {
        "libelle": "Réunion normale",
        "type": "normale"
      },
      "pios": {
        "libelle": "Anim en sections",
        "type": "normale"
      },
      "route": {
        "libelle": "09/03 : Marche Adeps",
        "type": "normale"
      }
    }
  },
  {
    "date": "2028-03-15",
    "horaire": "ete",
    "remarque": null,
    "evenement": null,
    "occupation": null,
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Hike",
        "type": "hike"
      },
      "lutins": {
        "libelle": "Scout Silver Cup",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "Hike",
        "type": "hike"
      },
      "guides": {
        "libelle": "silver cup",
        "type": "normale"
      },
      "scouts": {
        "libelle": "Grande sortie",
        "type": "grande-sortie"
      },
      "pios": {
        "libelle": "Anim en sections / Silver Cup",
        "type": "normale"
      }
    }
  },
  {
    "date": "2028-03-22",
    "horaire": "ete",
    "remarque": "Soumonce en musique",
    "evenement": null,
    "occupation": null,
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Réunion normale",
        "type": "normale"
      },
      "lutins": {
        "libelle": "Réunion Lutin /Louvetaux",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "Réunion Lutin /Louvetaux",
        "type": "normale"
      },
      "guides": {
        "libelle": "relache",
        "type": "normale"
      },
      "scouts": {
        "libelle": "Réunion de patrouille",
        "type": "normale"
      },
      "pios": {
        "libelle": "Réunion normale",
        "type": "normale"
      }
    }
  },
  {
    "date": "2028-03-29",
    "horaire": "ete",
    "remarque": null,
    "evenement": null,
    "occupation": null,
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Réunion normale",
        "type": "normale"
      },
      "lutins": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "Soirée film au local (local occupé à partir de 17h30)",
        "type": "normale"
      },
      "guides": {
        "libelle": "réunion normale",
        "type": "normale"
      },
      "scouts": {
        "libelle": "Réunion normale",
        "type": "normale"
      },
      "pios": {
        "libelle": "DIM 30/03 : marche gourmande",
        "type": "normale"
      }
    }
  },
  {
    "date": "2028-04-05",
    "horaire": "ete",
    "remarque": "Soumonce générale",
    "evenement": null,
    "occupation": null,
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Relâche",
        "type": "relache"
      },
      "lutins": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "Réunion normale (au local)",
        "type": "normale"
      },
      "guides": {
        "libelle": "réunion normale",
        "type": "normale"
      },
      "scouts": {
        "libelle": "Réunion normale",
        "type": "normale"
      },
      "pios": {
        "libelle": "Réunion normale",
        "type": "normale"
      }
    }
  },
  {
    "date": "2028-04-12",
    "horaire": "ete",
    "remarque": null,
    "evenement": null,
    "occupation": null,
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Réunion normale",
        "type": "normale"
      },
      "lutins": {
        "libelle": "Grande Sortie",
        "type": "grande-sortie"
      },
      "louveteaux": {
        "libelle": "Grande sortie",
        "type": "grande-sortie"
      },
      "guides": {
        "libelle": "Hike Guide",
        "type": "hike"
      },
      "scouts": {
        "libelle": "Réunion normale",
        "type": "normale"
      },
      "pios": {
        "libelle": "Anim en sections",
        "type": "normale"
      }
    }
  },
  {
    "date": "2028-04-19",
    "horaire": "ete",
    "remarque": "20/04 Cavalcade",
    "evenement": null,
    "occupation": null,
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Grande sortie",
        "type": "grande-sortie"
      },
      "lutins": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "Réunion normale",
        "type": "normale"
      },
      "guides": {
        "libelle": "relâche guide",
        "type": "relache"
      },
      "scouts": {
        "libelle": "Relâche",
        "type": "relache"
      },
      "pios": {
        "libelle": "Réunion normale",
        "type": "normale"
      }
    }
  },
  {
    "date": "2028-04-26",
    "horaire": "ete",
    "remarque": "1er WE Pâque",
    "evenement": null,
    "occupation": null,
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Réunion normale",
        "type": "normale"
      },
      "lutins": {
        "libelle": "Réunion Normale",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "Relâche",
        "type": "relache"
      },
      "guides": {
        "libelle": "Gala ( local occupé)",
        "type": "normale"
      },
      "scouts": {
        "libelle": "Réunion vélo",
        "type": "normale"
      },
      "pios": {
        "libelle": "Réunion thunes",
        "type": "normale"
      }
    }
  },
  {
    "date": "2028-05-03",
    "horaire": "ete",
    "remarque": "2e WE Pâque",
    "evenement": null,
    "occupation": null,
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Réunion normale",
        "type": "normale"
      },
      "lutins": {
        "libelle": "Réunion Vélo",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "Réunion normale",
        "type": "normale"
      },
      "guides": {
        "libelle": "Grande sortie",
        "type": "grande-sortie"
      },
      "scouts": {
        "libelle": "Réunion de patrouille",
        "type": "normale"
      },
      "pios": {
        "libelle": "Réunion normale",
        "type": "normale"
      }
    }
  },
  {
    "date": "2028-05-10",
    "horaire": "ete",
    "remarque": "3e WE pâque",
    "evenement": null,
    "occupation": null,
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Réunion normale",
        "type": "normale"
      },
      "lutins": {
        "libelle": "Réunion Normale + Réunion avec les parents pour le camp (à 17h30)",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "Car wash",
        "type": "normale"
      },
      "guides": {
        "libelle": "réunion normale",
        "type": "normale"
      },
      "scouts": {
        "libelle": "Réunion normale ( soviet fun fest ?)",
        "type": "normale"
      },
      "pios": {
        "libelle": "Grande sortie",
        "type": "grande-sortie"
      }
    }
  },
  {
    "date": "2028-05-17",
    "horaire": "ete",
    "remarque": null,
    "evenement": null,
    "occupation": null,
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Réunion normale",
        "type": "normale"
      },
      "lutins": {
        "libelle": "Relâche",
        "type": "relache"
      },
      "louveteaux": {
        "libelle": "Réunion normale + Réunion avec les parents pour le camp au local à 13h",
        "type": "normale"
      },
      "guides": {
        "libelle": "Réunion normale",
        "type": "normale"
      },
      "scouts": {
        "libelle": "Réunion normale",
        "type": "normale"
      },
      "pios": {
        "libelle": "VDD 16/05 : bar pio",
        "type": "bar"
      }
    }
  },
  {
    "date": "2028-05-24",
    "horaire": "ete",
    "remarque": "FIN DES REUNIONS",
    "evenement": null,
    "occupation": null,
    "rangement": null,
    "sections": {
      "guides": {
        "libelle": "FIN DES REUNIONS",
        "type": "normale"
      },
      "pios": {
        "libelle": "BBQ fin d'année + réu parents",
        "type": "normale"
      }
    }
  },
  {
    "date": "2028-06-28",
    "horaire": "ete",
    "remarque": null,
    "evenement": null,
    "occupation": null,
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Fête d'unité",
        "type": "normale"
      },
      "lutins": {
        "libelle": "Fête d'unité",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "Fête d'unité",
        "type": "normale"
      },
      "guides": {
        "libelle": "Fête d'unité",
        "type": "normale"
      },
      "scouts": {
        "libelle": "Fête d'unité",
        "type": "normale"
      },
      "pios": {
        "libelle": "Fête d'unité",
        "type": "normale"
      },
      "route": {
        "libelle": "Fête d'unité",
        "type": "normale"
      }
    }
  },
  {
    "date": "2028-09-09",
    "horaire": "ete",
    "remarque": null,
    "evenement": null,
    "occupation": null,
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Journée Portes Ouvertes",
        "type": "normale"
      }
    }
  },
  {
    "date": "2028-09-16",
    "horaire": "ete",
    "remarque": null,
    "evenement": null,
    "occupation": null,
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Journée des passages (Forêt des loisirs)",
        "type": "normale"
      }
    }
  },
  {
    "date": "2028-09-23",
    "horaire": "ete",
    "remarque": null,
    "evenement": null,
    "occupation": "RN",
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "RN",
        "type": "normale"
      },
      "lutins": {
        "libelle": "RN",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "RN",
        "type": "normale"
      }
    }
  },
  {
    "date": "2028-09-30",
    "horaire": "ete",
    "remarque": null,
    "evenement": null,
    "occupation": "RN",
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "RN",
        "type": "normale"
      },
      "lutins": {
        "libelle": "Réunion spéciale",
        "type": "speciale"
      },
      "louveteaux": {
        "libelle": "Journée Copains (RN)",
        "type": "normale"
      }
    }
  },
  {
    "date": "2028-10-07",
    "horaire": "ete",
    "remarque": null,
    "evenement": null,
    "occupation": "RN copines",
    "rangement": "Hike",
    "sections": {
      "nutons": {
        "libelle": "Réunion Spéciale (Marcinelle, 14h30-18h)",
        "type": "speciale"
      },
      "lutins": {
        "libelle": "Réunion copine",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "RN",
        "type": "normale"
      }
    }
  },
  {
    "date": "2028-10-14",
    "horaire": "ete",
    "remarque": "Souper Dia",
    "evenement": "RN",
    "occupation": "RN",
    "rangement": "Relâche",
    "sections": {
      "nutons": {
        "libelle": "RN",
        "type": "normale"
      },
      "lutins": {
        "libelle": "RN",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "RN",
        "type": "normale"
      }
    }
  },
  {
    "date": "2028-10-21",
    "horaire": "ete",
    "remarque": "Place aux enfants",
    "evenement": "Réu brico (besoin local)",
    "occupation": "RN",
    "rangement": "Réunion Spéciale",
    "sections": {
      "nutons": {
        "libelle": "RN",
        "type": "normale"
      },
      "lutins": {
        "libelle": "Grande sortie",
        "type": "grande-sortie"
      },
      "louveteaux": {
        "libelle": "Hike",
        "type": "hike"
      },
      "scouts": {
        "libelle": "Hackathon (22/10)",
        "type": "normale"
      }
    }
  },
  {
    "date": "2028-10-28",
    "horaire": "ete",
    "remarque": null,
    "evenement": "Hike",
    "occupation": "Soirée pyjama (Local)",
    "rangement": "Réunion d'unité",
    "sections": {
      "nutons": {
        "libelle": "Relâche",
        "type": "relache"
      },
      "lutins": {
        "libelle": "Réunion de patrouille",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "Réunion Patrouilles",
        "type": "normale"
      }
    }
  },
  {
    "date": "2028-11-04",
    "horaire": "ete",
    "remarque": null,
    "evenement": "RN",
    "occupation": "Hike",
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "RN",
        "type": "normale"
      },
      "lutins": {
        "libelle": "RN",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "Relâche",
        "type": "relache"
      },
      "scouts": {
        "libelle": "BeerPong",
        "type": "normale"
      }
    }
  },
  {
    "date": "2028-11-11",
    "horaire": "hiver",
    "remarque": null,
    "evenement": "Relâche",
    "occupation": "RN",
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Hike",
        "type": "hike"
      },
      "lutins": {
        "libelle": "Hike",
        "type": "hike"
      },
      "louveteaux": {
        "libelle": "RN",
        "type": "normale"
      }
    }
  },
  {
    "date": "2028-11-18",
    "horaire": "hiver",
    "remarque": null,
    "evenement": "Grande sortie",
    "occupation": "RN + réu co-siz 17h-21h",
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "RN",
        "type": "normale"
      },
      "lutins": {
        "libelle": "RN",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "Grande Sortie",
        "type": "grande-sortie"
      }
    }
  },
  {
    "date": "2028-11-25",
    "horaire": "hiver",
    "remarque": null,
    "evenement": "RN",
    "occupation": "Grande Sortie",
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "RN",
        "type": "normale"
      },
      "lutins": {
        "libelle": "RN",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "Tartouf (9h - 17h30) local occupé",
        "type": "normale"
      }
    }
  },
  {
    "date": "2028-12-02",
    "horaire": "hiver",
    "remarque": null,
    "evenement": "RN",
    "occupation": "RN",
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Grande Sortie",
        "type": "grande-sortie"
      },
      "lutins": {
        "libelle": "RN",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "RN",
        "type": "normale"
      },
      "scouts": {
        "libelle": "Hackathon2 (03/12)",
        "type": "normale"
      }
    }
  },
  {
    "date": "2028-12-09",
    "horaire": "hiver",
    "remarque": null,
    "evenement": "Réu St Nicolas",
    "occupation": "RN",
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Réunion St Nicolas (local)",
        "type": "normale"
      },
      "lutins": {
        "libelle": "Grande sortie Saint Nicolas",
        "type": "grande-sortie"
      },
      "louveteaux": {
        "libelle": "Relâche",
        "type": "relache"
      }
    }
  },
  {
    "date": "2029-02-10",
    "horaire": "hiver",
    "remarque": null,
    "evenement": null,
    "occupation": "RN",
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "RN",
        "type": "normale"
      },
      "lutins": {
        "libelle": "RN",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "RN",
        "type": "normale"
      },
      "guides": {
        "libelle": "RN (prépa camp)",
        "type": "normale"
      }
    }
  },
  {
    "date": "2029-02-17",
    "horaire": "hiver",
    "remarque": "Soumonce en batterie",
    "evenement": null,
    "occupation": "Relâche",
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "RN",
        "type": "normale"
      },
      "lutins": {
        "libelle": "RN",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "RN",
        "type": "normale"
      },
      "guides": {
        "libelle": "RN (prépa camp)",
        "type": "normale"
      }
    }
  },
  {
    "date": "2029-02-24",
    "horaire": "ete",
    "remarque": null,
    "evenement": null,
    "occupation": "RN",
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Réunion spéciale (Namur)",
        "type": "speciale"
      },
      "lutins": {
        "libelle": "RN",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "RN",
        "type": "normale"
      },
      "guides": {
        "libelle": "RN (prépa camp)",
        "type": "normale"
      }
    }
  },
  {
    "date": "2029-03-02",
    "horaire": "ete",
    "remarque": "Soumonce en musique",
    "evenement": null,
    "occupation": "RN",
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "RN",
        "type": "normale"
      },
      "lutins": {
        "libelle": "relâche",
        "type": "relache"
      },
      "louveteaux": {
        "libelle": "R de patrouille",
        "type": "normale"
      },
      "guides": {
        "libelle": "RN (prépa camp) + Réu parents",
        "type": "normale"
      }
    }
  },
  {
    "date": "2029-03-09",
    "horaire": "ete",
    "remarque": null,
    "evenement": null,
    "occupation": "RN",
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "RN - Arc en Ciel",
        "type": "normale"
      },
      "lutins": {
        "libelle": "RN",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "Grande sortie",
        "type": "grande-sortie"
      },
      "guides": {
        "libelle": "Arc en ciel (+ hike nuton)",
        "type": "hike"
      }
    }
  },
  {
    "date": "2029-03-16",
    "horaire": "ete",
    "remarque": "Soumonce générale",
    "evenement": null,
    "occupation": "Scout Silver Cup",
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "RN",
        "type": "normale"
      },
      "lutins": {
        "libelle": "RN",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "RN",
        "type": "normale"
      },
      "guides": {
        "libelle": "Relâche (+ Silver Cup)",
        "type": "relache"
      }
    }
  },
  {
    "date": "2029-03-23",
    "horaire": "ete",
    "remarque": null,
    "evenement": null,
    "occupation": "Hike",
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Hike",
        "type": "hike"
      },
      "lutins": {
        "libelle": "LASAGNE ( local occupé ð)",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "R Trot",
        "type": "normale"
      },
      "guides": {
        "libelle": "Animation en section (+ hike loup et lu)",
        "type": "hike"
      }
    }
  },
  {
    "date": "2029-03-30",
    "horaire": "ete",
    "remarque": "Cavalcade (Di 31 & Lu 01/04)",
    "evenement": null,
    "occupation": "RN",
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "RN",
        "type": "normale"
      },
      "lutins": {
        "libelle": "relâche",
        "type": "relache"
      },
      "louveteaux": {
        "libelle": "RN",
        "type": "normale"
      },
      "guides": {
        "libelle": "Cavalcade",
        "type": "normale"
      }
    }
  },
  {
    "date": "2029-04-06",
    "horaire": "ete",
    "remarque": null,
    "evenement": null,
    "occupation": "RN",
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Relâche",
        "type": "relache"
      },
      "lutins": {
        "libelle": "hike (occupation du local du 5 ou 6 soirée cpsp)",
        "type": "hike"
      },
      "louveteaux": {
        "libelle": "Réunion vélo",
        "type": "normale"
      },
      "guides": {
        "libelle": "RN (Formation_1er soins)",
        "type": "normale"
      }
    }
  },
  {
    "date": "2029-04-13",
    "horaire": "ete",
    "remarque": null,
    "evenement": null,
    "occupation": "RN + réu cosiz cinéma",
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Soiré pyjama (17h30-21h30) au local",
        "type": "normale"
      },
      "lutins": {
        "libelle": "RN",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "RN",
        "type": "normale"
      },
      "guides": {
        "libelle": "Hike pio",
        "type": "hike"
      }
    }
  },
  {
    "date": "2029-04-20",
    "horaire": "ete",
    "remarque": null,
    "evenement": null,
    "occupation": "RN",
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Grande sortie",
        "type": "grande-sortie"
      },
      "lutins": {
        "libelle": "Gala (local à partir de 17h30 )",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "Hike traqueur",
        "type": "hike"
      },
      "guides": {
        "libelle": "Grande sortie",
        "type": "grande-sortie"
      }
    }
  },
  {
    "date": "2029-04-27",
    "horaire": "ete",
    "remarque": null,
    "evenement": null,
    "occupation": "RN",
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "Car wash",
        "type": "normale"
      },
      "lutins": {
        "libelle": "Grande sortie",
        "type": "grande-sortie"
      },
      "louveteaux": {
        "libelle": "R de patrouille",
        "type": "normale"
      },
      "guides": {
        "libelle": "Relâche (soirée pio la veille)",
        "type": "relache"
      },
      "scouts": {
        "libelle": "Beer Pong",
        "type": "normale"
      }
    }
  },
  {
    "date": "2029-05-04",
    "horaire": "ete",
    "remarque": null,
    "evenement": null,
    "occupation": "RN",
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "RN",
        "type": "normale"
      },
      "lutins": {
        "libelle": "RN",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "relâche",
        "type": "relache"
      },
      "guides": {
        "libelle": "Animation en section",
        "type": "normale"
      }
    }
  },
  {
    "date": "2029-05-11",
    "horaire": "ete",
    "remarque": "Soviet Fun Fest",
    "evenement": null,
    "occupation": "RN",
    "rangement": null,
    "sections": {
      "nutons": {
        "libelle": "RN + réunion info parents 13h",
        "type": "normale"
      },
      "lutins": {
        "libelle": "RN",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "SovietFunFest",
        "type": "normale"
      },
      "guides": {
        "libelle": "Relâche (job dimanche)",
        "type": "relache"
      },
      "scouts": {
        "libelle": "12/05 : Marche Adeps",
        "type": "normale"
      }
    }
  },
  {
    "date": "2029-05-18",
    "horaire": "ete",
    "remarque": null,
    "evenement": null,
    "occupation": null,
    "rangement": null,
    "sections": {
      "lutins": {
        "libelle": "x",
        "type": "normale"
      },
      "louveteaux": {
        "libelle": "RN",
        "type": "normale"
      },
      "guides": {
        "libelle": "Bbq fin d'année",
        "type": "normale"
      }
    }
  },
  {
    "date": "2029-05-25",
    "horaire": "ete",
    "remarque": null,
    "evenement": null,
    "occupation": null,
    "rangement": null,
    "sections": {
      "lutins": {
        "libelle": "Réunion parent camp",
        "type": "normale"
      }
    }
  }
]
