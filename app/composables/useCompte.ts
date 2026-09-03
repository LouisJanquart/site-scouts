// ---------------------------------------------------------------------------
// Le compte connecté, côté navigateur.
//
// La vérité est côté serveur : ce composable n'est qu'un miroir, utile pour
// afficher le bon menu et rediriger vite. Il ne protège rien. Chaque route de
// l'API refait le contrôle pour son compte — c'est la règle, et elle vaut aussi
// pour les pages qui « ont l'air » privées.
// ---------------------------------------------------------------------------

export interface Moi {
  connecte: boolean
  prenom?: string
  nom?: string
  email?: string
  roles?: { role: string; sectionSlug: string | null }[]
}

export function useCompte() {
  const moi = useState<Moi | null>('moi', () => null)
  const charge = useState<boolean>('moi-charge', () => false)

  async function charger(forcer = false) {
    if (charge.value && !forcer) return moi.value
    try {
      moi.value = await $fetch<Moi>('/api/auth/moi')
    } catch {
      moi.value = { connecte: false }
    }
    charge.value = true
    return moi.value
  }

  async function seDeconnecter() {
    await $fetch('/api/auth/deconnexion', { method: 'POST' }).catch(() => {})
    moi.value = { connecte: false }
    await navigateTo('/')
  }

  const connecte = computed(() => Boolean(moi.value?.connecte))
  const roles = computed(() => moi.value?.roles ?? [])
  const aLeRole = (...r: string[]) => roles.value.some((x) => r.includes(x.role))
  const estCU = computed(() => aLeRole('cu'))
  const estStaff = computed(() => aLeRole('chef', 'cu', 'tresorier'))
  const estParent = computed(() => aLeRole('parent'))
  const estAnime = computed(() => aLeRole('anime'))
  const mesSections = computed(() =>
    roles.value.filter((r) => r.role === 'chef' && r.sectionSlug).map((r) => r.sectionSlug!),
  )
  const nomAffiche = computed(() =>
    moi.value?.connecte ? `${moi.value.prenom} ${moi.value.nom}` : '',
  )

  return {
    moi, charger, seDeconnecter, connecte, roles, aLeRole,
    estCU, estStaff, estParent, estAnime, mesSections, nomAffiche,
  }
}
