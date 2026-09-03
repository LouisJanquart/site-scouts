<script setup lang="ts">
import { consentementsCatalogue } from '#shared/consentements'
import { bornesSections } from '#shared/orientation'

const props = defineProps<{
  champs: Record<string, string>
  cotisationCentimes: number
  dejaConnecte: boolean
}>()

const { dossier } = useDossier()
const politiqueLue = ref(false)
const modele = defineModel<boolean>('politiqueLue', { default: false })
watch(politiqueLue, (v) => (modele.value = v))

const section = computed(
  () => bornesSections.find((s) => s.slug === dossier.value.enfant.sectionSlug)?.nom ?? '—',
)

const accordes = computed(() =>
  consentementsCatalogue.filter((c) => dossier.value.consentements[c.cle]),
)
const refuses = computed(() =>
  consentementsCatalogue.filter((c) => !dossier.value.consentements[c.cle]),
)

const confirmation = ref('')
const discordant = computed(
  () => confirmation.value.length > 0 && confirmation.value !== dossier.value.motDePasse,
)
defineExpose({ discordant })
</script>

<template>
  <div class="pile">
    <section class="groupe">
      <h2 class="groupe__titre">Récapitulatif</h2>

      <dl class="recap">
        <div>
          <dt>Enfant</dt>
          <dd>{{ dossier.enfant.prenom }} {{ dossier.enfant.nom }}</dd>
        </div>
        <div>
          <dt>Né(e) le</dt>
          <dd>{{ dossier.enfant.dateNaissance || '—' }}</dd>
        </div>
        <div>
          <dt>Section</dt>
          <dd>{{ section }}</dd>
        </div>
        <div>
          <dt>Adresse</dt>
          <dd>
            {{ dossier.enfant.adresse.rue }} {{ dossier.enfant.adresse.numero }},
            {{ dossier.enfant.adresse.codePostal }} {{ dossier.enfant.adresse.localite }}
          </dd>
        </div>
        <div>
          <dt>Responsables</dt>
          <dd>
            <span v-for="(r, i) in dossier.responsables" :key="i" class="recap__ligne">
              {{ r.prenom }} {{ r.nom }} — {{ r.email }} — {{ r.telephone }}
            </span>
          </dd>
        </div>
        <div v-if="dossier.contactsUrgence.length">
          <dt>En cas d’urgence</dt>
          <dd>
            <span v-for="(c, i) in dossier.contactsUrgence" :key="i" class="recap__ligne">
              {{ c.nom }} — {{ c.telephone }}
            </span>
          </dd>
        </div>
        <div>
          <dt>Cotisation</dt>
          <dd>{{ euros(cotisationCentimes) }}</dd>
        </div>
      </dl>

      <!-- La fiche santé n'est PAS récapitulée : l'afficher en clair sur un
           écran, dans un lieu qui peut être public, n'apporte rien. -->
      <p class="note">
        La fiche santé n’est pas réaffichée ici, volontairement. Vous pourrez la relire et la
        corriger depuis votre espace, après l’inscription.
      </p>
    </section>

    <section class="groupe">
      <h2 class="groupe__titre">Vos réponses aux autorisations</h2>
      <div class="autorisations">
        <div>
          <p class="autorisations__titre autorisations__titre--oui">
            <UiIcone nom="check" :taille="14" /> Accordées
          </p>
          <ul>
            <li v-for="c in accordes" :key="c.cle">{{ c.titre }}</li>
            <li v-if="!accordes.length" class="vide">Aucune</li>
          </ul>
        </div>
        <div>
          <p class="autorisations__titre autorisations__titre--non">
            <UiIcone nom="croix" :taille="14" /> Refusées
          </p>
          <ul>
            <li v-for="c in refuses" :key="c.cle">{{ c.titre }}</li>
            <li v-if="!refuses.length" class="vide">Aucune</li>
          </ul>
        </div>
      </div>
    </section>

    <section v-if="!dejaConnecte" class="groupe">
      <h2 class="groupe__titre">Votre espace</h2>
      <p class="groupe__chapo">
        Un compte est ouvert au nom de <strong>{{ dossier.responsables[0]?.email }}</strong>. Il
        vous servira à suivre le dossier, payer la cotisation, corriger la fiche santé et
        inscrire un autre enfant sans tout recommencer.
      </p>
      <div class="grille-champs">
        <UiChamp
          v-model="dossier.motDePasse as string"
          etiquette="Choisissez un mot de passe"
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
      </div>
    </section>

    <section class="groupe">
      <UiCase
        v-model="politiqueLue"
        titre="J’ai lu la politique de confidentialité"
        texte="Elle dit ce que nous conservons, pendant combien de temps, qui y a accès, et comment tout faire effacer."
        obligatoire
      />
      <p class="note">
        <NuxtLink to="/confidentialite" target="_blank">Lire la politique de confidentialité</NuxtLink>
        — elle s’ouvre dans un nouvel onglet, vous ne perdrez rien de ce formulaire.
      </p>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.recap {
  display: grid;
  gap: 0.7rem;
  margin: 0;

  div {
    display: grid;
    grid-template-columns: 9rem 1fr;
    gap: 0.75rem;
    align-items: baseline;

    @include jusqua($bp-console) {
      grid-template-columns: 1fr;
      gap: 0.15rem;
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
    line-height: 1.5;
  }

  &__ligne {
    display: block;
  }
}

.autorisations {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));

  ul {
    margin: 0.4rem 0 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    font-size: 0.84rem;
    color: rgba($blanc, 0.74);
  }

  .vide {
    color: rgba($blanc, 0.4);
  }

  &__titre {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.74rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;

    &--oui {
      color: #86efac;
    }
    &--non {
      color: rgba($blanc, 0.5);
    }
  }
}

.note {
  font-size: 0.78rem;
  line-height: 1.55;
  color: rgba($blanc, 0.55);

  a {
    color: $cyan;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
}
</style>
