<script setup lang="ts">
definePageMeta({ middleware: 'staff' })

const { data, pending } = await useFetch('/api/staff/rgpd')

const libellesAction: Record<string, string> = {
  lecture: 'a consulté', creation: 'a créé', modification: 'a modifié',
  suppression: 'a supprimé', export: 'a exporté',
}

function enRetard(echeance: string, traitee: string | null) {
  return !traitee && new Date(echeance) < new Date()
}

useHead({ title: 'RGPD — 16e Fleurus' })
</script>

<template>
  <AppPage
    titre="RGPD"
    surtitre="Staff d’unité"
    chapo="Les demandes des familles, et la trace de ce qui a été consulté. Le délai légal de réponse est d’un mois."
    :retour="{ to: '/staff', texte: 'Back office' }"
  >
    <div class="pile">
      <section class="groupe">
        <h2 class="groupe__titre">Demandes en cours</h2>
        <p v-if="pending" class="doux">Chargement…</p>
        <p v-else-if="!data?.demandes.length" class="doux">Aucune demande.</p>

        <ul v-else class="demandes">
          <li
            v-for="d in data.demandes"
            :key="d.id"
            :class="{ 'demandes--retard': enRetard(d.echeanceLe as any, d.traiteeLe as any) }"
          >
            <div class="demandes__haut">
              <strong>{{ d.type }}</strong>
              <span class="mono petit">{{ d.email }}</span>
              <span class="pastille">{{ d.statut }}</span>
            </div>
            <p v-if="d.objet" class="demandes__objet">« {{ d.objet }} »</p>
            <p class="petit doux">
              Déposée le {{ new Date(d.demandeeLe).toLocaleDateString('fr-BE') }} · échéance
              {{ new Date(d.echeanceLe).toLocaleDateString('fr-BE') }}
              <span v-if="enRetard(d.echeanceLe as any, d.traiteeLe as any)" class="retard">
                — en retard
              </span>
            </p>
          </li>
        </ul>
      </section>

      <section class="groupe">
        <h2 class="groupe__titre">Derniers accès enregistrés</h2>
        <p class="groupe__chapo">
          Ce journal est la contrepartie du droit d’ouvrir les dossiers. Il est conservé trois ans,
          puis effacé automatiquement.
        </p>
        <!-- Le cadre porte le défilement et le focus clavier ; la liste garde
             sa sémantique de liste. -->
        <div class="cadre-journal" tabindex="0" role="group" aria-label="Journal des accès, liste défilante">
        <ol class="journal">
          <li v-for="(a, i) in data?.acces ?? []" :key="i">
            <span class="journal__quand mono">
              {{ new Date(a.quand).toLocaleString('fr-BE', { dateStyle: 'short', timeStyle: 'short' }) }}
            </span>
            <span>
              <strong>{{ a.prenom ? `${a.prenom} ${a.nom}` : 'Système' }}</strong>
              {{ libellesAction[a.action] ?? a.action }} {{ a.cible }}
              <span v-if="a.detail" class="doux">({{ a.detail }})</span>
            </span>
          </li>
        </ol>
        </div>
      </section>

      <section class="groupe">
        <h2 class="groupe__titre">Ce qui se fait tout seul</h2>
        <ul class="regles">
          <li>Les sessions expirées sont effacées chaque nuit.</li>
          <li>Les fiches santé sont effacées un an après la fin de la saison concernée.</li>
          <li>Le journal d’accès est effacé au bout de trois ans.</li>
          <li>Les personnes sans lien depuis trois ans sont anonymisées.</li>
          <li>
            Les paiements et les consentements ne sont pas effacés automatiquement : comptabilité
            et preuve. Voir la politique de confidentialité.
          </li>
        </ul>
      </section>
    </div>
  </AppPage>
</template>

<style lang="scss" scoped>
.demandes {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    padding: 0.7rem 0.85rem;
    background: rgba($blanc, 0.03);
    border-radius: $r-champ;
  }

  &--retard {
    background: rgba($rouge, 0.1) !important;
  }

  &__haut {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    flex-wrap: wrap;
    font-size: 1rem;
  }

  &__objet {
    margin-block-start: 0.3rem;
    font-size: 1rem;
    font-style: italic;
    color: rgba($blanc, 0.7);
  }
}

.pastille {
  padding: 0.1rem 0.5rem;
  border-radius: $r-pilule;
  background: rgba($blanc, 0.08);
  font-size: 0.75rem;
  color: rgba($blanc, 0.7);
}

.cadre-journal {
  max-block-size: 26rem;
  border-radius: $r-champ;
  @include defilement-discret;
  @include focus-visible;
}

.journal {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: grid;
    grid-template-columns: 9.5rem 1fr;
    gap: 0.75rem;
    font-size: 1rem;
    padding-block: 0.28rem;
    border-block-end: 1px solid rgba($blanc, 0.05);

    @include jusqua($bp-console) {
      grid-template-columns: 1fr;
      gap: 0.1rem;
    }
  }

  &__quand {
    font-size: 0.75rem;
    color: rgba($blanc, 0.5);
  }
}

.regles {
  margin: 0;
  padding-inline-start: 1.1rem;
  font-size: 1rem;
  line-height: 1.7;
  color: rgba($blanc, 0.72);
}

.petit {
  font-size: 0.75rem;
}
.doux {
  color: rgba($blanc, 0.5);
}
.retard {
  color: $rouge-texte;
}
</style>
