<script setup lang="ts">
import { bornesSections } from '#shared/orientation'

definePageMeta({ middleware: 'staff' })

const { data, pending, refresh } = await useFetch('/api/staff/inscriptions')
const nomSection = (slug: string) => bornesSections.find((s) => s.slug === slug)?.nom ?? slug

const ouvert = ref<string | null>(null)
const motif = ref('')
const remarque = ref('')
const enCours = ref<string | null>(null)
const souci = ref<string | null>(null)

async function decider(id: string, decision: 'valider' | 'refuser' | 'annuler') {
  if (decision === 'refuser' && !motif.value.trim()) {
    souci.value = 'Un refus doit être motivé : la famille recevra ce texte.'
    return
  }
  souci.value = null
  enCours.value = id
  try {
    await $fetch(`/api/staff/inscriptions/${id}`, {
      method: 'PATCH',
      body: { decision, motif: motif.value || undefined, remarqueStaff: remarque.value || undefined },
    })
    motif.value = ''
    remarque.value = ''
    ouvert.value = null
    await refresh()
  } catch (e: any) {
    souci.value = e?.data?.statusMessage ?? 'Impossible d’enregistrer la décision.'
  } finally {
    enCours.value = null
  }
}

useHead({ title: 'Dossiers à relire — 16e Fleurus' })
</script>

<template>
  <AppPage
    titre="Dossiers à relire"
    surtitre="Staff"
    chapo="Les inscriptions déposées qui attendent une décision. Valider, c’est confirmer à la famille que la place est prise."
    :retour="{ to: '/staff', texte: 'Back office' }"
  >
    <p v-if="pending" class="alerte alerte--info">Chargement…</p>

    <div v-else-if="!data?.inscriptions.length" class="alerte alerte--bien">
      <UiIcone nom="check" :taille="18" /><span>Rien en attente. Tout est à jour.</span>
    </div>

    <div v-else class="pile">
      <p v-if="souci" class="alerte alerte--erreur" role="alert">
        <UiIcone nom="alerte" :taille="18" /><span>{{ souci }}</span>
      </p>

      <article
        v-for="i in data.inscriptions"
        :key="i.id"
        class="dossier"
        :data-section="i.sectionSlug"
      >
        <header class="dossier__entete">
          <div>
            <h2 class="dossier__nom">{{ i.prenom }} {{ i.nom }}</h2>
            <p class="dossier__meta mono">
              {{ nomSection(i.sectionSlug) }} · né(e) le {{ i.dateNaissance }} · déposé le
              {{ i.deposeeLe ? new Date(i.deposeeLe).toLocaleDateString('fr-BE') : '—' }}
            </p>
          </div>
          <span class="pastille" :class="`pastille--${i.statut}`">{{ i.statut }}</span>
        </header>

        <p v-if="i.remarqueFamille" class="dossier__remarque">
          <UiIcone nom="info" :taille="15" />
          <span>« {{ i.remarqueFamille }} »</span>
        </p>

        <div class="dossier__actions">
          <NuxtLink class="bouton bouton--fantome" :to="`/staff/anime/${i.animeId}`">
            Ouvrir le dossier
          </NuxtLink>
          <button
            class="bouton bouton--principal"
            type="button"
            :disabled="enCours === i.id"
            @click="decider(i.id, 'valider')"
          >
            <UiIcone nom="check" :taille="15" /> Valider
          </button>
          <button
            class="bouton bouton--fantome"
            type="button"
            @click="ouvert = ouvert === i.id ? null : i.id"
          >
            Refuser…
          </button>
        </div>

        <div v-if="ouvert === i.id" class="dossier__refus">
          <UiChamp
            v-model="motif"
            etiquette="Motif du refus"
            nom="motif"
            zone
            :max="600"
            aide="Ce texte est envoyé tel quel à la famille. Écrivez-le comme vous le diriez de vive voix."
            obligatoire
          />
          <UiChamp
            v-model="remarque"
            etiquette="Note interne"
            nom="remarque"
            zone
            :max="2000"
            aide="Visible seulement par le staff."
          />
          <div class="dossier__actions">
            <button
              class="bouton bouton--principal"
              type="button"
              :disabled="enCours === i.id"
              @click="decider(i.id, 'refuser')"
            >
              Confirmer le refus
            </button>
            <button class="bouton bouton--fantome" type="button" @click="ouvert = null">
              Annuler
            </button>
          </div>
        </div>
      </article>
    </div>
  </AppPage>
</template>

<style lang="scss" scoped>
.dossier {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 1.15rem;
  background: rgba($blanc, 0.025);
  border: 1px solid rgba($blanc, 0.07);
  border-inline-start: 3px solid var(--section-teinte);
  border-radius: $r-carte;

  &__entete {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }

  &__nom {
    font-family: $police-titre;
    font-weight: 700;
    font-size: 1.1rem;
    text-transform: uppercase;
  }

  &__meta {
    margin-block-start: 0.2rem;
    font-size: 0.75rem;
    color: rgba($blanc, 0.55);
  }

  &__remarque {
    display: flex;
    gap: 0.5rem;
    font-size: 1rem;
    line-height: 1.55;
    color: rgba($blanc, 0.72);
    font-style: italic;
  }

  &__actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  &__refus {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding-block-start: 0.75rem;
    border-block-start: 1px solid rgba($blanc, 0.08);
  }
}

.pastille {
  padding: 0.15rem 0.6rem;
  border-radius: $r-pilule;
  font-size: 0.75rem;
  background: rgba($blanc, 0.08);
  color: rgba($blanc, 0.7);

  &--en-attente-paiement {
    background: rgba(#f0a32e, 0.15);
    color: #f0a32e;
  }
}
</style>
