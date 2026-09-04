<script setup lang="ts">
// L'espace photos est le premier point du cahier des charges. Il n'est pas
// construit ici, et ce n'est pas un manque de temps : mettre en ligne des
// photos d'animés demande une décision du staff d'unité sur le droit à
// l'image, et un stockage protégé. Cette page pose le cadre.

const { voitLesPhotos, definition } = useRole()

const albums = [
  { titre: 'Camp d’été 2026', section: 'unité', nb: null },
  { titre: 'Cavalcade 2026', section: 'unité', nb: null },
  { titre: 'Marche Adeps 2026', section: 'route', nb: null },
  { titre: 'Camp 2025', section: 'unité', nb: null },
]

useHead({ title: 'Photos — 16e Fleurus' })
</script>

<template>
  <AppPage
    titre="Les photos de l’unité"
    surtitre="Photos"
    chapo="Le premier point du cahier des charges. La galerie est prévue en accès restreint, jamais en public."
  >
    <div v-if="!voitLesPhotos" class="verrou">
      <UiIcone nom="cadenas" :taille="22" />
      <div>
        <p class="verrou__titre">Réservé aux familles de l’unité</p>
        <p class="verrou__texte">
          Vous consultez le site en vue « {{ definition.nom }} ». Les photos de camp montrent des
          mineurs : elles ne seront jamais accessibles publiquement.
        </p>
      </div>
    </div>

    <template v-else>
      <div class="chantier">
        <UiIcone nom="info" :taille="18" />
        <div>
          <p class="chantier__titre">Trois décisions avant de mettre la première photo en ligne</p>
          <ol class="chantier__liste">
            <li>Le staff d’unité doit trancher la question du droit à l’image des animés.</li>
            <li>
              Il faut un stockage protégé : un site généré en statique sert les fichiers à qui
              connaît l’adresse, même sans lien vers eux.
            </li>
            <li>Il faut désigner qui dépose et qui retire une photo à la demande d’un parent.</li>
          </ol>
        </div>
      </div>

      <section class="bloc">
        <h2 class="surtitre">Les albums prévus</h2>
        <ul class="albums">
          <li v-for="a in albums" :key="a.titre">
            <div class="album">
              <div class="album__cadre">
                <UiIcone nom="photo" :taille="26" />
              </div>
              <div>
                <p class="album__titre">{{ a.titre }}</p>
                <p class="album__meta mono">{{ a.section }} · en attente</p>
              </div>
            </div>
          </li>
        </ul>
      </section>
    </template>
  </AppPage>
</template>

<style lang="scss" scoped>
.verrou,
.chantier {
  display: flex;
  gap: 0.85rem;
  padding: 1.1rem 1.25rem;
  border-radius: $r-carte;
  max-inline-size: 48rem;
}

.verrou {
  background: rgba($blanc, 0.04);
  border: 1px solid rgba($blanc, 0.08);
  color: rgba($blanc, 0.68);

  &__titre {
    font-weight: 600;
    font-size: 1rem;
    color: $blanc;
  }

  &__texte {
    margin-block-start: 0.35rem;
    font-size: 1rem;
    line-height: 1.6;
  }
}

.chantier {
  background: rgba(#f0a32e, 0.07);
  border: 1px solid rgba(#f0a32e, 0.22);
  color: rgba(#f0a32e, 0.9);

  &__titre {
    font-weight: 600;
    font-size: 1rem;
  }

  &__liste {
    margin: 0.5rem 0 0;
    padding-inline-start: 1.1rem;
    list-style: decimal;
    font-size: 1rem;
    line-height: 1.7;
    color: rgba(#f0a32e, 0.72);
  }
}

.bloc {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.albums {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  gap: 0.5rem;
  margin: 0;
}

.album {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.85rem;
  background: rgba($blanc, 0.035);
  border: 1px dashed rgba($blanc, 0.1);
  border-radius: $r-champ;

  &__cadre {
    display: grid;
    place-items: center;
    inline-size: 3rem;
    block-size: 3rem;
    border-radius: $r-champ;
    background: rgba($blanc, 0.04);
    color: rgba($blanc, 0.25);
  }

  &__titre {
    font-size: 1rem;
    font-weight: 500;
  }

  &__meta {
    margin-block-start: 0.15rem;
    font-size: 0.75rem;
    color: rgba($blanc, 0.58);
  }
}
</style>
