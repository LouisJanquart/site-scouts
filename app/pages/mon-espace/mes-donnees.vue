<script setup lang="ts">
definePageMeta({ middleware: 'connecte' })

const { data: journal } = await useFetch('/api/mon-espace/journal')
const { enCours, erreur, envoyer } = useFormulaire()

const type = ref<'acces' | 'rectification' | 'effacement' | 'portabilite' | 'opposition'>('effacement')
const objet = ref('')
const deposee = ref<{ echeanceLe: string } | null>(null)

const types = [
  { valeur: 'acces', libelle: 'Savoir ce que vous conservez sur nous' },
  { valeur: 'rectification', libelle: 'Corriger une information inexacte' },
  { valeur: 'effacement', libelle: 'Faire effacer nos données' },
  { valeur: 'portabilite', libelle: 'Récupérer nos données dans un format réutilisable' },
  { valeur: 'opposition', libelle: 'M’opposer à un usage précis' },
]

const libellesAction: Record<string, string> = {
  lecture: 'a consulté',
  creation: 'a créé',
  modification: 'a modifié',
  suppression: 'a supprimé',
  export: 'a exporté',
}
const libellesCible: Record<string, string> = {
  'fiche-sante': 'la fiche santé',
  anime: 'le dossier',
  inscription: 'l’inscription',
  consentement: 'une autorisation',
  paiement: 'un paiement',
  'liste-animes': 'la liste de sa section',
  'mes-donnees': 'l’export de vos données',
}

async function deposer() {
  const r = await envoyer(() =>
    $fetch<{ ok: true; echeanceLe: string }>('/api/mon-espace/demande-rgpd', {
      method: 'POST',
      body: { type: type.value, objet: objet.value },
    }),
  )
  if (r) deposee.value = r
}

useHead({ title: 'Mes données — 16e Fleurus' })
</script>

<template>
  <AppPage
    titre="Mes données"
    surtitre="Espace des familles"
    chapo="Ce que nous conservons, qui l’a consulté, et comment reprendre la main."
    :retour="{ to: '/mon-espace', texte: 'Mon espace' }"
  >
    <div class="pile">
      <section class="groupe">
        <h2 class="groupe__titre">Tout récupérer</h2>
        <p class="groupe__chapo">
          Un fichier contenant l’intégralité de ce que nous savons de vous et de vos enfants,
          fiches santé comprises. Il vous appartient.
        </p>
        <div>
          <a class="bouton bouton--principal" href="/api/mon-espace/export" download>
            <UiIcone nom="telecharger" :taille="16" /> Télécharger mes données
          </a>
        </div>
      </section>

      <section class="groupe">
        <h2 class="groupe__titre">Qui a consulté nos dossiers</h2>
        <p class="groupe__chapo">
          Chaque ouverture d’un dossier ou d’une fiche santé laisse une trace. Voici les
          {{ journal?.acces.length ?? 0 }} dernières.
        </p>

        <div
          v-if="journal?.acces.length"
          class="cadre-journal"
          tabindex="0"
          role="group"
          aria-label="Consultations de vos dossiers, liste défilante"
        >
        <ol class="journal">
          <li v-for="(a, i) in journal.acces" :key="i">
            <span class="journal__quand mono">
              {{ new Date(a.quand).toLocaleString('fr-BE', { dateStyle: 'short', timeStyle: 'short' }) }}
            </span>
            <span>
              <strong>{{ a.prenom ? `${a.prenom} ${a.nom}` : 'Un membre du staff' }}</strong>
              {{ libellesAction[a.action] ?? a.action }}
              {{ libellesCible[a.cible] ?? a.cible }}
            </span>
          </li>
        </ol>
        </div>
        <p v-else class="doux">Aucune consultation enregistrée pour l’instant.</p>
      </section>

      <section class="groupe">
        <h2 class="groupe__titre">Exercer un droit</h2>
        <p class="groupe__chapo">
          Le staff d’unité a un mois pour répondre. Une demande d’effacement peut avoir des
          conséquences — sans fiche santé ni autorisation parentale, nous ne pouvons plus
          accueillir votre enfant en camp. Nous en parlerons avec vous avant d’agir.
        </p>

        <div v-if="deposee" class="alerte alerte--bien" role="status">
          <UiIcone nom="check" :taille="18" />
          <span>
            Demande enregistrée. Réponse attendue au plus tard le
            {{ new Date(deposee.echeanceLe).toLocaleDateString('fr-BE') }}.
          </span>
        </div>

        <form v-else class="pile" novalidate @submit.prevent="deposer">
          <p v-if="erreur" class="alerte alerte--erreur" role="alert">
            <UiIcone nom="alerte" :taille="18" /><span>{{ erreur }}</span>
          </p>
          <UiChoix v-model="type" etiquette="Que souhaitez-vous ?" nom="type" :options="types" obligatoire />
          <UiChamp
            v-model="objet"
            etiquette="Précisions"
            nom="objet"
            zone
            :max="2000"
            aide="Facultatif, mais ça nous aide à répondre juste."
          />
          <div>
            <button class="bouton bouton--principal" type="submit" :disabled="enCours">
              {{ enCours ? 'Envoi…' : 'Envoyer la demande' }}
            </button>
          </div>
        </form>
      </section>

      <section class="groupe">
        <h2 class="groupe__titre">Pour aller plus loin</h2>
        <p class="groupe__chapo">
          <NuxtLink to="/confidentialite">La politique de confidentialité</NuxtLink> détaille ce
          que nous conservons, pendant combien de temps et pourquoi. Si notre réponse ne vous
          satisfait pas, vous pouvez saisir l’Autorité de protection des données
          (autoriteprotectiondonnees.be).
        </p>
      </section>
    </div>
  </AppPage>
</template>

<style lang="scss" scoped>
.cadre-journal {
  max-block-size: 24rem;
  border-radius: $r-champ;
  @include defilement-discret;
  @include focus-visible;
}

.journal {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: grid;
    grid-template-columns: 9.5rem 1fr;
    gap: 0.75rem;
    font-size: 0.82rem;
    line-height: 1.5;
    padding-block: 0.3rem;
    border-block-end: 1px solid rgba($blanc, 0.05);

    @include jusqua($bp-console) {
      grid-template-columns: 1fr;
      gap: 0.1rem;
    }
  }

  &__quand {
    font-size: 0.72rem;
    color: rgba($blanc, 0.5);
  }
}

.groupe__chapo a {
  color: $cyan;
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
