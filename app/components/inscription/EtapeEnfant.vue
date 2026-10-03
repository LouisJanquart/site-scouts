<script setup lang="ts">
import { sectionsPossibles, ageAuPremierSeptembre, anneeDeSaison } from '#shared/orientation'

const props = defineProps<{ champs: Record<string, string>; anneeSaison: number }>()
const { dossier } = useDossier()
const enfant = computed(() => dossier.value.enfant)

const genres = [
  { valeur: 'f', libelle: 'Fille' },
  { valeur: 'm', libelle: 'Garçon' },
  { valeur: 'x', libelle: 'Autre' },
  { valeur: 'ne-se-prononce-pas', libelle: 'Préfère ne pas le dire' },
]

// Les sections possibles se recalculent à chaque frappe dans la date. Tant que
// la date n'est pas complète, on ne propose rien : mieux vaut un vide qu'une
// liste qui saute.
const propositions = computed(() => {
  const d = enfant.value.dateNaissance
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return []
  return sectionsPossibles(d, props.anneeSaison, enfant.value.genre)
})

const age = computed(() => {
  const d = enfant.value.dateNaissance
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return null
  return ageAuPremierSeptembre(d, props.anneeSaison)
})

// Si la section choisie n'est plus proposée (la date a changé), on l'oublie.
watch(propositions, (liste) => {
  if (enfant.value.sectionSlug && !liste.some((s) => s.slug === enfant.value.sectionSlug)) {
    enfant.value.sectionSlug = ''
  }
  if (!enfant.value.sectionSlug && liste.length === 1) {
    enfant.value.sectionSlug = liste[0]!.slug
  }
})
</script>

<template>
  <div class="pile">
    <section class="groupe">
      <h2 class="groupe__titre">L’enfant</h2>

      <div class="grille-champs">
        <UiChamp
          v-model="enfant.prenom"
          etiquette="Prénom"
          nom="enfant.prenom"
          autocomplete="off"
          obligatoire
          :erreur="champs['enfant.prenom']"
        />
        <UiChamp
          v-model="enfant.nom"
          etiquette="Nom"
          nom="enfant.nom"
          autocomplete="off"
          obligatoire
          :erreur="champs['enfant.nom']"
        />
        <UiChamp
          v-model="enfant.dateNaissance"
          etiquette="Date de naissance"
          nom="enfant.dateNaissance"
          type="date"
          obligatoire
          :aide="age !== null ? `${age} ans au 1er septembre ${anneeSaison}` : undefined"
          :erreur="champs['enfant.dateNaissance']"
        />
        <UiChoix
          v-model="enfant.genre as string"
          etiquette="Genre"
          nom="enfant.genre"
          :options="genres"
          vide="Non précisé"
          aide="Sert uniquement à proposer les sections non mixtes."
        />
      </div>
    </section>

    <section class="groupe">
      <h2 class="groupe__titre">Où il ou elle habite</h2>
      <p class="groupe__chapo">
        L’adresse sert aux courriers de l’unité et à l’affiliation à la fédération.
      </p>

      <div class="grille-champs">
        <UiChamp
          v-model="enfant.adresse.rue"
          etiquette="Rue"
          nom="enfant.adresse.rue"
          autocomplete="street-address"
          obligatoire
          class="plein"
          :erreur="champs['enfant.adresse.rue']"
        />
        <UiChamp
          v-model="enfant.adresse.numero"
          etiquette="Numéro"
          nom="enfant.adresse.numero"
          obligatoire
          :erreur="champs['enfant.adresse.numero']"
        />
        <UiChamp
          v-model="enfant.adresse.codePostal"
          etiquette="Code postal"
          nom="enfant.adresse.codePostal"
          inputmode="numeric"
          autocomplete="postal-code"
          obligatoire
          :erreur="champs['enfant.adresse.codePostal']"
        />
        <UiChamp
          v-model="enfant.adresse.localite"
          etiquette="Localité"
          nom="enfant.adresse.localite"
          autocomplete="address-level2"
          obligatoire
          :erreur="champs['enfant.adresse.localite']"
        />
      </div>
    </section>

    <section class="groupe">
      <h2 class="groupe__titre">Sa section</h2>
      <p v-if="!propositions.length" class="groupe__chapo">
        Indiquez d’abord la date de naissance : les sections possibles s’afficheront ici.
      </p>
      <p v-else class="groupe__chapo">
        Voici ce qui correspond à son âge. Si vous pensez qu’une autre section conviendrait mieux
        — une fratrie, un enfant en avance ou en retard —, choisissez ce qui vous semble juste et
        dites-le dans la remarque : le staff en discutera avec vous.
      </p>

      <div v-if="propositions.length" class="sections">
        <label v-for="s in propositions" :key="s.slug" class="case" :data-section="s.slug">
          <input v-model="enfant.sectionSlug" type="radio" :value="s.slug" name="section" />
          <span>
            <span class="case__titre">{{ s.nom }}</span>
            <span class="case__texte">
              {{ s.ageMin }} à {{ s.ageMax }} ans ·
              {{ s.genre === 'mixte' ? 'mixte' : s.genre === 'filles' ? 'filles' : 'garçons' }}
            </span>
          </span>
        </label>
      </div>
      <p v-if="champs['enfant.sectionSlug']" class="champ__erreur">
        <UiIcone nom="alerte" :taille="14" />
        <span>{{ champs['enfant.sectionSlug'] }}</span>
      </p>

      <UiChamp
        v-model="dossier.remarqueFamille as string"
        etiquette="Quelque chose à nous dire ?"
        nom="remarqueFamille"
        zone
        :max="2000"
        aide="Facultatif. Une inquiétude, une demande, un frère ou une sœur déjà dans l’unité."
      />
    </section>
  </div>
</template>

<style lang="scss" scoped>
.sections {
  display: grid;
  gap: 0.4rem;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));

  .case:has(input:checked) {
    border-color: var(--section-teinte);
    background: color-mix(in srgb, var(--section-teinte) 10%, transparent);
  }

  input {
    accent-color: var(--section-teinte);
  }
}
</style>
