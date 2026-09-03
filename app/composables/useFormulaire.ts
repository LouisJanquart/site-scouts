// ---------------------------------------------------------------------------
// L'envoi d'un formulaire, et surtout le retour des erreurs.
//
// Le serveur renvoie deux choses : un message général, et un message par champ
// (data.champs). On range les deux ici, et la page les affiche là où il faut.
// C'est ce qui permet à un parent de voir « le code postal doit avoir quatre
// chiffres » sous le code postal, et pas dans un bandeau tout en haut.
// ---------------------------------------------------------------------------

export function useFormulaire() {
  const enCours = ref(false)
  const erreur = ref<string | null>(null)
  const champs = ref<Record<string, string>>({})

  function nettoyer() {
    erreur.value = null
    champs.value = {}
  }

  async function envoyer<T>(action: () => Promise<T>): Promise<T | null> {
    if (enCours.value) return null
    nettoyer()
    enCours.value = true
    try {
      return await action()
    } catch (e: any) {
      const d = e?.data
      erreur.value =
        d?.data?.message ??
        d?.statusMessage ??
        d?.message ??
        'Quelque chose s’est mal passé. Réessayez dans un instant.'
      champs.value = d?.data?.champs ?? {}
      // On remonte à la première erreur : sur un formulaire long, une erreur
      // hors écran est une erreur invisible.
      await nextTick()
      document
        .querySelector('[aria-invalid="true"], .alerte--erreur')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return null
    } finally {
      enCours.value = false
    }
  }

  return { enCours, erreur, champs, envoyer, nettoyer }
}
