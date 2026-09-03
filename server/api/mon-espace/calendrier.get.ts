// L'adresse personnelle des flux iCal, avec la clé du compte.
export default defineEventHandler(async (event) => {
  const u = exigerSession(event)
  const cle = await cleCalendrier(u.id)
  return { cle }
})
