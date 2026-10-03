<script setup lang="ts">
// Le puits : le creux dans lequel on range des tuiles. C'est le niveau du
// milieu de l'emboîtement panneau → puits → tuile.
withDefaults(defineProps<{ as?: string }>(), { as: 'div' })
</script>

<template>
  <component :is="as" class="puits"><slot /></component>
</template>

<style lang="scss" scoped>
.puits {
  display: flex;
  flex-direction: column;
  gap: $esp-1;
  margin: 0;
  padding: $esp-2;
  background: $ardoise-sourd;
  border-radius: $r-carte;
  list-style: none;
}
</style>
