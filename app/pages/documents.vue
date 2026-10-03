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
    bento
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

    <UiBloc v-for="c in parCategorie" :key="c.cle" :etiquette="c.nom">
      <ul class="docs">
        <li v-for="d in c.docs" :key="d.titre">
          <div class="doc" :class="{ 'doc--indisponible': !d.disponible }">
            <span class="doc__haut">
              <span class="doc__format mono">{{ d.format }}</span>
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
            </span>
            <span class="doc__titre">{{ d.titre }}</span>
            <span class="doc__desc">{{ d.description }}</span>
          </div>
        </li>
      </ul>
    </UiBloc>

    <p class="doux note">
      Vue « {{ definition.nom }} » : {{ documents.length }} document{{ documents.length > 1 ? 's' : '' }}
      visible{{ documents.length > 1 ? 's' : '' }}.
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

  > svg {
    flex: none;
    margin-block-start: 0.15rem;
  }

  &__titre {
    font-weight: 600;
    font-size: 1rem;
  }

  &__texte {
    margin-block-start: 0.3rem;
    font-size: 1rem;
    line-height: 1.6;
    color: rgba(#f0a32e, 0.7);
  }
}

// Une fiche par document, en grille : sur téléphone, la ligne à trois
// colonnes serrait la description sur 150 px.
.docs {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 17rem), 1fr));
  gap: $esp-1;
  margin: 0;
  padding: 0;
  list-style: none;
}

.doc {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  block-size: 100%;
  padding: $esp-3;
  background: $ardoise;
  border-radius: $r-tuile;

  // Un document pas encore déposé se signale par un cadre pointillé, pas par
  // une opacité : baisser l'opacité fait passer tout le texte sous le seuil
  // de contraste.
  &--indisponible {
    background: none;
    border: 2px dashed rgba($blanc, 0.14);
  }

  &__haut {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: $esp-1;
    margin-block-end: 0.25rem;
  }

  &__format {
    padding: 0.15rem 0.5rem;
    background: rgba($blanc, 0.08);
    border-radius: 0.4rem;
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: rgba($blanc, 0.75);
  }

  &__titre {
    font-size: 1rem;
    font-weight: 600;
  }

  &__desc {
    font-size: 0.92rem;
    line-height: 1.55;
    color: rgba($blanc, 0.68);
  }

  &__pour {
    color: rgba($blanc, 0.7);
  }
}

.note {
  font-size: 0.85rem;
}
</style>
