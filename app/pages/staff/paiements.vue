<script setup lang="ts">
import { bornesSections } from '#shared/orientation'

definePageMeta({ middleware: 'staff' })

const { data, pending, refresh } = await useFetch('/api/staff/paiements')
const nomSection = (slug: string) => bornesSections.find((s) => s.slug === slug)?.nom ?? slug
const souci = ref<string | null>(null)
const enCours = ref<string | null>(null)

async function pointer(id: string, statut: 'paye' | 'ouvert', moyen?: 'virement' | 'especes') {
  enCours.value = id
  souci.value = null
  try {
    await $fetch(`/api/staff/paiements/${id}`, { method: 'PATCH', body: { statut, moyen } })
    await refresh()
  } catch (e: any) {
    souci.value = e?.data?.statusMessage ?? 'Impossible d’enregistrer.'
  } finally {
    enCours.value = null
  }
}

const reste = computed(() => (data.value?.total.du ?? 0) - (data.value?.total.encaisse ?? 0))

const libellesMotif: Record<string, string> = {
  plein: 'tarif plein',
  'famille-2': 'famille (2)',
  'famille-3': 'famille (3+)',
  social: 'tarif social',
  route: 'assurance seule',
  tardive: 'inscription tardive',
  ressource: 'personne-ressource',
}

// Le barème vient de la fédération, pas de nous : on l'affiche avec sa source,
// pour que le trésorier puisse vérifier et que personne n'ait à croire le site
// sur parole.
const grille = computed(() => {
  const b = data.value?.bareme
  if (!b) return []
  return [
    { cas: 'Un seul membre du ménage', montant: b.pleinCentimes },
    { cas: 'Deux membres — chacun', montant: b.famille2Centimes },
    { cas: 'Trois membres ou plus — chacun', montant: b.famille3PlusCentimes },
    { cas: 'Route, tardive, personne-ressource', montant: b.reduitCentimes },
    { cas: 'Tarif social', montant: b.socialCentimes },
  ]
})

async function basculerTarifSocial(familleId: string, accorde: boolean) {
  enCours.value = familleId
  souci.value = null
  try {
    await $fetch(`/api/staff/familles/${familleId}/tarif-social`, {
      method: 'POST',
      body: { accorde },
    })
    await refresh()
  } catch (e: any) {
    souci.value = e?.data?.statusMessage ?? 'Impossible d’enregistrer.'
  } finally {
    enCours.value = null
  }
}

useHead({ title: 'Cotisations — 16e Fleurus' })
</script>

<template>
  <AppPage
    titre="Cotisations"
    surtitre="Staff"
    chapo="Le suivi de la caisse. Pointer un virement ou une enveloppe se fait d’un clic."
    :retour="{ to: '/staff', texte: 'Back office' }"
  >
    <div class="pile">
      <div v-if="data" class="chiffres">
        <div class="chiffre">
          <span class="chiffre__valeur mono">{{ euros(data.total.du) }}</span>
          <span class="chiffre__nom">appelé</span>
        </div>
        <div class="chiffre">
          <span class="chiffre__valeur mono">{{ euros(data.total.encaisse) }}</span>
          <span class="chiffre__nom">encaissé</span>
        </div>
        <div class="chiffre" :class="{ 'chiffre--alerte': reste > 0 }">
          <span class="chiffre__valeur mono">{{ euros(reste) }}</span>
          <span class="chiffre__nom">reste à percevoir</span>
        </div>
      </div>

      <details v-if="grille.length" class="bareme">
        <summary>
          Le barème {{ data?.bareme.version }}
          <span class="doux">— pourquoi chacun paie ce qu’il paie</span>
        </summary>
        <div class="bareme__corps">
          <p class="doux petit">
            Il vient de la fédération, pas de l’unité. Le point à retenir : le tarif famille
            s’applique à <strong>tous</strong> les membres du ménage inscrits, pas seulement au
            deuxième — deux enfants, c’est 46 € + 46 €, pas 57,50 € + 46 €.
          </p>
          <ul class="bareme__grille">
            <li v-for="g in grille" :key="g.cas">
              <span>{{ g.cas }}</span>
              <span class="mono">{{ euros(g.montant) }}</span>
            </li>
          </ul>
          <p class="doux petit">
            Supplément local de l’unité : {{ euros(data?.supplementLocalCentimes ?? 0) }} par enfant.
            <a :href="data?.bareme.source" target="_blank" rel="noopener">Le barème publié</a>
          </p>
        </div>
      </details>

      <p v-if="souci" class="alerte alerte--erreur" role="alert">
        <UiIcone nom="alerte" :taille="18" /><span>{{ souci }}</span>
      </p>
      <p v-if="pending" class="alerte alerte--info">Chargement…</p>

      <div v-else class="tableau-cadre" tabindex="0" role="group" aria-label="Suivi des cotisations">
        <table class="tableau">
          <caption class="lecteur-seul">Cotisations de la saison {{ data?.saison }}</caption>
          <thead>
            <tr>
              <th scope="col">Animé</th>
              <th scope="col">Section</th>
              <th scope="col">Dû</th>
              <th scope="col">Tarif</th>
              <th scope="col">Moyen</th>
              <th scope="col">Communication</th>
              <th scope="col">État</th>
              <th scope="col"><span class="lecteur-seul">Action</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(l, i) in data?.lignes ?? []" :key="i" :data-section="l.sectionSlug">
              <th scope="row">{{ l.prenom }} {{ l.nom }}</th>
              <td>{{ nomSection(l.sectionSlug) }}</td>
              <td class="mono">{{ euros(l.duCentimes) }}</td>
              <td>
                <span class="motif" :class="{ 'motif--social': l.motifTarif === 'social' }">
                  {{ libellesMotif[l.motifTarif ?? ''] ?? '—' }}
                </span>
              </td>
              <td>{{ l.moyen ?? '—' }}</td>
              <td class="mono petit">{{ l.communication ?? '—' }}</td>
              <td>
                <span v-if="l.statut === 'paye'" class="regle">
                  réglé le {{ l.payeLe ? new Date(l.payeLe).toLocaleDateString('fr-BE') : '' }}
                </span>
                <span v-else-if="l.statut" class="manque">{{ l.statut }}</span>
                <span v-else class="doux">aucun paiement</span>
              </td>
              <td>
                <button
                  v-if="l.paiementId && l.statut !== 'paye'"
                  class="mini"
                  type="button"
                  :disabled="enCours === l.paiementId"
                  @click="pointer(l.paiementId!, 'paye', 'virement')"
                >
                  <UiIcone nom="check" :taille="13" /> Pointer
                </button>
                <button
                  v-else-if="l.paiementId"
                  class="mini mini--annuler"
                  type="button"
                  :disabled="enCours === l.paiementId"
                  @click="pointer(l.paiementId!, 'ouvert')"
                >
                  Dépointer
                </button>
                <button
                  class="mini mini--social"
                  type="button"
                  :disabled="enCours === l.familleId"
                  :title="
                    l.tarifSocial
                      ? 'Retirer le tarif social à la famille ' + l.familleNom
                      : 'Accorder le tarif social à la famille ' + l.familleNom
                  "
                  @click="basculerTarifSocial(l.familleId, !l.tarifSocial)"
                >
                  {{ l.tarifSocial ? 'Retirer social' : 'Social' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AppPage>
</template>

<style lang="scss" scoped>
.chiffres {
  display: grid;
  gap: 0.5rem;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
}
.chiffre {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.85rem 1rem;
  background: rgba($blanc, 0.03);
  border-radius: $r-champ;

  &__valeur {
    font-size: 1.35rem;
    font-weight: 500;
    color: $cyan;
  }
  &__nom {
    font-size: 0.74rem;
    color: rgba($blanc, 0.6);
  }
  &--alerte &__valeur {
    color: #f0a32e;
  }
}

.tableau-cadre {
  overflow-x: auto;
  border-radius: $r-carte;
  background: rgba($blanc, 0.02);
  @include defilement-discret;
}

.tableau {
  inline-size: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;

  th,
  td {
    text-align: start;
    padding: 0.5rem 0.7rem;
    border-block-end: 1px solid rgba($blanc, 0.05);
    white-space: nowrap;
  }

  thead th {
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--section-teinte);
  }
}

.petit {
  font-size: 0.75rem;
  line-height: 1.55;
}

.bareme {
  background: rgba($blanc, 0.03);
  border-radius: $r-champ;
  padding: 0.75rem 1rem;

  summary {
    cursor: pointer;
    font-size: 0.86rem;
    font-weight: 600;
    @include focus-visible;
  }

  &__corps {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    padding-block-start: 0.75rem;
    max-inline-size: 40rem;
  }

  &__grille {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    margin: 0;
    padding: 0;
    list-style: none;

    li {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.35rem 0.6rem;
      background: rgba($blanc, 0.03);
      border-radius: 6px;
      font-size: 0.82rem;
    }

    .mono {
      color: $cyan;
      font-weight: 500;
    }
  }

  a {
    color: $cyan;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
}

.motif {
  font-size: 0.72rem;
  color: rgba($blanc, 0.66);

  &--social {
    color: #86efac;
  }
}

.mini {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.6rem;
  border-radius: $r-pilule;
  background: rgba($cyan, 0.14);
  color: $cyan;
  font-size: 0.72rem;
  font-weight: 600;
  @include focus-visible;
  &:hover {
    background: rgba($cyan, 0.24);
  }
  &--annuler {
    background: rgba($blanc, 0.07);
    color: rgba($blanc, 0.6);
  }

  &--social {
    margin-inline-start: 0.35rem;
    background: rgba($blanc, 0.07);
    color: rgba($blanc, 0.66);

    &:hover {
      background: rgba(#4ade80, 0.16);
      color: #86efac;
    }
  }
}

.regle {
  color: #86efac;
}
.manque {
  color: #f0a32e;
}
.doux {
  color: rgba($blanc, 0.62);
}
</style>
