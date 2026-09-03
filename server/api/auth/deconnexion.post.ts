export default defineEventHandler(async (event) => {
  await fermerSession(event)
  return { ok: true }
})
