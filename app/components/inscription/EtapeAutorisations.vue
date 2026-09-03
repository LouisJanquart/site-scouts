<script setup lang="ts">
import { consentementsCatalogue, type GroupeConsentement } from '#shared/consentements'

defineProps<{ champs: Record<string, string> }>()
const { dossier } = useDossier()

const groupes: { cle: GroupeConsentement; titre: string; chapo: string }[] = [
  {
    cle: 'participation',
    titre: 'Participation',
    chapo: 'Ce que votre enfant a le droit de faire avec nous.',
  },
  {
    cle: 'sante',
    titre: 'Santé',
    chapo: 'Ce que le staff a le droit de faire s’il arrive quelque chose.',
  },
  {
    cle: 'image',
    titre: 'Photos et vidéos',
    chapo:
      'Une case par usage. Vous pouvez tout accepter, tout refuser, ou n’accepter que l’interne — c’est fréquent et ça ne pose aucun problème. Chaque réponse est révocable à tout moment depuis votre espace.',
  },
  {
    cle: 'donnees',
    titre: 'Vos données',
    chapo: 'Ce que nous faisons des informations que vous venez de nous confier.',
  },
]

function parGroupe(g: GroupeConsentement) {
  return consentementsCatalogue.filter((c) => c.groupe === g)
}
</script>

<template>
  <div class="pile">
    <div class="alerte alerte--info">
      <UiIcone nom="info" :taille="18" />
      <span>
        Aucune case n’est pré-cochée : c’est vous qui décidez, ligne par ligne. Les cases marquées
        d’une étoile sont indispensables — sans elles, nous n’avons pas le droit d’accueillir
        votre enfant.
      </span>
    </div>

    <section v-for="g in groupes" :key="g.cle" class="groupe">
      <h2 class="groupe__titre">{{ g.titre }}</h2>
      <p class="groupe__chapo">{{ g.chapo }}</p>

      <div class="pile">
        <UiCase
          v-for="c in parGroupe(g.cle)"
          :key="c.cle"
          v-model="dossier.consentements[c.cle]"
          :titre="c.titre"
          :texte="c.texte"
          :consequence="c.siRefus"
          :obligatoire="c.obligatoire"
        />
      </div>
    </section>

    <p v-if="champs.consentements" class="alerte alerte--erreur" role="alert">
      <UiIcone nom="alerte" :taille="18" /><span>{{ champs.consentements }}</span>
    </p>
  </div>
</template>
