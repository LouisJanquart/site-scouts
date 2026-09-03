<script setup lang="ts">
// La page de paiement du simulateur.
//
// Elle imite volontairement l'écran d'un prestataire : on « quitte » le site,
// on choisit une issue, on revient. C'est ce qui permet de vérifier tout
// l'enchaînement — y compris le retour et la bascule du dossier — sans compte
// bancaire. Elle est barrée de jaune pour qu'on ne la confonde jamais avec un
// vrai paiement.

definePageMeta({ middleware: 'connecte', layout: 'default' })

const route = useRoute()
const paiementId = computed(() => route.params.id as string)
const enCours = ref<string | null>(null)
const souci = ref<string | null>(null)

async function conclure(issue: 'paye' | 'echoue' | 'annule') {
  enCours.value = issue
  souci.value = null
  try {
    const r = await $fetch<{ ok: true }>('/api/paiements/simuler', {
      method: 'POST',
      body: { paiementId: paiementId.value, issue },
    })
    if (r.ok) await navigateTo('/mon-espace')
  } catch (e: any) {
    souci.value = e?.data?.statusMessage ?? 'La simulation a échoué.'
  } finally {
    enCours.value = null
  }
}

useHead({ title: 'Simulateur de paiement — 16e Fleurus' })
</script>

<template>
  <AppPage
    titre="Simulateur de paiement"
    surtitre="Environnement de test"
    :retour="{ to: '/mon-espace', texte: 'Mon espace' }"
  >
    <div class="pile">
      <div class="bandeau" role="status">
        <UiIcone nom="alerte" :taille="20" />
        <div>
          <p class="bandeau__titre">Aucun argent ne circule ici</p>
          <p class="bandeau__texte">
            Cet écran remplace la page de la banque tant que le compte de paiement n’est pas
            ouvert. Il déclenche exactement ce que déclencherait un vrai paiement : le statut
            change, le dossier passe « à relire », l’écriture est enregistrée.
          </p>
        </div>
      </div>

      <p v-if="souci" class="alerte alerte--erreur" role="alert">
        <UiIcone nom="alerte" :taille="18" /><span>{{ souci }}</span>
      </p>

      <section class="groupe">
        <h2 class="groupe__titre">Choisissez ce qui se passe</h2>
        <p class="groupe__chapo">
          Les trois issues d’un paiement réel. Chacune emmène le dossier là où elle l’emmènerait
          pour de vrai.
        </p>

        <div class="issues">
          <button
            class="issue issue--paye"
            type="button"
            :disabled="Boolean(enCours)"
            @click="conclure('paye')"
          >
            <UiIcone nom="check" :taille="18" />
            <span>
              <b>Le paiement aboutit</b>
              <small>La cotisation passe à « réglée » et le dossier attend la relecture d’un chef.</small>
            </span>
          </button>

          <button
            class="issue"
            type="button"
            :disabled="Boolean(enCours)"
            @click="conclure('echoue')"
          >
            <UiIcone nom="croix" :taille="18" />
            <span>
              <b>Le paiement échoue</b>
              <small>Carte refusée, solde insuffisant. La famille peut réessayer.</small>
            </span>
          </button>

          <button
            class="issue"
            type="button"
            :disabled="Boolean(enCours)"
            @click="conclure('annule')"
          >
            <UiIcone nom="fleche" :taille="18" />
            <span>
              <b>La famille abandonne</b>
              <small>Elle ferme la page de la banque sans aller au bout.</small>
            </span>
          </button>
        </div>
      </section>
    </div>
  </AppPage>
</template>

<style lang="scss" scoped>
.bandeau {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.15rem;
  border-radius: $r-carte;
  background: rgba(#f0a32e, 0.09);
  border: 1px solid rgba(#f0a32e, 0.35);
  color: #f0a32e;
  max-inline-size: 44rem;

  &__titre {
    font-weight: 600;
    font-size: 0.92rem;
  }

  &__texte {
    margin-block-start: 0.3rem;
    font-size: 0.84rem;
    line-height: 1.6;
    color: rgba($blanc, 0.72);
  }
}

.issues {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-inline-size: 34rem;
}

.issue {
  display: grid;
  grid-template-columns: 1.4rem 1fr;
  gap: 0.75rem;
  align-items: start;
  text-align: start;
  padding: 0.9rem 1.05rem;
  border: 1px solid rgba($blanc, 0.12);
  border-radius: $r-champ;
  background: rgba($blanc, 0.03);
  color: rgba($blanc, 0.7);
  transition:
    background $vite $courbe,
    border-color $vite $courbe;

  @include focus-visible;

  &:hover:not(:disabled) {
    background: rgba($blanc, 0.07);
    border-color: rgba($blanc, 0.22);
  }

  &:disabled {
    opacity: 0.55;
    cursor: default;
  }

  b {
    display: block;
    font-size: 0.9rem;
    font-weight: 600;
    color: $blanc;
  }

  small {
    display: block;
    margin-block-start: 0.2rem;
    font-size: 0.79rem;
    line-height: 1.55;
    color: rgba($blanc, 0.62);
  }

  &--paye {
    border-color: rgba(#4ade80, 0.4);
    color: #86efac;

    &:hover:not(:disabled) {
      background: rgba(#4ade80, 0.1);
      border-color: rgba(#4ade80, 0.6);
    }
  }
}
</style>
