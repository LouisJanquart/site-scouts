<script setup lang="ts">
// Le formulaire d'une actu, pour la création comme pour la modification.
// Il ne parle pas au serveur : il édite le brouillon et dit à la page ce que
// le staff veut en faire.
const brouillon = defineModel<Record<string, any>>({ required: true })

const props = defineProps<{
  titreFormulaire: string
  sectionsPossibles: string[]
  pourLUnite: boolean
  publics: { cle: string; nom: string; aide: string }[]
  erreurs: Record<string, string>
  souci: string | null
  enCours: boolean
  statutActuel?: string
  supprimable?: boolean
}>()

const emit = defineEmits<{
  enregistrer: [statut: 'brouillon' | 'publie']
  annuler: []
  supprimer: []
}>()

const { nomDeSection } = usePortee()

function basculer(slug: string) {
  const s: string[] = brouillon.value.sections
  brouillon.value.sections = s.includes(slug) ? s.filter((x) => x !== slug) : [...s, slug]
}

// Un chef doit cocher au moins sa section ; une actu sans section parle au nom
// de l'unité, et ça, seul le staff d'unité peut le faire.
const sansSection = computed(() => !brouillon.value.sections.length)
const bloque = computed(() => props.enCours || (sansSection.value && !props.pourLUnite))
</script>

<template>
  <form class="formulaire-publication groupe" @submit.prevent="emit('enregistrer', 'publie')">
    <h2 class="groupe__titre">{{ titreFormulaire }}</h2>

    <p v-if="souci" class="alerte alerte--erreur">{{ souci }}</p>

    <div class="grille-champs">
      <label class="champ plein" :class="{ 'champ--erreur': erreurs.titre }">
        <span class="champ__etiquette">Titre<span aria-hidden="true">*</span></span>
        <input v-model="brouillon.titre" class="saisie" type="text" required maxlength="160" />
        <span v-if="erreurs.titre" class="champ__erreur">{{ erreurs.titre }}</span>
      </label>

      <label class="champ" :class="{ 'champ--erreur': erreurs.date }">
        <span class="champ__etiquette">Date<span aria-hidden="true">*</span></span>
        <input v-model="brouillon.date" class="saisie" type="date" required />
        <span class="champ__aide">Sert à trier les actus, la plus récente en haut.</span>
      </label>

      <label class="champ">
        <span class="champ__etiquette">Qui peut la lire</span>
        <select v-model="brouillon.public" class="saisie">
          <option v-for="p in publics" :key="p.cle" :value="p.cle">{{ p.nom }}</option>
        </select>
        <span class="champ__aide">{{ publics.find((p) => p.cle === brouillon.public)?.aide }}</span>
      </label>
    </div>

    <fieldset class="champ">
      <legend class="champ__etiquette">Sections concernées</legend>
      <div class="puces">
        <button
          v-for="s in sectionsPossibles"
          :key="s"
          type="button"
          class="puce"
          :class="{ 'puce--actif': brouillon.sections.includes(s) }"
          :data-section="s"
          :aria-pressed="brouillon.sections.includes(s)"
          @click="basculer(s)"
        >
          {{ nomDeSection(s) }}
        </button>
      </div>
      <span v-if="pourLUnite" class="champ__aide">
        Aucune section cochée : l’actu parle au nom de toute l’unité.
      </span>
      <span v-else-if="sansSection" class="champ__erreur">Coche ta section.</span>
    </fieldset>

    <label class="champ" :class="{ 'champ--erreur': erreurs.chapo }">
      <span class="champ__etiquette">Chapô</span>
      <textarea v-model="brouillon.chapo" class="saisie" rows="2" maxlength="400" />
      <span class="champ__aide">Une ou deux phrases, affichées dans la liste des actus.</span>
    </label>

    <label class="champ" :class="{ 'champ--erreur': erreurs.corps }">
      <span class="champ__etiquette">Texte</span>
      <textarea v-model="brouillon.corps" class="saisie" rows="8" maxlength="8000" />
      <span class="champ__aide">Une ligne vide entre deux paragraphes.</span>
    </label>

    <div class="actions">
      <button class="bouton bouton--principal" type="submit" :disabled="bloque">
        {{ enCours ? 'Enregistrement…' : statutActuel === 'publie' ? 'Enregistrer' : 'Publier' }}
      </button>
      <button
        class="bouton bouton--fantome"
        type="button"
        :disabled="bloque"
        @click="emit('enregistrer', 'brouillon')"
      >
        {{ statutActuel === 'publie' ? 'Retirer du site (brouillon)' : 'Garder en brouillon' }}
      </button>
      <button class="bouton bouton--fantome" type="button" @click="emit('annuler')">Annuler</button>
      <button
        v-if="supprimable"
        class="bouton bouton--fantome bouton--danger"
        type="button"
        @click="emit('supprimer')"
      >
        <UiIcone nom="poubelle" :taille="15" />
        Supprimer
      </button>
    </div>
  </form>
</template>
