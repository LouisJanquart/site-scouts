<script setup lang="ts">
// Une section : une seule longue page faite de rubriques plein écran
// (voir [slug]/index.vue). Les anciennes sous-pages agenda, actus et
// rendez-vous renvoient vers la rubrique correspondante.
const { section } = useSectionCourante()

if (!section.value) {
  throw createError({ statusCode: 404, statusMessage: 'Section inconnue', fatal: true })
}

useHead(() => ({ title: `${section.value?.nom} — 16e Fleurus` }))
</script>

<template>
  <NuxtPage />
</template>
