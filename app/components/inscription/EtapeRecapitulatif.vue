<script setup lang="ts">
import { consentementsCatalogue } from '#shared/consentements'
import { bornesSections } from '#shared/orientation'

import type { Bareme } from '#shared/cotisations'

const props = defineProps<{
  champs: Record<string, string>
  bareme: Bareme | null
  supplementLocalCentimes: number
  dejaConnecte: boolean
}>()

// On n'annonce pas un montant : on montre le barème.
//
// Le tarif dépend du nombre de membres du ménage inscrits, y compris les frères
// et sœurs chez les Scouts, et l'unité ne connaît pas encore la fratrie à ce
// stade. Afficher « 57,50 € » à une famille qui paiera 39 € serait faux, et
// afficher un montant qui bouge après coup fait croire à une erreur. On montre
// donc la grille, et le montant exact arrive au dépôt.
const grille = computed(() => {
  const b = props.bareme
  if (!b) return []
  const sup = props.supplementLocalCentimes
  return [
    { cas: 'Un seul membre du ménage inscrit', montant: b.pleinCentimes + sup },
    { cas: 'Deux membres — le tarif s’applique aux deux', montant: b.famille2Centimes + sup },
    { cas: 'Trois membres ou plus — à chacun', montant: b.famille3PlusCentimes + sup },
    { cas: 'Route, ou inscription après le 1er avril', montant: b.reduitCentimes + sup },
  ]
})

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

      </dl>

      <!-- La fiche santé n'est PAS récapitulée : l'afficher en clair sur un
           écran, dans un lieu qui peut être public, n'apporte rien. -->
      <p class="note">
        La fiche santé n’est pas réaffichée ici, volontairement. Vous pourrez la relire et la
        corriger depuis votre espace, après l’inscription.
      </p>
    </section>

    <section v-if="grille.length" class="groupe">
      <h2 class="groupe__titre">La cotisation</h2>
      <p class="groupe__chapo">
        Elle dépend du nombre d’enfants de votre ménage inscrits — et le tarif famille s’applique
        à <em>tous</em>, pas seulement au deuxième. Votre montant exact sera calculé au moment du
        dépôt, et il baissera tout seul si vous inscrivez un autre enfant plus tard.
      </p>
      <ul class="grille">
        <li v-for="g in grille" :key="g.cas">
          <span>{{ g.cas }}</span>
          <span class="grille__montant mono">{{ euros(g.montant) }}</span>
        </li>
      </ul>
      <p class="note">
        Un frère ou une sœur inscrit chez les Scouts compte aussi : dites-le dans la remarque, le
        staff l’ajoutera. Et si le montant pose un problème, écrivez au staff d’unité — un tarif
        social existe, il s’accorde discrètement et il ne se demande pas sur un formulaire.
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

.grille {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.5rem 0.75rem;
    background: rgba($blanc, 0.03);
    border-radius: $r-champ;
    font-size: 0.85rem;
    color: rgba($blanc, 0.78);
  }

  &__montant {
    font-size: 0.9rem;
    font-weight: 500;
    color: $cyan;
    white-space: nowrap;
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
