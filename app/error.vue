<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const messages: Record<number, { titre: string; texte: string }> = {
  404: {
    titre: 'Cette page n’existe pas',
    texte: 'Le lien est peut-être ancien, ou la page n’a pas encore été construite.',
  },
  500: {
    titre: 'Quelque chose a cassé',
    texte: 'Ce n’est pas de votre faute. Réessayez, ou revenez à l’accueil.',
  },
}

const message = computed(
  () => messages[props.error?.statusCode ?? 404] ?? messages[500]!,
)

useHead({ title: `${props.error?.statusCode ?? 404} — 16e Fleurus` })
</script>

<template>
  <div class="erreur">
    <div class="erreur__contenu">
      <p class="erreur__code mono">{{ error?.statusCode ?? 404 }}</p>
      <h1 class="titre titre--grand">{{ message.titre }}</h1>
      <p class="erreur__texte">{{ message.texte }}</p>
      <NuxtLink class="bouton bouton--principal" to="/" @click="clearError({ redirect: '/' })">
        Retour à l’accueil
      </NuxtLink>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.erreur {
  display: grid;
  place-items: center;
  min-block-size: 100dvh;
  padding: 2rem;
  background: $noir-profond;
  color: $blanc;

  &__contenu {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
    max-inline-size: 30rem;
  }

  &__code {
    font-size: 1rem;
    letter-spacing: 0.1em;
    color: $rouge-texte;
  }

  &__texte {
    color: rgba($blanc, 0.66);
    line-height: 1.6;
  }

  .bouton {
    margin-block-start: 0.75rem;
  }
}
</style>
