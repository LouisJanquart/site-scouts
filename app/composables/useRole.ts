// Quatre publics, quatre vues.
//
// Depuis qu'il y a de vrais comptes, ce composable ne DÉCIDE plus rien : il
// reflète. Le rôle vient de la session, donc du serveur, et le sélecteur en bas
// de l'écran n'est plus qu'un outil d'aperçu, réservé aux visiteurs non
// connectés et à la mise au point.
//
// Ce qu'il masque n'est toujours pas protégé — c'est de l'affichage. La
// protection est ailleurs : dans server/utils/droits.ts, appliquée à chaque
// requête. Voir aussi la note en tête de app/data/staff.ts.

export type Role = 'visiteur' | 'parent' | 'anime' | 'chef'

export interface DefinitionRole {
  cle: Role
  nom: string
  description: string
  icone: string
}

export const rolesDisponibles: DefinitionRole[] = [
  {
    cle: 'visiteur',
    nom: 'Visiteur',
    description: "Quelqu'un qui découvre l'unité. Ne voit que les pages publiques.",
    icone: 'profil',
  },
  {
    cle: 'parent',
    nom: 'Parent',
    description: "Voit en plus les contacts des staffs, les documents et les photos.",
    icone: 'main',
  },
  {
    cle: 'anime',
    nom: 'Animé',
    description: 'Voit sa section, les photos et les ressources qui le concernent.',
    icone: 'etoile',
  },
  {
    cle: 'chef',
    nom: 'Chef',
    description: "Accès complet : documents de staff, comptes rendus, ressources d'animation.",
    icone: 'bouclier',
  },
]

const CLE_STOCKAGE = '16e-role'

export function useRole() {
  const role = useState<Role>('role', () => 'visiteur')

  const { moi, charger } = useCompte()

  // Le rôle réel l'emporte toujours sur l'aperçu local.
  const roleDuCompte = computed<Role | null>(() => {
    const r = moi.value?.roles ?? []
    if (!moi.value?.connecte) return null
    if (r.some((x) => x.role === 'cu' || x.role === 'chef')) return 'chef'
    if (r.some((x) => x.role === 'parent')) return 'parent'
    if (r.some((x) => x.role === 'anime')) return 'anime'
    return 'parent'
  })

  watch(roleDuCompte, (v) => {
    if (v) role.value = v
  })

  // Restauration à la volée, protégée : certains contextes (navigation privée,
  // stockage désactivé) font lever une exception au simple accès.
  onMounted(async () => {
    await charger()
    if (roleDuCompte.value) {
      role.value = roleDuCompte.value
      return
    }
    try {
      const enregistre = localStorage.getItem(CLE_STOCKAGE) as Role | null
      if (enregistre && rolesDisponibles.some((r) => r.cle === enregistre)) {
        role.value = enregistre
      }
    } catch {
      // tant pis, on reste sur « visiteur »
    }
  })

  function definirRole(nouveau: Role) {
    role.value = nouveau
    try {
      localStorage.setItem(CLE_STOCKAGE, nouveau)
    } catch {
      // sans persistance, le choix ne vaut que pour la session
    }
  }

  const estConnecte = computed(() => role.value !== 'visiteur')
  const estChef = computed(() => role.value === 'chef')
  const voitLesContacts = computed(() => role.value !== 'visiteur')
  const voitLesPhotos = computed(() => role.value !== 'visiteur')
  const voitLesDocumentsStaff = computed(() => role.value === 'chef')

  // Le calendrier des sections est réservé aux familles. Un visiteur voit que
  // l'unité se réunit le dimanche et à quelle heure, pas ce que chaque section
  // fait chaque semaine.
  const voitLeCalendrier = computed(() => role.value !== 'visiteur')
  const voitLeStaff = computed(() => role.value !== 'visiteur')
  const voitLesEvenementsInternes = computed(() => role.value !== 'visiteur')

  const definition = computed(
    () => rolesDisponibles.find((r) => r.cle === role.value) ?? rolesDisponibles[0]!,
  )

  // Le sélecteur d'aperçu n'a de sens que hors connexion : un chef connecté ne
  // doit pas pouvoir « se mettre en visiteur » et croire que c'est ce que voit
  // vraiment un visiteur.
  const apercuPossible = computed(() => !moi.value?.connecte)

  return {
    role,
    apercuPossible,
    definition,
    definirRole,
    estConnecte,
    estChef,
    voitLesContacts,
    voitLesPhotos,
    voitLesDocumentsStaff,
    voitLeCalendrier,
    voitLeStaff,
    voitLesEvenementsInternes,
  }
}
