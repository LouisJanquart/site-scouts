<script setup lang="ts">
const { definition } = useRole()
const { contenu, documents } = useContenu()

const parCategorie = computed(() =>
  contenu.value.categoriesDocuments
    .map((c) => ({ ...c, docs: documents.value.filter((d: any) => d.categorie === c.cle) }))
    .filter((c) => c.docs.length),
)

useHead({ title: 'Documents — 16e Fleurus' })
</script>

<template>
  <AppPage
    titre="Les documents de l’unité"
    surtitre="Documents"
    chapo="Ce que l’espace doit contenir, et pour qui. Les fichiers eux-mêmes ne sont pas encore en ligne : cette page décrit l’arborescence retenue."
  >
    <div class="chantier">
      <UiIcone nom="info" :taille="18" />
      <div>
        <p class="chantier__titre">Rien n’est encore déposé</p>
        <p class="chantier__texte">
          Cette page est l’ossature de l’espace documents décrit dans le cahier des charges. Chaque
          entrée dit qui doit pouvoir y accéder. Le dépôt des fichiers suppose un stockage et une
          connexion, qui restent à mettre en place.
        </p>
      </div>
    </div>

    <section v-for="c in parCategorie" :key="c.cle" class="bloc">
      <h2 class="surtitre">{{ c.nom }}</h2>
      <ul class="docs">
        <li v-for="d in c.docs" :key="d.titre">
          <div class="doc" :class="{ 'doc--indisponible': !d.disponible }">
            <span class="doc__format mono">{{ d.format }}</span>
            <span class="doc__texte">
              <span class="doc__titre">{{ d.titre }}</span>
              <span class="doc__desc">{{ d.description }}</span>
            </span>
            <span class="etiquette doc__pour">
              {{
                d.pour === 'tous'
                  ? 'Public'
                  : d.pour === 'parents'
                    ? 'Parents'
                    : d.pour === 'animes'
                      ? 'Animés'
                      : 'Chefs'
              }}
            </span>
          </div>
        </li>
      </ul>
    </section>

    <p class="doux note">
      Vue « {{ definition.nom }} » : {{ liste.length }} document{{ liste.length > 1 ? 's' : '' }}
      visible{{ liste.length > 1 ? 's' : '' }}. Changez de rôle en bas à gauche pour voir la
      différence.
    </p>
  </AppPage>
</template>

<style lang="scss" scoped>
.chantier {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.15rem;
  background: rgba(#f0a32e, 0.07);
  border: 1px solid rgba(#f0a32e, 0.22);
  border-radius: $r-carte;
  color: rgba(#f0a32e, 0.9);
  max-inline-size: 48rem;

  &__titre {
    font-weight: 600;
    font-size: 0.9rem;
  }

  &__texte {
    margin-block-start: 0.3rem;
    font-size: 0.82rem;
    line-height: 1.6;
    color: rgba(#f0a32e, 0.7);
  }
}

.bloc {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.docs {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin: 0;
}

.doc {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 0.85rem 1rem;
  background: rgba($blanc, 0.035);
  border-radius: $r-champ;

  // Un document pas encore déposé se signale par un cadre pointillé, pas par
  // une opacité : baisser l'opacité fait passer tout le texte sous le seuil
  // de contraste.
  &--indisponible {
    background: none;
    border: 1px dashed rgba($blanc, 0.12);
  }

  &__format {
    flex-shrink: 0;
    padding: 0.15rem 0.45rem;
    background: rgba($blanc, 0.06);
    border-radius: 4px;
    font-size: 0.6rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: rgba($blanc, 0.72);
  }

  &__texte {
    flex: 1;
    min-inline-size: 0;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  &__titre {
    font-size: 0.9rem;
    font-weight: 500;
  }

  &__desc {
    font-size: 0.8rem;
    line-height: 1.55;
    color: rgba($blanc, 0.62);
  }

  &__pour {
    flex-shrink: 0;
    color: rgba($blanc, 0.6);
  }
}

.note {
  font-size: 0.82rem;
}
</style>
