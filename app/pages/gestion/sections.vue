<script setup lang="ts">
// Les pages de section, éditables par ceux qui les animent.
//
// Ce que le formulaire enregistre ne remplace pas le fichier du dépôt : il pose
// une correction par-dessus. Vider un champ remet donc le texte d'origine, ce
// qui évite de devoir le retrouver.
definePageMeta({ middleware: 'staff' })

const { data, pending, refresh } = await useFetch('/api/staff/sections')
const { concerne, nomPortee } = usePortee()
const { charger: rechargerLesSections } = useSections()

const liste = computed(() => (data.value?.sections ?? []).filter((s: any) => concerne(s.slug)))

const ouverte = ref<string | null>(null)
const brouillon = ref<Record<string, any>>({})
const enCours = ref<string | null>(null)
const souci = ref<string | null>(null)
const fait = ref<string | null>(null)

function ouvrir(s: any) {
  ouverte.value = ouverte.value === s.slug ? null : s.slug
  souci.value = null
  fait.value = null
  brouillon.value = {
    nom: s.nom ?? '',
    nomCourt: s.nomCourt ?? '',
    ages: s.ages ?? '',
    resume: s.resume ?? '',
    description: s.description ?? '',
  }
}

/** Le texte d'origine, pour dire au staff ce qu'il retrouvera en vidant. */
function origine(s: any, champ: string) {
  return s.origine?.[champ] ?? ''
}

async function enregistrer(s: any) {
  enCours.value = s.slug
  souci.value = null
  fait.value = null
  try {
    await $fetch(`/api/staff/sections/${s.slug}`, { method: 'PATCH', body: brouillon.value })
    await refresh()
    await rechargerLesSections()
    fait.value = s.slug
    ouverte.value = null
  } catch (e: any) {
    souci.value = e?.data?.statusMessage ?? e?.statusMessage ?? 'Enregistrement impossible.'
  } finally {
    enCours.value = null
  }
}

useHead({ title: 'Pages des sections — 16e Fleurus' })
</script>

<template>
  <AppPage
    titre="Pages des sections"
    surtitre="Staff"
    :chapo="`Corriger ce qui s’affiche sur la page publique d’une section. Portée : ${nomPortee}.`"
    :retour="{ to: '/gestion', texte: 'Back office' }"
  >
    <template #entete>
      <GestionBarre />
    </template>

    <div class="pile">
      <div class="alerte alerte--info">
        <UiIcone nom="info" :taille="18" />
        <span>
          Ces textes sont publics. Un champ laissé vide reprend le texte d’origine du site, il ne
          l’efface pas.
        </span>
      </div>

      <p v-if="pending" class="alerte alerte--info">Chargement…</p>
      <p v-else-if="souci" class="alerte alerte--souci">{{ souci }}</p>

      <ul v-if="!pending" class="sections">
        <li v-for="s in liste" :key="s.slug" class="carte" :data-section="s.slug">
          <div class="carte__tete">
            <UiIcone :nom="s.icone" :taille="20" />
            <div class="carte__titre">
              <span class="carte__nom">{{ s.nom }}</span>
              <span class="carte__ages doux">{{ s.ages ?? 'sans tranche d’âge' }}</span>
            </div>
            <span v-if="s.modifie?.length" class="etiquette">
              {{ s.modifie.length }} champ{{ s.modifie.length > 1 ? 's' : '' }} modifié{{
                s.modifie.length > 1 ? 's' : ''
              }}
            </span>
            <span v-if="fait === s.slug" class="etiquette etiquette--bien">enregistré</span>
            <button class="bouton bouton--fantome" type="button" @click="ouvrir(s)">
              {{ ouverte === s.slug ? 'Fermer' : 'Modifier' }}
            </button>
          </div>

          <p class="carte__resume">{{ s.resume }}</p>

          <form v-if="ouverte === s.slug" class="formulaire" @submit.prevent="enregistrer(s)">
            <label class="champ">
              <span class="champ__nom">Nom</span>
              <input v-model="brouillon.nom" class="champ__entree" type="text" />
              <span class="champ__aide doux">D’origine : {{ origine(s, 'nom') }}</span>
            </label>

            <label class="champ">
              <span class="champ__nom">Nom court (pour le rail)</span>
              <input v-model="brouillon.nomCourt" class="champ__entree" type="text" />
            </label>

            <label class="champ">
              <span class="champ__nom">Âges</span>
              <input v-model="brouillon.ages" class="champ__entree" type="text" />
              <span class="champ__aide doux">D’origine : {{ origine(s, 'ages') }}</span>
            </label>

            <label class="champ">
              <span class="champ__nom">Résumé</span>
              <textarea v-model="brouillon.resume" class="champ__entree" rows="2" />
              <span class="champ__aide doux">Une phrase, affichée sous le nom de la section.</span>
            </label>

            <label class="champ">
              <span class="champ__nom">Description</span>
              <textarea v-model="brouillon.description" class="champ__entree" rows="5" />
            </label>

            <div class="actions">
              <button class="bouton" type="submit" :disabled="enCours === s.slug">
                {{ enCours === s.slug ? 'Enregistrement…' : 'Enregistrer' }}
              </button>
              <NuxtLink class="bouton bouton--fantome" :to="`/sections/${s.slug}`" target="_blank">
                Voir la page
              </NuxtLink>
            </div>
          </form>
        </li>
      </ul>
    </div>
  </AppPage>
</template>

<style lang="scss" scoped>
.pile {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sections {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin: 0;
}

.carte {
  padding: 1rem 1.15rem;
  background: $ardoise;
  border-radius: $r-carte;
  border-inline-start: 3px solid var(--section-teinte);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &__tete {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    color: var(--section-teinte);
  }

  &__titre {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-inline-size: 0;
  }

  &__nom {
    font-weight: 600;
    font-size: 1rem;
    color: $blanc;
  }

  &__ages {
    font-size: 0.75rem;
  }

  &__resume {
    font-size: 1rem;
    color: rgba($blanc, 0.72);
  }
}

.formulaire {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-block-start: 0.5rem;
  padding-block-start: 0.75rem;
  border-block-start: 1px solid rgba($blanc, 0.08);
}

.champ {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  &__nom {
    @include surtitre;
    font-size: 0.75rem;
  }

  &__entree {
    padding: 0.6rem 0.75rem;
    background: rgba($blanc, 0.04);
    border: 1px solid rgba($blanc, 0.1);
    border-radius: $r-champ;
    color: $blanc;
    font: inherit;
    font-size: 1rem;

    @include focus-visible;
    &:focus {
      border-color: var(--section-teinte);
    }
  }

  &__aide {
    font-size: 0.75rem;
  }
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
</style>
