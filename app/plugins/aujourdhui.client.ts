import { dateLocale, useAujourdhui } from '~/composables/usePlanning'

// La date du jour vient du navigateur, pas du prérendu. Sans ce plugin, la
// prochaine réunion, les events à venir, le calendrier et la météo restaient
// au jour où le site avait été construit.
//
// On attend que l'application soit montée pour ne pas casser l'hydratation :
// la page s'affiche d'abord telle qu'elle a été prérendue, puis se met à jour.
// Et on revérifie quand l'onglet revient au premier plan, pour qui le laisse
// ouvert jusqu'au lendemain.
export default defineNuxtPlugin((nuxtApp) => {
  const aujourdhui = useAujourdhui()
  const majour = () => {
    const d = dateLocale()
    if (aujourdhui.value !== d) aujourdhui.value = d
  }
  nuxtApp.hook('app:suspense:resolve', majour)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') majour()
  })
})
