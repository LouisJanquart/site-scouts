<script setup lang="ts">
const { enCours, erreur, envoyer } = useFormulaire()
const email = ref('')
const envoye = ref(false)

async function demander() {
  const r = await envoyer(() =>
    $fetch('/api/auth/mot-de-passe-oublie', { method: 'POST', body: { email: email.value } }),
  )
  if (r) envoye.value = true
}

useHead({ title: 'Mot de passe oublié — 16e Fleurus' })
</script>

<template>
  <AppPage
    titre="Mot de passe oublié"
    surtitre="Espace des familles"
    :retour="{ to: '/connexion', texte: 'Retour à la connexion' }"
  >
    <!-- La réponse est la même que l'adresse existe ou non : ce formulaire ne
         doit pas permettre de savoir qui est inscrit dans l'unité. -->
    <div v-if="envoye" class="alerte alerte--bien" role="status">
      <UiIcone nom="check" :taille="18" />
      <span>
        Si un compte existe avec cette adresse, un lien de réinitialisation vient d’y être envoyé.
        Il est valable deux heures. Pensez à regarder dans les indésirables.
      </span>
    </div>

    <form v-else class="formulaire" novalidate @submit.prevent="demander">
      <p class="chapo">
        Indiquez l’adresse de votre compte. Nous vous enverrons un lien pour choisir un nouveau
        mot de passe.
      </p>
      <p v-if="erreur" class="alerte alerte--erreur" role="alert">
        <UiIcone nom="alerte" :taille="18" /><span>{{ erreur }}</span>
      </p>
      <UiChamp
        v-model="email"
        etiquette="Adresse e-mail"
        nom="email"
        type="email"
        autocomplete="username"
        obligatoire
      />
      <div>
        <button class="bouton bouton--principal" type="submit" :disabled="enCours">
          {{ enCours ? 'Envoi…' : 'Envoyer le lien' }}
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
.chapo {
  font-size: 1rem;
  line-height: 1.6;
  color: rgba($blanc, 0.68);
}
</style>
