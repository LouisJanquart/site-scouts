<script setup lang="ts">
// Le formulaire d'un événement, pour la création comme pour la modification.
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

const sansSection = computed(() => !brouillon.value.section)
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
      </label>

      <label class="champ" :class="{ 'champ--erreur': erreurs.dateFin }">
        <span class="champ__etiquette">Jusqu’au</span>
        <input v-model="brouillon.dateFin" class="saisie" type="date" :min="brouillon.date" />
        <span v-if="erreurs.dateFin" class="champ__erreur">{{ erreurs.dateFin }}</span>
        <span v-else class="champ__aide">Pour un camp ou un week-end. Sinon, laisser vide.</span>
      </label>

      <label class="champ">
        <span class="champ__etiquette">Heure</span>
        <input
          v-model="brouillon.heure"
          class="saisie"
          type="text"
          maxlength="40"
          placeholder="14:00 – 17:30"
        />
      </label>

      <label class="champ">
        <span class="champ__etiquette">Lieu</span>
        <input v-model="brouillon.lieu" class="saisie" type="text" maxlength="200" />
      </label>

      <label class="champ">
        <span class="champ__etiquette">Section</span>
        <select v-model="brouillon.section" class="saisie">
          <option v-if="pourLUnite" value="">Toute l’unité</option>
          <option v-for="s in sectionsPossibles" :key="s" :value="s">{{ nomDeSection(s) }}</option>
        </select>
      </label>

      <label class="champ">
        <span class="champ__etiquette">Qui peut le voir</span>
        <select v-model="brouillon.public" class="saisie">
          <option v-for="p in publics" :key="p.cle" :value="p.cle">{{ p.nom }}</option>
        </select>
        <span class="champ__aide">{{ publics.find((p) => p.cle === brouillon.public)?.aide }}</span>
      </label>
    </div>

    <label class="champ" :class="{ 'champ--erreur': erreurs.resume }">
      <span class="champ__etiquette">Résumé</span>
      <textarea v-model="brouillon.resume" class="saisie" rows="2" maxlength="400" />
      <span class="champ__aide">Une phrase, affichée sur la carte de l’événement.</span>
    </label>

    <label class="champ" :class="{ 'champ--erreur': erreurs.description }">
      <span class="champ__etiquette">Description</span>
      <textarea v-model="brouillon.description" class="saisie" rows="6" maxlength="8000" />
    </label>

    <div class="grille-champs">
      <label class="champ" :class="{ 'champ--erreur': erreurs.photo }">
        <span class="champ__etiquette">Photo</span>
        <input
          v-model="brouillon.photo"
          class="saisie"
          type="text"
          placeholder="/images/camp-prairie.jpg"
        />
        <span v-if="erreurs.photo" class="champ__erreur">{{ erreurs.photo }}</span>
        <span v-else class="champ__aide">Une image déjà sur le site. L’envoi de photos arrive avec le module Photos.</span>
      </label>

      <label class="case">
        <input v-model="brouillon.inscription" type="checkbox" />
        <span>Sur inscription</span>
      </label>
    </div>

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
