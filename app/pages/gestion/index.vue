<script setup lang="ts">
definePageMeta({ middleware: 'staff' })

const { moi, estCU } = useCompte()

// La portée est partagée avec les autres modules : elle vit dans
// « usePortee » et se lit dans l'adresse.
const { portee, nomDeSection, nomPortee } = usePortee()

const { data, pending } = await useFetch('/api/staff/animes', {
  query: computed(() => ({ section: portee.value || undefined })),
})

const nomSection = (slug: string) => nomDeSection(slug)

// Les chiffres qui disent l'état de la section d'un coup d'œil.
const resume = computed(() => {
  const a = data.value?.animes ?? []
  return {
    total: a.length,
    aValider: a.filter((x) => x.statut !== 'validee').length,
    sansFiche: a.filter((x) => !x.ficheRemplie).length,
    attention: a.filter((x) => x.pointDAttention).length,
    // Ce chiffre-là sert au chef à savoir combien de familles rappeler avant
    // un camp. Il compte des dossiers, pas des euros.
    cotisationDue: a.filter((x) => x.cotisationAttendue && !x.regle).length,
  }
})

useHead({ title: 'Back office — 16e Fleurus' })
</script>

<template>
  <AppPage
    titre="Back office"
    surtitre="Staff"
    :chapo="
      estCU
        ? `Portée : ${nomPortee}. Le serveur refait le contrôle des droits à chaque requête.`
        : `Portée : ${nomPortee}. Vous voyez les animés de vos sections, rien d’autre — c’est voulu.`
    "
  >
    <template #entete>
      <GestionBarre />
    </template>

    <div class="pile">
      <div class="chiffres">
        <div class="chiffre">
          <span class="chiffre__valeur mono">{{ resume.total }}</span>
          <span class="chiffre__nom">animés</span>
        </div>
        <div class="chiffre">
          <span class="chiffre__valeur mono">{{ resume.aValider }}</span>
          <span class="chiffre__nom">dossiers pas encore validés</span>
        </div>
        <div class="chiffre">
          <span class="chiffre__valeur mono">{{ resume.sansFiche }}</span>
          <span class="chiffre__nom">sans fiche santé</span>
        </div>
        <div class="chiffre" :class="{ 'chiffre--ambre': resume.cotisationDue }">
          <span class="chiffre__valeur mono">{{ resume.cotisationDue }}</span>
          <span class="chiffre__nom">cotisations en attente</span>
        </div>
        <div class="chiffre chiffre--alerte">
          <span class="chiffre__valeur mono">{{ resume.attention }}</span>
          <span class="chiffre__nom">fiches à lire avant le camp</span>
        </div>
      </div>

      <p v-if="pending" class="alerte alerte--info">Chargement…</p>

      <div v-else-if="!data?.animes.length" class="alerte alerte--info">
        <UiIcone nom="info" :taille="18" />
        <span>Aucun animé inscrit pour la saison en cours dans cette sélection.</span>
      </div>

      <div v-else class="tableau-cadre" tabindex="0" role="group" aria-label="Liste des animés">
        <table class="tableau">
          <caption class="lecteur-seul">Animés inscrits, saison {{ data.saison }}</caption>
          <thead>
            <tr>
              <th scope="col">Nom</th>
              <th scope="col">Section</th>
              <th scope="col">Né(e) le</th>
              <th scope="col">Statut</th>
              <th scope="col">Fiche santé</th>
              <th scope="col">Cotisation</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in data.animes" :key="a.inscriptionId" :data-section="a.sectionSlug">
              <th scope="row">
                <NuxtLink :to="`/gestion/anime/${a.animeId}`">{{ a.prenom }} {{ a.nom }}</NuxtLink>
                <span v-if="a.totem" class="doux"> — {{ a.totem }}</span>
              </th>
              <td>{{ nomSection(a.sectionSlug) }}</td>
              <td class="mono">{{ a.dateNaissance }}</td>
              <td>
                <span class="pastille" :class="`pastille--${a.statut}`">{{ a.statut }}</span>
              </td>
              <td>
                <span v-if="!a.ficheRemplie" class="manque">manquante</span>
                <span v-else-if="a.pointDAttention" class="attention">
                  <UiIcone nom="alerte" :taille="13" /> à lire
                </span>
                <span v-else class="doux">rien à signaler</span>
              </td>
              <td>
                <!-- Un chef voit l'état, le CU et le trésorier voient aussi le
                     montant : une cotisation réduite ne doit pas s'afficher à
                     toute l'équipe. -->
                <span v-if="a.regle" class="regle">
                  <UiIcone nom="check" :taille="13" /> réglée
                </span>
                <span v-else-if="a.cotisationAttendue" class="manque">
                  {{ data?.voitLesMontants ? euros(a.cotisationDueCentimes) : 'en attente' }}
                </span>
                <span v-else class="doux">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AppPage>
</template>

<style lang="scss" scoped>
.liens {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-block-start: 1.25rem;
}

.chiffres {
  display: grid;
  gap: 0.5rem;
  grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
}

.chiffre {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.85rem 1rem;
  background: rgba($blanc, 0.03);
  border-radius: $r-champ;

  &__valeur {
    font-size: 1.6rem;
    font-weight: 500;
    color: $cyan;
  }

  &__nom {
    font-size: 0.75rem;
    line-height: 1.4;
    color: rgba($blanc, 0.6);
  }

  &--alerte &__valeur {
    color: $rouge-texte;
  }

  &--ambre &__valeur {
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
  font-size: 1rem;

  th,
  td {
    text-align: start;
    padding: 0.55rem 0.7rem;
    border-block-end: 1px solid rgba($blanc, 0.05);
    white-space: nowrap;
  }

  thead th {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--section-teinte);
  }

  tbody th {
    font-weight: 600;
    a {
      color: $blanc;
      text-decoration: underline;
      text-underline-offset: 3px;
      @include focus-visible;
    }
  }
}

.pastille {
  padding: 0.1rem 0.5rem;
  border-radius: $r-pilule;
  font-size: 0.75rem;
  background: rgba($blanc, 0.08);
  color: rgba($blanc, 0.7);

  &--validee {
    background: rgba(#4ade80, 0.14);
    color: #86efac;
  }
  &--en-attente-paiement {
    background: rgba(#f0a32e, 0.15);
    color: #f0a32e;
  }
}

.manque {
  color: $rouge-texte;
}
.attention {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: #f0a32e;
}
.regle {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: #86efac;
}
.doux {
  color: rgba($blanc, 0.62);
}
</style>
