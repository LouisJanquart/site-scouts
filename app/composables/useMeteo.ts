// La météo du prochain dimanche à Fleurus. Les maquettes montrent une icône
// de temps à côté de la date : autant qu'elle dise la vérité, puisque toutes
// les activités se font dehors.
//
// Open-Meteo est interrogé directement depuis le navigateur : pas de clé, pas
// de compte, pas de donnée personnelle envoyée. Si l'appel échoue, le bloc
// météo disparaît simplement au lieu d'afficher une valeur inventée.

const FLEURUS = { latitude: 50.4833, longitude: 4.55 }

// Correspondance entre les codes WMO d'Open-Meteo et le jeu d'icônes du site.
function icônePourCode(code: number): { icone: string; libelle: string } {
  if (code === 0) return { icone: 'soleil', libelle: 'Ciel dégagé' }
  if (code <= 2) return { icone: 'soleil', libelle: 'Peu nuageux' }
  if (code === 3) return { icone: 'nuage', libelle: 'Couvert' }
  if (code <= 48) return { icone: 'nuage', libelle: 'Brouillard' }
  if (code <= 57) return { icone: 'pluie', libelle: 'Bruine' }
  if (code <= 67) return { icone: 'pluie', libelle: 'Pluie' }
  if (code <= 77) return { icone: 'neige', libelle: 'Neige' }
  if (code <= 82) return { icone: 'pluie', libelle: 'Averses' }
  if (code <= 86) return { icone: 'neige', libelle: 'Averses de neige' }
  return { icone: 'pluie', libelle: 'Orage' }
}

export interface Meteo {
  icone: string
  libelle: string
  tempMax: number
  tempMin: number
  pluie: number
  date: string
}

export function useMeteo(dateCible?: Ref<string | undefined>) {
  const meteo = useState<Meteo | null>('meteo', () => null)
  const chargement = useState<boolean>('meteo-chargement', () => false)

  async function charger() {
    if (meteo.value || chargement.value) return
    chargement.value = true
    try {
      const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${FLEURUS.latitude}` +
        `&longitude=${FLEURUS.longitude}` +
        '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max' +
        '&timezone=Europe%2FBrussels&forecast_days=14'
      const reponse = await $fetch<any>(url)
      const jours: string[] = reponse?.daily?.time ?? []
      if (!jours.length) return

      const cible = dateCible?.value
      let i = cible ? jours.indexOf(cible) : 0
      if (i < 0) i = 0

      const { icone, libelle } = icônePourCode(reponse.daily.weather_code[i])
      meteo.value = {
        icone,
        libelle,
        tempMax: Math.round(reponse.daily.temperature_2m_max[i]),
        tempMin: Math.round(reponse.daily.temperature_2m_min[i]),
        pluie: reponse.daily.precipitation_probability_max?.[i] ?? 0,
        date: jours[i]!,
      }
    } catch {
      meteo.value = null
    } finally {
      chargement.value = false
    }
  }

  onMounted(charger)

  return { meteo, chargement }
}
