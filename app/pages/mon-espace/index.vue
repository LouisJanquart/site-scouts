<script setup lang="ts">
import { bornesSections } from '#shared/orientation'

definePageMeta({ middleware: 'connecte' })

const { moi, estStaff, seDeconnecter } = useCompte()
const { data, pending, refresh } = await useFetch('/api/mon-espace')

const nomSection = (slug: string) => bornesSections.find((s) => s.slug === slug)?.nom ?? slug

const libellesStatut: Record<string, string> = {
  brouillon: 'Brouillon',
  envoyee: 'En attente de relecture',
  'en-attente-paiement': 'En attente de paiement',
  validee: 'Inscription validée',
  refusee: 'Refusée',
  annulee: 'Annulée',
}

useHead({ title: 'Mon espace — 16e Fleurus' })
</script>

<template>
  <AppPage
    :titre="`Bonjour ${moi?.prenom ?? ''}`"
    surtitre="Espace des familles"
    chapo="Vos enfants, leurs inscriptions, et ce qu’il reste à faire."
  >
    <template #entete>
      <nav class="liens">
        <NuxtLink v-if="estStaff" class="bouton bouton--fantome" to="/gestion">
          <UiIcone nom="bouclier" :taille="15" /> Back office
        </NuxtLink>
        <NuxtLink class="bouton bouton--fantome" to="/inscription">
          <UiIcone nom="plus" :taille="15" /> Inscrire un enfant
        </NuxtLink>
        <NuxtLink class="bouton bouton--fantome" to="/mon-espace/mes-donnees">
          <UiIcone nom="cadenas" :taille="15" /> Mes données
        </NuxtLink>
        <NuxtLink class="bouton bouton--fantome" to="/mon-espace/compte">
          <UiIcone nom="reglages" :taille="15" /> Mon compte
        </NuxtLink>
        <button class="bouton bouton--fantome" type="button" @click="seDeconnecter">
          <UiIcone nom="sortie" :taille="15" /> Se déconnecter
        </button>
      </nav>
    </template>

    <p v-if="pending" class="alerte alerte--info">Chargement…</p>

    <div v-else-if="!data?.enfants.length" class="alerte alerte--info">
      <UiIcone nom="info" :taille="18" />
      <span>
        Aucun enfant inscrit pour l’instant.
        <NuxtLink to="/inscription">Inscrire un enfant</NuxtLink>.
      </span>
    </div>

    <div v-else class="enfants">
      <article v-for="e in data.enfants" :key="e.id" class="enfant">
        <header class="enfant__entete">
          <h2 class="enfant__nom">{{ e.prenom }} {{ e.nom }}</h2>
          <NuxtLink class="lien-fleche" :to="`/mon-espace/enfant/${e.id}`">
            Son dossier <UiIcone nom="chevrons-droite" :taille="14" />
          </NuxtLink>
        </header>

        <ul v-if="e.inscriptions.length" class="inscriptions">
          <li
            v-for="i in e.inscriptions"
            :key="i.id"
            class="inscription"
            :data-section="i.sectionSlug"
          >
            <div class="inscription__haut">
              <span class="etiquette etiquette--pleine">{{ nomSection(i.sectionSlug) }}</span>
              <span class="inscription__saison mono">{{ i.saison }}</span>
            </div>
            <p class="inscription__statut" :class="`inscription__statut--${i.statut}`">
              {{ libellesStatut[i.statut] ?? i.statut }}
            </p>
            <p v-if="i.cotisationDueCentimes > 0 && !i.paiements.some((p) => p.statut === 'paye')"
               class="inscription__reste">
              Cotisation à régler : {{ euros(i.cotisationDueCentimes) }}
              <NuxtLink class="bouton bouton--principal bouton--petit" :to="`/mon-espace/paiement/${i.id}`">
                Payer
              </NuxtLink>
            </p>
            <p v-else-if="i.cotisationDueCentimes > 0" class="inscription__regle">
              <UiIcone nom="check" :taille="14" /> Cotisation réglée
            </p>
          </li>
        </ul>
        <p v-else class="doux">Aucune inscription enregistrée.</p>
      </article>
    </div>
  </AppPage>
</template>

<style lang="scss" scoped>
.liens {
  display: flex;
  flex-wrap: wrap;
  gap: $esp-1;
  margin-block-start: $esp-3;

  // Sur téléphone, deux colonnes égales : les pilules empilées à leur largeur
  // naturelle dessinaient un bord droit en dents de scie.
  @include jusqua($bp-poche) {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    > * {
      justify-content: center;
      text-align: center;
    }
  }
}

.enfants {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
}

.enfant {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 1.15rem;
  background: rgba($blanc, 0.025);
  border: 1px solid rgba($blanc, 0.07);
  border-radius: $r-carte;

  &__entete {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }

  &__nom {
    font-family: $police-titre;
    font-weight: 700;
    font-size: 1.15rem;
    text-transform: uppercase;
    letter-spacing: -0.01em;
  }
}

.inscriptions {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.inscription {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.8rem;
  border-radius: $r-champ;
  background: rgba($blanc, 0.03);

  &__haut {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }

  &__saison {
    font-size: 0.75rem;
    color: rgba($blanc, 0.5);
  }

  &__statut {
    font-size: 1rem;
    font-weight: 600;

    &--validee {
      color: #86efac;
    }
    &--refusee,
    &--annulee {
      color: rgba($blanc, 0.5);
    }
    &--en-attente-paiement {
      color: #f0a32e;
    }
  }

  &__reste {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
    font-size: 1rem;
    color: rgba($blanc, 0.72);
  }

  &__regle {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 1rem;
    color: #86efac;
  }
}

.bouton--petit {
  padding: 0.3rem 0.75rem;
  font-size: 0.75rem;
}
</style>
