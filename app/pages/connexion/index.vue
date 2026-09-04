<script setup lang="ts">
// La connexion. Volontairement nue : une adresse, un mot de passe, et deux
// portes de sortie — mot de passe oublié, et inscription.

definePageMeta({ layout: 'default' })

const route = useRoute()
const { charger } = useCompte()
const { enCours, erreur, champs, envoyer } = useFormulaire()

const email = ref('')
const motDePasse = ref('')

// Les comptes de démonstration ne s'affichent que si l'exploitant l'a demandé
// explicitement. Ils ouvrent le back office avec des mots de passe triviaux :
// les montrer sur un site où il y a de vraies familles serait une porte
// grande ouverte. Voir scripts/semer.ts.
const demos = useRuntimeConfig().public.comptesDemo
  ? [
      { cle: 'anime', nom: 'Animé', quoi: 'Sa section, ses documents, sa fiche.' },
      { cle: 'parent', nom: 'Parent', quoi: 'Ses enfants, les calendriers, la cotisation.' },
      { cle: 'chef', nom: 'Chef de section', quoi: 'Les Lutins : animés, santé, paiements.' },
      { cle: 'cu', nom: "Chef d'unité", quoi: 'Toutes les sections, toute la caisse.' },
    ]
  : []

async function entrerEnDemo(cle: string) {
  email.value = `${cle}@fleurus.test`
  motDePasse.value = cle
  await connecter()
}

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

    <section v-if="demos.length" class="demo" aria-labelledby="titre-demo">
      <h2 id="titre-demo" class="demo__titre mono">Comptes de démonstration</h2>
      <p class="demo__note">
        Quatre comptes pour voir le site depuis chacune des quatre places. Le mot de passe est
        le nom du rôle. Ils n’ont rien à faire sur un site où il y a de vraies familles.
      </p>
      <ul class="demo__liste">
        <li v-for="d in demos" :key="d.cle">
          <button class="demo__bouton" type="button" :disabled="enCours" @click="entrerEnDemo(d.cle)">
            <span class="demo__nom">{{ d.nom }}</span>
            <span class="demo__quoi">{{ d.quoi }}</span>
            <span class="demo__id mono">{{ d.cle }}@fleurus.test · {{ d.cle }}</span>
          </button>
        </li>
      </ul>
    </section>
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

.demo {
  margin-block-start: 2.5rem;
  padding: 1.1rem 1.2rem 1.2rem;
  border: 1px dashed rgba(#f0a32e, 0.38);
  border-radius: $r-carte;
  max-inline-size: 34rem;

  &__titre {
    margin: 0 0 0.4rem;
    font-size: 0.7rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #f0a32e;
  }

  &__note {
    margin: 0 0 0.9rem;
    font-size: 0.8rem;
    line-height: 1.55;
    color: rgba($blanc, 0.62);
  }

  &__liste {
    display: grid;
    gap: 0.5rem;
    margin: 0;

    @media (min-width: 34rem) {
      grid-template-columns: 1fr 1fr;
    }
  }

  &__bouton {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    inline-size: 100%;
    block-size: 100%;
    padding: 0.7rem 0.8rem;
    text-align: start;
    background: $ardoise-sourd;
    border-radius: $r-champ;
    transition: background $vite $courbe;

    @include focus-visible;

    &:hover:not(:disabled) {
      background: $ardoise;
    }
    &:disabled {
      opacity: 0.6;
    }
  }

  &__nom {
    display: block;
    font-weight: 600;
    font-size: 0.88rem;
    color: $blanc;
  }

  &__quoi {
    display: block;
    font-size: 0.76rem;
    line-height: 1.4;
    color: rgba($blanc, 0.6);
  }

  &__id {
    display: block;
    margin-block-start: 0.25rem;
    font-size: 0.68rem;
    color: rgba($blanc, 0.42);
  }
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
