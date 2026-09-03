<script setup lang="ts">
// Un champ de formulaire : étiquette, saisie, aide, erreur.
//
// L'erreur est reliée au champ par aria-describedby, et le champ est marqué
// aria-invalid : un lecteur d'écran annonce le problème en même temps que le
// champ, sans qu'il faille aller le chercher ailleurs dans la page.

const props = defineProps<{
  etiquette: string
  nom: string
  type?: string
  aide?: string
  erreur?: string
  obligatoire?: boolean
  placeholder?: string
  autocomplete?: string
  inputmode?: string
  zone?: boolean
  max?: number
  desactive?: boolean
}>()

const valeur = defineModel<string>({ default: '' })
const id = useId()
const idAide = computed(() => (props.aide ? `${id}-aide` : undefined))
const idErreur = computed(() => (props.erreur ? `${id}-erreur` : undefined))
const decrit = computed(() => [idAide.value, idErreur.value].filter(Boolean).join(' ') || undefined)
</script>

<template>
  <div class="champ" :class="{ 'champ--erreur': erreur }">
    <label class="champ__etiquette" :for="id">
      {{ etiquette }}<span v-if="obligatoire" aria-hidden="true">*</span>
    </label>

    <textarea
      v-if="zone"
      :id="id"
      v-model="valeur"
      class="saisie saisie--zone"
      :name="nom"
      :required="obligatoire"
      :placeholder="placeholder"
      :maxlength="max"
      :disabled="desactive"
      :aria-invalid="erreur ? 'true' : undefined"
      :aria-describedby="decrit"
    />
    <input
      v-else
      :id="id"
      v-model="valeur"
      class="saisie"
      :type="type ?? 'text'"
      :name="nom"
      :required="obligatoire"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :inputmode="inputmode"
      :maxlength="max"
      :disabled="desactive"
      :aria-invalid="erreur ? 'true' : undefined"
      :aria-describedby="decrit"
    />

    <p v-if="aide" :id="idAide" class="champ__aide">{{ aide }}</p>
    <p v-if="erreur" :id="idErreur" class="champ__erreur">
      <UiIcone nom="alerte" :taille="14" />
      <span>{{ erreur }}</span>
    </p>
  </div>
</template>
