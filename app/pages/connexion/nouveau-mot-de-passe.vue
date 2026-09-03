<script setup lang="ts">
const route = useRoute()
const { charger } = useCompte()
const { enCours, erreur, champs, envoyer } = useFormulaire()

const jeton = computed(() => (typeof route.query.jeton === 'string' ? route.query.jeton : ''))
const motDePasse = ref('')
const confirmation = ref('')

const discordant = computed(
  () => confirmation.value.length > 0 && motDePasse.value !== confirmation.value,
)

async function enregistrer() {
  if (discordant.value) return
  const r = await envoyer(() =>
    $fetch('/api/auth/nouveau-mot-de-passe', {
      method: 'POST',
      body: { jeton: jeton.value, motDePasse: motDePasse.value },
    }),
  )
  if (!r) return
  await charger(true)
  await navigateTo('/mon-espace')
}

useHead({ title: 'Nouveau mot de passe — 16e Fleurus' })
</script>

<template>
  <AppPage titre="Choisir un nouveau mot de passe" surtitre="Espace des familles">
    <p v-if="!jeton" class="alerte alerte--erreur" role="alert">
      <UiIcone nom="alerte" :taille="18" />
      <span>
        Ce lien est incomplet. Redemandez-en un depuis la page
        <NuxtLink to="/connexion/mot-de-passe-oublie">mot de passe oublié</NuxtLink>.
      </span>
    </p>

    <form v-else class="formulaire" novalidate @submit.prevent="enregistrer">
      <p v-if="erreur" class="alerte alerte--erreur" role="alert">
        <UiIcone nom="alerte" :taille="18" /><span>{{ erreur }}</span>
      </p>

      <UiChamp
        v-model="motDePasse"
        etiquette="Nouveau mot de passe"
        nom="motDePasse"
        type="password"
        autocomplete="new-password"
        obligatoire
        aide="Au moins dix caractères. Une phrase que vous seul connaissez vaut mieux qu’un mot compliqué."
        :erreur="champs.motDePasse"
      />
      <UiChamp
        v-model="confirmation"
        etiquette="Répétez le mot de passe"
        nom="confirmation"
        type="password"
        autocomplete="new-password"
        obligatoire
        :erreur="discordant ? 'Les deux mots de passe ne sont pas identiques.' : undefined"
      />

      <div>
        <button class="bouton bouton--principal" type="submit" :disabled="enCours || discordant">
          {{ enCours ? 'Enregistrement…' : 'Enregistrer' }}
        </button>
      </div>
    </form>
  </AppPage>
</template>

<style lang="scss" scoped>
.formulaire {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-inline-size: 26rem;
}
</style>
