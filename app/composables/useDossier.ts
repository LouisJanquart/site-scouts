import type { Dossier } from '#shared/inscription'

// ---------------------------------------------------------------------------
// Le brouillon d'inscription.
//
// Le formulaire est long — c'est inévitable, on demande une fiche santé et huit
// autorisations. Perdre la saisie parce qu'un enfant a fermé l'onglet serait
// cruel : le brouillon est donc conservé dans le navigateur.
//
// Mais PAS en entier. Deux blocs ne sont jamais écrits sur le disque :
//   - la fiche santé, parce qu'un ordinateur familial est un ordinateur
//     partagé, et que les allergies d'un enfant n'ont rien à faire dans le
//     stockage d'un navigateur ;
//   - le mot de passe, pour des raisons évidentes.
// Le formulaire prévient l'utilisateur que ces deux blocs sont à ressaisir.
// ---------------------------------------------------------------------------

const CLE = '16e-inscription-brouillon'

export type Brouillon = Partial<Dossier> & {
  enfant: Dossier['enfant']
  responsables: Dossier['responsables']
  contactsUrgence: Dossier['contactsUrgence']
  sante: Dossier['sante']
  consentements: Record<string, boolean>
}

export function dossierVide(): Brouillon {
  return {
    enfant: {
      prenom: '', nom: '', dateNaissance: '', genre: undefined,
      adresse: { rue: '', numero: '', codePostal: '', localite: '', pays: 'BE' },
      email: '', telephone: '', sectionSlug: '',
    },
    responsables: [
      {
        lien: 'parent', prenom: '', nom: '', email: '', telephone: '',
        autoriteParentale: true, destinataireFacture: true, memeAdresseQueLEnfant: true,
      },
    ],
    contactsUrgence: [],
    sante: { allergies: [], regimesAlimentaires: [], traitements: [] },
    consentements: {},
    remarqueFamille: '',
    motDePasse: '',
  }
}

export function useDossier() {
  const dossier = useState<Brouillon>('dossier-inscription', dossierVide)
  const etape = useState<number>('dossier-etape', () => 0)
  const brouillonRetrouve = ref(false)

  function restaurer() {
    try {
      const brut = localStorage.getItem(CLE)
      if (!brut) return
      const enregistre = JSON.parse(brut)
      // La santé et le mot de passe ne sont jamais relus : ils n'ont pas été
      // écrits. On les laisse vides, et on le dit.
      dossier.value = {
        ...dossierVide(),
        ...enregistre,
        sante: dossierVide().sante,
        motDePasse: '',
      }
      brouillonRetrouve.value = true
    } catch {
      // stockage indisponible : tant pis, on repart de zéro
    }
  }

  function enregistrer() {
    try {
      const { sante: _sante, motDePasse: _mdp, ...reste } = dossier.value
      localStorage.setItem(CLE, JSON.stringify(reste))
    } catch {
      // rien à faire : le brouillon ne vaut que pour cette page
    }
  }

  function oublier() {
    try {
      localStorage.removeItem(CLE)
    } catch {
      /* vide */
    }
    dossier.value = dossierVide()
    etape.value = 0
  }

  return { dossier, etape, brouillonRetrouve, restaurer, enregistrer, oublier }
}
