<script setup lang="ts">
// Ancienne sous-page, remplacée le 14/10/2026 par une rubrique de la page de
// la section. Les liens déjà partagés doivent continuer de tomber juste.
const route = useRoute()
await navigateTo(`/sections/${route.params.slug}#l-agenda`, { replace: true, redirectCode: 301 })
</script>

<template>
  <div />
</template>
