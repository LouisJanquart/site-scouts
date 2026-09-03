<script setup lang="ts">
// Une liste déroulante. Même habillage que les champs texte.
defineProps<{
  etiquette: string
  nom: string
  options: { valeur: string; libelle: string }[]
  aide?: string
  erreur?: string
  obligatoire?: boolean
  vide?: string
}>()

const valeur = defineModel<string>({ default: '' })
const id = useId()
</script>

<template>
  <div class="champ" :class="{ 'champ--erreur': erreur }">
    <label class="champ__etiquette" :for="id">
      {{ etiquette }}<span v-if="obligatoire" aria-hidden="true">*</span>
    </label>
    <select
      :id="id"
      v-model="valeur"
      class="saisie"
      :name="nom"
      :required="obligatoire"
      :aria-invalid="erreur ? 'true' : undefined"
      :aria-describedby="erreur ? `${id}-erreur` : undefined"
    >
      <option v-if="vide" value="">{{ vide }}</option>
      <option v-for="o in options" :key="o.valeur" :value="o.valeur">{{ o.libelle }}</option>
    </select>
    <p v-if="aide" class="champ__aide">{{ aide }}</p>
    <p v-if="erreur" :id="`${id}-erreur`" class="champ__erreur">
      <UiIcone nom="alerte" :taille="14" />
      <span>{{ erreur }}</span>
    </p>
  </div>
</template>
