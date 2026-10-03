<script setup lang="ts">
import { parSlug } from '~/data/sections'

const route = useRoute()
const { aujourdhui } = usePlanning()
// La liste est déjà filtrée par le serveur : si l'événement n'y est pas, c'est
// soit qu'il n'existe pas, soit qu'on n'y a pas droit — et de l'extérieur, les
// deux se ressemblent, ce qui est voulu.
const { evenements, chargement } = useContenu()

const evenement = computed(() =>
  evenements.value.find((e: any) => e.slug === String(route.params.slug)),
)
const autorise = computed(() => Boolean(evenement.value))

const passe = computed(() =>
  evenement.value
    ? (evenement.value.dateFin ?? evenement.value.date) < aujourdhui.value
    : false,
)

// Un fichier .ics généré à la volée, pour ajouter la date à son agenda sans
// que l'unité ait à publier quoi que ce soit.
const lienIcs = computed(() => {
  const e = evenement.value!
  const d = e.date.replace(/-/g, '')
  const fin = (e.dateFin ?? e.date).replace(/-/g, '')
  const finPlusUn = (() => {
    const x = new Date((e.dateFin ?? e.date) + 'T12:00:00')
    x.setDate(x.getDate() + 1)
    return x.toISOString().slice(0, 10).replace(/-/g, '')
  })()
  const lignes = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//16e Fleurus//FR',
    'BEGIN:VEVENT',
    `UID:${e.slug}@16efleurus`,
    `DTSTART;VALUE=DATE:${d}`,
    `DTEND;VALUE=DATE:${finPlusUn}`,
    `SUMMARY:${e.titre} — 16e Fleurus`,
    `LOCATION:${e.lieu.replace(/,/g, '\\,')}`,
    `DESCRIPTION:${e.resume.replace(/,/g, '\\,')}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return 'data:text/calendar;charset=utf-8,' + encodeURIComponent(lignes.join('\r\n'))
})

const pourQui = computed(() => {
  const p = evenement.value?.public
  return p === 'tous' ? 'Tout le monde' : p === 'parents' ? 'Les familles' : p === 'animes' ? 'Les animés' : 'Les chefs'
})

const quand = computed(() => {
  const e = evenement.value
  if (!e) return ''
  const debut = majuscule(formaterDate(e.date, true))
  return e.dateFin ? `${debut} → ${formaterDate(e.dateFin, true)}` : debut
})

useHead(() => ({ title: `${evenement.value?.titre} — 16e Fleurus` }))
</script>

<template>
  <AppPage v-if="evenement" :titre="evenement.titre" bento>
    <template #hero>
      <UiTete
        :titre="evenement.titre"
        :etiquette="quand"
        :photo="autorise ? evenement.photo : null"
        :icone="evenement.section ? parSlug[evenement.section]?.icone : 'calendrier'"
        :retour="{ to: '/events', texte: 'Tous les events' }"
        :data-section="evenement.section ?? undefined"
      >
        <p v-if="passe" class="passe">
          <UiIcone nom="horloge" :taille="16" />
          Cet événement a déjà eu lieu.
        </p>
        <p v-if="autorise" class="resume">{{ evenement.resume }}</p>
      </UiTete>
    </template>

    <UiBloc v-if="!autorise" etiquette="Réservé aux familles">
      <div class="reserve">
        <UiIcone nom="cadenas" :taille="20" />
        <div>
          <p class="reserve__titre">Ce rendez-vous ne concerne que la 16e</p>
          <p class="reserve__texte">
            Les événements ouverts à tout le monde sont sur la page des événements.
          </p>
          <NuxtLink class="lien-fleche reserve__lien" to="/events">
            Les rendez-vous ouverts à tous
            <UiIcone nom="chevrons-droite" :taille="14" />
          </NuxtLink>
        </div>
      </div>
    </UiBloc>

    <div v-else class="bento bento--etire">
      <UiBloc class="bento__5" etiquette="En bref" ton="section">
        <ul class="inventaire bref">
          <li><UiTuile libelle="Quand" :sous="evenement.heure ?? 'Toute la journée'" icone="horloge" /></li>
          <li><UiTuile libelle="Où" :sous="evenement.lieu" icone="lieu" /></li>
          <li><UiTuile libelle="Pour qui" :sous="pourQui" icone="groupe" /></li>
          <li v-if="evenement.section">
            <UiTuile
              libelle="Porté par"
              :sous="parSlug[evenement.section]?.nom"
              :icone="parSlug[evenement.section]?.icone"
              :to="`/sections/${evenement.section}`"
            />
          </li>
        </ul>
        <template v-if="!passe" #pied>
          <a class="bouton bouton--principal" :href="lienIcs" :download="`${evenement.slug}.ics`">
            <UiIcone nom="calendrier" :taille="18" />
            Ajouter à mon agenda
          </a>
        </template>
      </UiBloc>

      <UiBloc class="bento__7" etiquette="Le programme">
        <div class="prose">
          <p>{{ evenement.description }}</p>
        </div>
        <p v-if="evenement.inscription && !passe" class="inscription">
          Les inscriptions ne passent pas encore par le site. En attendant, écrivez à
          <a href="mailto:scout.fleu@gmail.com">scout.fleu@gmail.com</a>.
        </p>
      </UiBloc>
    </div>
  </AppPage>
</template>

<style lang="scss" scoped>
.resume {
  flex: 1 1 100%;
  max-inline-size: 40rem;
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.6;
  color: rgba($blanc, 0.76);
}

.passe {
  display: inline-flex;
  align-items: center;
  gap: $esp-1;
  margin: 0;
  padding: 0.4rem 0.9rem;
  background: $ardoise-sourd;
  border-radius: $r-pilule;
  font-size: 0.9rem;
  color: rgba($blanc, 0.8);
}

.bref {
  flex: 1;
  grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
  grid-auto-rows: minmax(7rem, 1fr);
}

.inscription {
  padding: $esp-2 $esp-3;
  background: $ardoise-sourd;
  border-radius: $r-champ;
  line-height: 1.55;
  color: rgba($blanc, 0.75);

  a {
    color: $cyan;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
}
</style>
