import { contenuVide, type ContenuReserve } from '~/composables/useContenu'

// ---------------------------------------------------------------------------
// Le chargement du contenu réservé, une fois par cycle de vie de la page.
//
// Pourquoi un plugin plutôt qu'un useFetch dans le composable : le contenu est
// demandé par une dizaine de composants, et il doit être demandé DEUX fois dans
// la vie d'une page prérendue —
//
//   au prérendu, sans session : la réponse « visiteur » part dans le HTML
//   publié, ce qui est exactement ce qu'on veut voir dans un fichier public ;
//
//   à l'arrivée dans le navigateur, avec le cookie : la réponse du compte
//   remplace la précédente.
//
// Sur le serveur on attend la réponse, puisqu'elle doit être écrite dans la
// page. Dans le navigateur on ne l'attend pas : la page s'affiche tout de suite
// avec la vue publique, et se complète quand la réponse arrive. Sur une base
// endormie, mieux vaut une page qui se complète qu'une page qui ne s'affiche
// pas.
// ---------------------------------------------------------------------------
export default defineNuxtPlugin(() => {
  const etat = useState<ContenuReserve>('contenu-reserve', contenuVide)

  const remplir = async () => {
    try {
      etat.value = await $fetch<ContenuReserve>('/api/contenu', {
        credentials: 'same-origin',
        // Dans le navigateur, on ne veut pas de la réponse gardée en cache :
        // celle d'un visiteur resservie après une connexion laissait le site
        // en vue publique le temps que le cache expire. Le serveur, lui, pose
        // « Vary: Cookie » pour les caches intermédiaires.
        ...(import.meta.client ? { cache: 'no-store' as RequestCache } : {}),
      })
    } catch {
      // Serveur ou base injoignable : on garde ce qu'on a. Les pages publiques
      // restent lisibles, c'est le but de les avoir prérendues.
    }
  }

  // Les sections suivent le même chemin : elles peuvent avoir été corrigées
  // depuis le back office, et le fichier du paquet ne le sait pas.
  const { charger: chargerLesSections } = useSections()

  if (import.meta.server) return Promise.all([remplir(), chargerLesSections()])
  remplir()
  chargerLesSections()
})
