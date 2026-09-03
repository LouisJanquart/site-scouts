<script setup lang="ts">
// Une case à cocher avec son texte. Toute la boîte est cliquable — c'est un
// <label>, donc le clic sur le texte coche vraiment la case, sans JavaScript.

defineProps<{
  titre: string
  texte?: string
  consequence?: string
  obligatoire?: boolean
}>()

const coche = defineModel<boolean>({ default: false })
</script>

<template>
  <label class="case" :class="{ 'case--obligatoire': obligatoire }">
    <input v-model="coche" type="checkbox" :required="obligatoire" />
    <span>
      <span class="case__titre">
        {{ titre }}<span v-if="obligatoire" aria-hidden="true" style="color: var(--rouge-texte)">*</span>
      </span>
      <span v-if="texte" class="case__texte">{{ texte }}</span>
      <!-- Ce que ça change si la case reste vide. Une case à cocher sans cette
           phrase oblige le parent à deviner ce qu'il refuse. -->
      <span v-if="consequence && !coche" class="case__consequence">{{ consequence }}</span>
    </span>
  </label>
</template>
