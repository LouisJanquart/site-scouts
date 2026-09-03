// Changer la clé des flux iCal.
//
// Utile quand on a partagé l'adresse par erreur : la nouvelle clé coupe tous
// les abonnements existants de ce compte. C'est le but, et il faut le dire.
export default defineEventHandler(async (event) => {
  const u = exigerSession(event)
  const cle = await renouvelerCleCalendrier(u.id)
  await journaliser(event, 'modification', 'cle-calendrier', u.id)
  return { cle }
})
