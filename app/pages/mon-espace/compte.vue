<script setup lang="ts">
definePageMeta({ middleware: 'connecte' })

const { moi } = useCompte()
const { enCours, erreur, champs, envoyer } = useFormulaire()

const actuel = ref('')
const nouveau = ref('')
const confirmation = ref('')
const fait = ref(false)

const discordant = computed(() => confirmation.value.length > 0 && nouveau.value !== confirmation.value)

async function changer() {
  if (discordant.value) return
  const r = await envoyer(() =>
    $fetch('/api/auth/changer-mot-de-passe', {
      method: 'POST',
      body: { actuel: actuel.value, nouveau: nouveau.value },
    }),
  )
  if (r) {
    fait.value = true
    actuel.value = nouveau.value = confirmation.value = ''
  }
}

useHead({ title: 'Mon compte — 16e Fleurus' })
</script>

<template>
  <AppPage
    titre="Mon compte"
    surtitre="Espace des familles"
    :retour="{ to: '/mon-espace', texte: 'Mon espace' }"
  >
    <div class="pile">
      <section class="groupe">
        <h2 class="groupe__titre">Identité</h2>
        <dl class="fiche">
          <div><dt>Nom</dt><dd>{{ moi?.prenom }} {{ moi?.nom }}</dd></div>
          <div><dt>Adresse e-mail</dt><dd>{{ moi?.email }}</dd></div>
          <div>
            <dt>Rôles</dt>
            <dd>
              <span v-for="(r, i) in moi?.roles ?? []" :key="i" class="etiquette etiquette--sourde">
                {{ r.role }}<template v-if="r.sectionSlug"> · {{ r.sectionSlug }}</template>
              </span>
            </dd>
          </div>
        </dl>
        <p class="doux petit">
          Pour corriger votre nom ou votre adresse, passez par
          <NuxtLink to="/mon-espace/mes-donnees">Mes données</NuxtLink> : une demande de
          rectification arrive directement au staff d’unité.
        </p>
      </section>

      <section class="groupe">
        <h2 class="groupe__titre">Changer de mot de passe</h2>
        <p class="groupe__chapo">
          Changer de mot de passe déconnecte tous les appareils, y compris celui-ci — vous
          resterez connecté ici, les autres non.
        </p>

        <div v-if="fait" class="alerte alerte--bien" role="status">
          <UiIcone nom="check" :taille="18" /><span>Mot de passe modifié.</span>
        </div>

        <form class="pile" novalidate @submit.prevent="changer">
          <p v-if="erreur" class="alerte alerte--erreur" role="alert">
            <UiIcone nom="alerte" :taille="18" /><span>{{ erreur }}</span>
          </p>
          <UiChamp
            v-model="actuel"
            etiquette="Mot de passe actuel"
            nom="actuel"
            type="password"
            autocomplete="current-password"
            obligatoire
            :erreur="champs.actuel"
          />
          <UiChamp
            v-model="nouveau"
            etiquette="Nouveau mot de passe"
            nom="nouveau"
            type="password"
            autocomplete="new-password"
            obligatoire
            aide="Au moins dix caractères."
            :erreur="champs.nouveau"
          />
          <UiChamp
            v-model="confirmation"
            etiquette="Répétez le nouveau mot de passe"
            nom="confirmation"
            type="password"
            autocomplete="new-password"
            obligatoire
            :erreur="discordant ? 'Les deux mots de passe ne sont pas identiques.' : undefined"
          />
          <div>
            <button class="bouton bouton--principal" type="submit" :disabled="enCours || discordant">
              {{ enCours ? 'Enregistrement…' : 'Changer le mot de passe' }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </AppPage>
</template>

<style lang="scss" scoped>
.fiche {
  display: grid;
  gap: 0.5rem;
  margin: 0;

  div {
    display: grid;
    grid-template-columns: 10rem 1fr;
    gap: 0.75rem;
    @include jusqua($bp-console) {
      grid-template-columns: 1fr;
      gap: 0.1rem;
    }
  }

  dt {
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: rgba($blanc, 0.5);
  }
  dd {
    margin: 0;
    font-size: 0.88rem;
    display: flex;
    gap: 0.3rem;
    flex-wrap: wrap;
  }
}
.petit {
  font-size: 0.78rem;
  line-height: 1.55;
  a {
    color: $cyan;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
}
</style>
