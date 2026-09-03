<script setup lang="ts">
// La connexion. Volontairement nue : une adresse, un mot de passe, et deux
// portes de sortie — mot de passe oublié, et inscription.

definePageMeta({ layout: 'default' })

const route = useRoute()
const { charger } = useCompte()
const { enCours, erreur, champs, envoyer } = useFormulaire()

const email = ref('')
const motDePasse = ref('')

const suite = computed(() => {
  const s = route.query.suite
  // On ne redirige que vers une adresse interne : une « suite » venue de
  // l'extérieur transformerait la page de connexion en tremplin.
  return typeof s === 'string' && s.startsWith('/') && !s.startsWith('//') ? s : null
})

async function connecter() {
  const r = await envoyer(() =>
    $fetch<{ ok: true; doitChangerMotDePasse: boolean }>('/api/auth/connexion', {
      method: 'POST',
      body: { email: email.value, motDePasse: motDePasse.value },
    }),
  )
  if (!r) return
  await charger(true)
  // Le contenu réservé dépend du compte : on le redemande avant de naviguer.
  await useContenu().rafraichir()
  const { estStaff } = useCompte()
  await navigateTo(suite.value ?? (estStaff.value ? '/staff' : '/mon-espace'))
}

useHead({ title: 'Se connecter — 16e Fleurus' })
</script>

<template>
  <AppPage titre="Se connecter" surtitre="Espace des familles">
    <form class="formulaire" novalidate @submit.prevent="connecter">
      <p v-if="erreur" class="alerte alerte--erreur" role="alert">
        <UiIcone nom="alerte" :taille="18" />
        <span>{{ erreur }}</span>
      </p>

      <UiChamp
        v-model="email"
        etiquette="Adresse e-mail"
        nom="email"
        type="email"
        autocomplete="username"
        obligatoire
        :erreur="champs.email"
      />
      <UiChamp
        v-model="motDePasse"
        etiquette="Mot de passe"
        nom="motDePasse"
        type="password"
        autocomplete="current-password"
        obligatoire
        :erreur="champs.motDePasse"
      />

      <div class="formulaire__pied">
        <button class="bouton bouton--principal" type="submit" :disabled="enCours">
          {{ enCours ? 'Connexion…' : 'Se connecter' }}
        </button>
        <NuxtLink class="lien-doux" to="/connexion/mot-de-passe-oublie">
          Mot de passe oublié
        </NuxtLink>
      </div>
    </form>

    <p class="apres">
      Pas encore de compte ? Il se crée en même temps que la première inscription :
      <NuxtLink to="/inscription">inscrire un enfant</NuxtLink>.
    </p>
  </AppPage>
</template>

<style lang="scss" scoped>
.formulaire {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-inline-size: 26rem;

  &__pied {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    flex-wrap: wrap;
    margin-block-start: 0.5rem;
  }
}

.lien-doux {
  font-size: 0.82rem;
  color: $cyan;
  text-decoration: underline;
  text-underline-offset: 3px;
  @include focus-visible;
}

.apres {
  margin-block-start: 2rem;
  font-size: 0.85rem;
  line-height: 1.6;
  color: rgba($blanc, 0.62);
  max-inline-size: 32rem;

  a {
    color: $cyan;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
}
</style>
