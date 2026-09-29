<script setup lang="ts">
// La présentation d'une section : ce qu'un parent qui découvre vient chercher.
// La prochaine réunion d'abord, la section ensuite, le staff en dernier.
const { slug, section } = useSectionCourante()
const { prochaineReunion, prochainSamedi } = usePlanning()
const { role, voitLeCalendrier, voitLeStaff } = useRole()
const { chefsDeSection, adressesDeSection } = useContenu()

const staff = computed(() => chefsDeSection(slug.value))
// L'adresse de fonction de la section : servie aux familles, jamais aux
// visiteurs.
const adresse = computed(() => adressesDeSection.value[slug.value] ?? null)
const prochaine = computed(() => prochaineReunion(slug.value))
</script>

<template>
  <template v-if="section">
    <section v-if="prochaine" class="bloc">
      <h2 class="surtitre">Prochaine réunion</h2>
      <div class="prochaine">
        <p class="prochaine__date titre titre--moyen">{{ formaterDate(prochaine.date, true) }}</p>
        <p v-if="voitLeCalendrier" class="prochaine__quoi">{{ prochaine.libelle }}</p>
        <p v-else class="prochaine__quoi">Réunion au local</p>
        <p class="prochaine__horaire mono doux">
          {{ prochaine.horaire === 'hiver' ? '14h00 – 17h00' : '14h00 – 17h30' }}
          <template v-if="voitLeCalendrier && prochaine.remarque">
            · {{ prochaine.remarque }}
          </template>
        </p>
      </div>
      <NuxtLink class="lien-fleche" :to="`/sections/${slug}/agenda`">
        Tout l’agenda de la section
        <UiIcone nom="chevrons-droite" :taille="14" />
      </NuxtLink>
    </section>

    <section class="bloc">
      <h2 class="surtitre">La section</h2>
      <div class="prose">
        <p>{{ section.description }}</p>
      </div>
      <dl class="fiche">
        <div v-if="section.ages" class="fiche__ligne">
          <dt>Âges</dt>
          <dd>{{ section.ages }}</dd>
        </div>
        <div v-if="section.genre" class="fiche__ligne">
          <dt>Composition</dt>
          <dd>
            {{
              section.genre === 'mixte' ? 'Mixte' : section.genre === 'filles' ? 'Filles' : 'Garçons'
            }}
          </dd>
        </div>
        <div v-if="voitLeStaff" class="fiche__ligne">
          <dt>Staff</dt>
          <dd>{{ staff.length }} animateur{{ staff.length > 1 ? 's' : '' }}</dd>
        </div>
      </dl>
    </section>

    <!-- Le staff : ce qui est affiché dépend du rôle. -->
    <section v-if="voitLeStaff" class="bloc">
      <h2 class="surtitre">Le staff</h2>
      <ul class="staff">
        <li v-for="c in staff" :key="c.prenom + c.totem">
          <div class="staff__carte">
            <span class="staff__pastille">{{ c.prenom.charAt(0) }}</span>
            <span class="staff__texte">
              <span class="staff__prenom">{{ c.prenom }}</span>
              <span v-if="c.totem" class="staff__totem mono">{{ c.totem }}</span>
            </span>
            <span v-if="c.chefDeStaff" class="etiquette">Chef de staff</span>
            <span v-else-if="c.note" class="etiquette etiquette--sourde">{{ c.note }}</span>
          </div>
        </li>
      </ul>

      <div v-if="adresse" class="contact">
        <UiIcone nom="mail" :taille="18" />
        <a :href="`mailto:${adresse}`">{{ adresse }}</a>
      </div>
      <p v-else class="verrou">
        <UiIcone nom="cadenas" :taille="16" />
        L’adresse de la section est réservée aux familles de l’unité.
      </p>

      <p v-if="role === 'chef'" class="note-chantier">
        Les noms de famille, numéros et adresses personnelles des {{ staff.length }} chefs ne sont
        toujours pas dans le site. Le mécanisme d’accès existe désormais, mais il ne vaut pas
        consentement : il faudra le demander aux personnes concernées, une par une.
      </p>
    </section>

    <!-- Ce qu'un visiteur a le droit de savoir : quand la section se réunit. -->
    <section v-if="!voitLeCalendrier" class="bloc">
      <div v-if="!prochaine && prochainSamedi()" class="prochaine">
        <p class="prochaine__date titre titre--moyen">
          {{ formaterDate(prochainSamedi()!.date, true) }}
        </p>
        <p class="prochaine__quoi">Réunion au local</p>
        <p class="prochaine__horaire mono doux">
          {{ prochainSamedi()!.horaire === 'hiver' ? '14h00 – 17h00' : '14h00 – 17h30' }}
        </p>
      </div>

      <div class="reserve">
        <UiIcone nom="cadenas" :taille="20" />
        <div>
          <p class="reserve__titre">Le reste est réservé aux familles</p>
          <p class="reserve__texte">
            Le programme de chaque samedi, le staff de la section et son adresse de contact ne sont
            pas publics. Pour découvrir la section, le plus simple est de venir aux portes ouvertes
            de septembre.
          </p>
          <NuxtLink class="lien-fleche reserve__lien" to="/events">
            Les rendez-vous ouverts à tous
            <UiIcone nom="chevrons-droite" :taille="14" />
          </NuxtLink>
        </div>
      </div>
    </section>
  </template>
</template>

<style lang="scss" scoped>
.bloc {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.prochaine {
  padding: 1.1rem 1.25rem;
  background: $ardoise;
  border-radius: $r-carte;
  border-inline-start: 3px solid var(--section-teinte);

  &__date {
    text-transform: capitalize;
  }

  &__quoi {
    margin-block-start: 0.25rem;
    font-size: 1rem;
    color: rgba($blanc, 0.8);
  }

  &__horaire {
    margin-block-start: 0.35rem;
    font-size: 1rem;
  }
}

.fiche {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
  gap: 0.75rem;
  margin: 0.5rem 0 0;

  &__ligne {
    padding: 0.75rem 0.9rem;
    background: rgba($blanc, 0.03);
    border-radius: $r-champ;

    dt {
      @include surtitre;
      font-size: 0.75rem;
    }
    dd {
      margin: 0.25rem 0 0;
      font-size: 1rem;
      font-weight: 500;
    }
  }
}

.staff {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr));
  gap: 0.5rem;
  margin: 0;

  &__carte {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.55rem 0.7rem;
    background: rgba($blanc, 0.035);
    border-radius: $r-champ;
  }

  &__pastille {
    display: grid;
    place-items: center;
    inline-size: 2rem;
    block-size: 2rem;
    border-radius: 50%;
    background: color-mix(in srgb, var(--section-teinte) 20%, transparent);
    color: var(--section-teinte);
    font-weight: 700;
    font-size: 1rem;
  }

  &__texte {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-inline-size: 0;
  }

  &__prenom {
    font-size: 1rem;
    font-weight: 500;
  }

  &__totem {
    font-size: 0.75rem;
    color: rgba($blanc, 0.6);
  }
}

.contact {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-block-start: 0.5rem;
  color: var(--section-teinte);
  font-size: 1rem;

  a {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
}

.verrou {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-block-start: 0.5rem;
  font-size: 1rem;
  color: rgba($blanc, 0.6);
}

.note-chantier {
  display: block;
  padding: 0.75rem 0.9rem;
  background: rgba(#f0a32e, 0.08);
  border: 1px solid rgba(#f0a32e, 0.2);
  border-radius: $r-champ;
  color: rgba(#f0a32e, 0.85);
  line-height: 1.55;
}

.reserve {
  display: flex;
  gap: 0.85rem;
  padding: 1.1rem 1.25rem;
  background: rgba($blanc, 0.04);
  border: 1px solid rgba($blanc, 0.09);
  border-radius: $r-carte;
  color: rgba($blanc, 0.66);
  max-inline-size: 44rem;

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

  &__lien {
    padding-inline: 0;
    margin-block-start: 0.6rem;
  }
}
</style>
