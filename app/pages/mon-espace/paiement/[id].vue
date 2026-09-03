<script setup lang="ts">
definePageMeta({ middleware: 'connecte' })

const route = useRoute()
const id = computed(() => route.params.id as string)
const { data, refresh, pending } = await useFetch(() => `/api/paiements/${id.value}`)
const { enCours, erreur, envoyer } = useFormulaire()

// Retour depuis Mollie : on ne croit pas la page de retour, on redemande l'état
// au serveur — qui, lui, le tient du webhook.
onMounted(() => {
  if (route.query.retour) setTimeout(() => refresh(), 1500)
})

async function payer() {
  const r = await envoyer(() =>
    $fetch<{ url: string }>('/api/paiements/creer', {
      method: 'POST',
      body: { inscriptionId: id.value },
    }),
  )
  if (r?.url) window.location.href = r.url
}

useHead({ title: 'Cotisation — 16e Fleurus' })
</script>

<template>
  <AppPage
    titre="La cotisation"
    surtitre="Espace des familles"
    :retour="{ to: '/mon-espace', texte: 'Mon espace' }"
  >
    <p v-if="pending" class="alerte alerte--info">Chargement…</p>

    <div v-else-if="data" class="pile">
      <div v-if="data.regle" class="alerte alerte--bien" role="status">
        <UiIcone nom="check" :taille="18" />
        <span>
          La cotisation de {{ data.inscription.prenom }} pour la saison
          {{ data.inscription.saison }} est réglée. Merci.
        </span>
      </div>

      <template v-else>
        <section class="groupe">
          <h2 class="groupe__titre">
            {{ euros(data.inscription.montant) }} pour {{ data.inscription.prenom }}
          </h2>
          <p class="groupe__chapo">
            Saison {{ data.inscription.saison }}. La cotisation couvre l’affiliation, l’assurance
            et le matériel de l’unité. Si le montant pose un problème, écrivez au staff d’unité :
            une solution se trouve toujours, et elle reste entre vous et lui.
          </p>

          <p v-if="erreur" class="alerte alerte--erreur" role="alert">
            <UiIcone nom="alerte" :taille="18" /><span>{{ erreur }}</span>
          </p>

          <div v-if="data.enLigneDisponible">
            <button class="bouton bouton--principal" type="button" :disabled="enCours" @click="payer">
              <UiIcone nom="carte" :taille="16" />
              {{ enCours ? 'Ouverture…' : 'Payer par Bancontact ou carte' }}
            </button>
            <p class="doux petit">
              Vous quittez le site le temps du paiement. Aucune donnée bancaire ne passe par nous.
            </p>
          </div>
        </section>

        <section class="groupe">
          <h2 class="groupe__titre">Ou par virement</h2>
          <dl class="virement">
            <div>
              <dt>Bénéficiaire</dt>
              <dd>{{ data.coordonnees.beneficiaire }}</dd>
            </div>
            <div v-if="data.coordonnees.iban">
              <dt>IBAN</dt>
              <dd class="mono">{{ data.coordonnees.iban }}</dd>
            </div>
            <div>
              <dt>Montant</dt>
              <dd>{{ euros(data.inscription.montant) }}</dd>
            </div>
            <div v-if="data.paiements.find((p) => p.communication)">
              <dt>Communication structurée</dt>
              <dd class="mono">{{ data.paiements.find((p) => p.communication)?.communication }}</dd>
            </div>
          </dl>
          <p class="doux petit">
            La communication structurée permet au trésorier de rapprocher le virement du bon
            dossier. Recopiez-la telle quelle, signes plus compris.
          </p>
        </section>
      </template>

      <section v-if="data.paiements.length" class="groupe">
        <h2 class="groupe__titre">Historique</h2>
        <ul class="historique">
          <li v-for="p in data.paiements" :key="p.id">
            <span class="mono">{{ new Date(p.creeLe).toLocaleDateString('fr-BE') }}</span>
            <span>{{ euros(p.montantCentimes) }} · {{ p.moyen }}</span>
            <span class="historique__statut">{{ p.statut }}</span>
          </li>
        </ul>
      </section>
    </div>
  </AppPage>
</template>

<style lang="scss" scoped>
.virement {
  display: grid;
  gap: 0.5rem;
  margin: 0;

  div {
    display: grid;
    grid-template-columns: 12rem 1fr;
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
    font-size: 0.9rem;
  }
}

.historique {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    gap: 0.9rem;
    font-size: 0.82rem;
    flex-wrap: wrap;
  }

  &__statut {
    color: rgba($blanc, 0.55);
  }
}

.petit {
  font-size: 0.78rem;
  line-height: 1.55;
  margin-block-start: 0.5rem;
}
</style>
