<script setup lang="ts">
// Le lien de confirmation d'adresse. La page ne fait qu'appeler l'API et dire
// ce qui s'est passé.
const route = useRoute()
const etat = ref<'attente' | 'ok' | 'echec'>('attente')
const message = ref('')

onMounted(async () => {
  const jeton = typeof route.query.jeton === 'string' ? route.query.jeton : ''
  if (!jeton) {
    etat.value = 'echec'
    message.value = 'Ce lien est incomplet.'
    return
  }
  try {
    await $fetch('/api/auth/verifier-email', { method: 'POST', body: { jeton } })
    etat.value = 'ok'
  } catch (e: any) {
    etat.value = 'echec'
    message.value = e?.data?.statusMessage ?? 'Ce lien a expiré ou a déjà servi.'
  }
})

useHead({ title: 'Confirmation d’adresse — 16e Fleurus' })
</script>

<template>
  <AppPage titre="Confirmation de votre adresse" surtitre="Espace des familles">
    <p v-if="etat === 'attente'" class="alerte alerte--info">Vérification en cours…</p>

    <div v-else-if="etat === 'ok'" class="alerte alerte--bien" role="status">
      <UiIcone nom="check" :taille="18" />
      <span>
        Votre adresse est confirmée. Vous pouvez rejoindre
        <NuxtLink to="/mon-espace">votre espace</NuxtLink>.
      </span>
    </div>

    <div v-else class="alerte alerte--erreur" role="alert">
      <UiIcone nom="alerte" :taille="18" />
      <span>{{ message }} Reconnectez-vous : un nouveau lien vous sera proposé.</span>
    </div>
  </AppPage>
</template>
