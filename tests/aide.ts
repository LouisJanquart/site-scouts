import postgres from 'postgres'

export const ADRESSE = 'http://127.0.0.1:4610'
const URL_TEST = (process.env.NUXT_BASE_URL ?? 'postgres://claude@localhost:5433/fleurus').replace(
  /\/[^/]+$/,
  '/fleurus_test',
)

export const sql = postgres(URL_TEST, { max: 2 })

/** Un client HTTP qui garde son cookie de session, comme un navigateur. */
export function navigateur() {
  let cookie = ''
  return {
    get cookie() {
      return cookie
    },
    async appel(chemin: string, options: RequestInit = {}) {
      const r = await fetch(ADRESSE + chemin, {
        ...options,
        headers: {
          'content-type': 'application/json',
          ...(cookie ? { cookie } : {}),
          ...(options.headers ?? {}),
        },
      })
      const brut = r.headers.getSetCookie?.() ?? []
      for (const c of brut) {
        if (c.startsWith('fleurus_session=')) cookie = c.split(';')[0]!
      }
      const texte = await r.text()
      let corps: any = texte
      try {
        corps = JSON.parse(texte)
      } catch {
        /* pas du JSON */
      }
      return { statut: r.status, corps }
    },
  }
}

export async function ouvrirLaSaison() {
  await sql`
    insert into saisons (libelle, debut, fin, cotisation_centimes, cotisation_fratrie_centimes, active)
    values ('2026-2027', '2026-09-01', '2027-08-31', 8000, 6500, true)
    on conflict (libelle) do nothing
  `
}

/** Un dossier d'inscription complet et valide, à retoucher au besoin. */
export function dossier(prenom: string, nom: string, section = 'lutins', naissance = '2016-03-14') {
  return {
    enfant: {
      prenom, nom, dateNaissance: naissance, genre: 'f',
      adresse: { rue: 'Rue des Aviateurs', numero: '12', codePostal: '6220', localite: 'Fleurus', pays: 'BE' },
      email: '', telephone: '', sectionSlug: section,
    },
    responsables: [
      {
        lien: 'mere', prenom: 'Parent', nom,
        email: `${nom.toLowerCase()}@example.be`, telephone: '0470123456',
        autoriteParentale: true, destinataireFacture: true, memeAdresseQueLEnfant: true,
      },
    ],
    contactsUrgence: [],
    sante: {
      allergies: ['Arachides'], regimesAlimentaires: [], traitements: [],
      saitNager: false, antecedents: 'Asthme léger',
    },
    consentements: {
      reglement: true, participation: true, 'soins-medicaux': true, 'donnees-federation': true,
      'medicaments-courants': false, 'transport-vehicule': true, 'rentrer-seul': false,
      'image-interne': true, 'image-site': false, 'image-reseaux': false, 'image-presse': false,
      communications: true,
    },
    motDePasse: 'un-mot-de-passe-tres-long',
    politiqueLue: true,
  }
}

/** Donne un rôle à un compte, directement en base (le CU le ferait à la main). */
export async function donnerRole(email: string, role: string, sectionSlug: string | null = null) {
  await sql`
    insert into roles_compte (compte_id, role, section_slug)
    select id, ${role}, ${sectionSlug} from comptes where email = ${email}
  `
}
