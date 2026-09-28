// Planning de la saison 2026-2027, transcrit depuis le classeur
// « [HE16] Planning Annuel Réunions — toutes sections » partagé par
// scout.fleu@gmail.com. Source unique de vérité : le classeur. Ce fichier
// est une copie figée, à remplacer par une lecture des flux iCal que le
// classeur génère déjà (voir composables/usePlanning.ts).
//
// Repris le 28/09/2026. La première importation était fausse deux fois :
//   - elle datait les réunions d'un dimanche, alors qu'elles ont lieu le
//     samedi après-midi (mails aux parents, page Facebook de l'unité) ;
//   - elle avait avalé les saisons suivantes du classeur, datées jusqu'en
//     2029. Elles ont été retirées.
// Les 32 dates ci-dessous sont donc décalées d'un jour par rapport à
// l'import d'origine. Le 5 septembre en portes ouvertes et le week-end
// d'unité du 12 recoupent ce qu'annonce l'unité. À confirmer contre le
// classeur dès que le staff d'unité le repartage : les libellés de section,
// eux, viennent d'une saison antérieure.

// Les types vivent dans shared/planning.ts : le navigateur en a besoin pour
// afficher ce que l'API lui envoie, mais il ne doit jamais recevoir les dates.
export type { TypeReunion, JourPlanning } from '../../shared/planning'
import type { JourPlanning } from '../../shared/planning'

export const saison = '2026-2027'

export const planning: JourPlanning[] = [
  {
    "date": "2026-09-05",
    "horaire": "ete",
    "remarque": null,
    "evenement": "Portes Ouvertes + CU",
    "occupation": null,
    "rangement": null,
    "sections": {}
  },
  {
    "date": "2026-09-12",
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
      "horizons": {
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
    "date": "2026-09-19",
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
      "horizons": {
        "libelle": "RN : Réunion normale + bbq",
        "type": "normale"
      }
    }
  },
  {
    "date": "2026-09-26",
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
      "horizons": {
        "libelle": "Réunion Normale",
        "type": "normale"
      }
    }
  },
  {
    "date": "2026-10-03",
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
      "horizons": {
        "libelle": "RN : Animation section",
        "type": "normale"
      }
    }
  },
  {
    "date": "2026-10-10",
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
      "horizons": {
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
    "date": "2026-10-17",
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
      "horizons": {
        "libelle": "Réunion Normale",
        "type": "normale"
      }
    }
  },
  {
    "date": "2026-10-24",
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
      "horizons": {
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
    "date": "2026-10-31",
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
      "horizons": {
        "libelle": "Relâche",
        "type": "relache"
      }
    }
  },
  {
    "date": "2026-11-07",
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
      "horizons": {
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
    "date": "2026-11-14",
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
      "horizons": {
        "libelle": "Bar : Bar pio",
        "type": "bar"
      }
    }
  },
  {
    "date": "2026-11-21",
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
      "horizons": {
        "libelle": "Hike",
        "type": "hike"
      }
    }
  },
  {
    "date": "2026-11-28",
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
      "horizons": {
        "libelle": "RS : Grande sortie",
        "type": "grande-sortie"
      }
    }
  },
  {
    "date": "2026-12-05",
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
      "horizons": {
        "libelle": "RS : Saint nicolas",
        "type": "speciale"
      }
    }
  },
  {
    "date": "2026-12-19",
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
      "horizons": {
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
    "date": "2026-12-26",
    "horaire": null,
    "remarque": "Vacances d'hiver (Noël)",
    "evenement": null,
    "occupation": null,
    "rangement": null,
    "sections": {}
  },
  {
    "date": "2027-01-02",
    "horaire": null,
    "remarque": "Vacances d'hiver (Noël)",
    "evenement": null,
    "occupation": null,
    "rangement": null,
    "sections": {}
  },
  {
    "date": "2027-02-06",
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
    "date": "2027-02-13",
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
    "date": "2027-02-20",
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
    "date": "2027-02-27",
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
    "date": "2027-03-06",
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
    "date": "2027-03-13",
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
    "date": "2027-03-20",
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
    "date": "2027-03-27",
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
    "date": "2027-04-03",
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
    "date": "2027-04-10",
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
    "date": "2027-04-17",
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
    "date": "2027-04-24",
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
    "date": "2027-05-01",
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
    "date": "2027-05-08",
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
    "date": "2027-05-15",
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
]
