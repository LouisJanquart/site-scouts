// La tâche planifiée, pour un serveur qui tourne en continu.
// Sur un hébergement sans serveur, c'est /api/taches/menage qui prend le relais.
// Les deux appellent le même code : voir server/utils/menage.ts.
export default defineTask({
  meta: {
    name: 'menage',
    description: 'Efface ce qui a dépassé sa durée de conservation.',
  },
  async run() {
    return { result: await fairePropre() }
  },
})
