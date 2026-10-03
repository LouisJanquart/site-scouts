<script setup lang="ts">
// La présentation d'une section : ce qu'un parent qui découvre vient chercher.
// Le prochain samedi d'abord, la section ensuite, le staff et les rendez-vous
// après.
//
// En bento depuis le 03/10/2026 : chaque thème est un bloc à étiquette, posé
// sur le sol de la page, et les blocs voisins s'alignent sur la même ligne.
import { typesReunion } from '~/composables/usePlanning'

const { slug, section } = useSectionCourante()
const { prochaineReunion, prochainSamedi, planningDeSection, aujourdhui } = usePlanning()
const { role, voitLeCalendrier, voitLeStaff } = useRole()
const { chefsDeSection, adressesDeSection, evenements } = useContenu()

const staff = computed(() => chefsDeSection(slug.value))
const chefDeStaff = computed(() => staff.value.find((c) => c.chefDeStaff) ?? null)
const equipe = computed(() => staff.value.filter((c) => c !== chefDeStaff.value))
// L'adresse de fonction de la section : servie aux familles, jamais aux
// visiteurs.
const adresse = computed(() => adressesDeSection.value[slug.value] ?? null)

// Le prochain samedi : celui de la section pour une famille, celui de l'unité
// (date et horaire seulement) pour un visiteur.
const prochaine = computed(() => prochaineReunion(slug.value))
const samedi = computed(() => prochaine.value ?? prochainSamedi())
const ensuite = computed(() =>
  voitLeCalendrier.value
    ? planningDeSection(slug.value)
        .filter((j) => j.date > (samedi.value?.date ?? aujourdhui.value))
        .slice(0, 4)
    : [],
)

const rendezVous = computed(() =>
  evenements.value.filter(
    (e: any) => e.section === slug.value && (e.dateFin ?? e.date) >= aujourdhui.value,
  ),
)

function horaire(h: string | null | undefined) {
  return h === 'hiver' ? '14:00 – 17:00' : '14:00 – 17:30'
}

const composition = computed(() =>
  section.value?.genre === 'mixte'
    ? 'Mixte'
    : section.value?.genre === 'filles'
      ? 'Filles'
      : section.value?.genre === 'garcons'
        ? 'Garçons'
        : null,
)

function initiale(c: { totem: string | null; prenom: string }) {
  return (c.totem || c.prenom).charAt(0)
}
</script>

<template>
  <div v-if="section" class="bento bento--etire">
    <!-- Le prochain samedi : un ticket, puis la suite en liste -->
    <UiBloc class="bento__5" etiquette="Prochaine réunion" ton="cyan">
      <div v-if="samedi" class="ticket">
        <span class="ticket__date" aria-hidden="true">
          <span class="mono">{{ nomJour(samedi.date).slice(0, 3) }}</span>
          <span class="ticket__jour">{{ samedi.date.slice(8) }}</span>
          <span class="mono">{{ formaterDateCourte(samedi.date).split(' ')[1] }}</span>
        </span>
        <span class="ticket__texte">
          <span class="lecteur-seul">{{ formaterDate(samedi.date, true) }}</span>
          <span class="ticket__quoi">
            {{ voitLeCalendrier && prochaine ? prochaine.libelle : 'Réunion au local' }}
          </span>
          <span class="ticket__horaire mono">{{ horaire(samedi.horaire) }}</span>
          <span v-if="voitLeCalendrier && prochaine?.remarque" class="ticket__note">
            {{ prochaine.remarque }}
          </span>
        </span>
      </div>
      <p v-else class="doux">Plus de réunion prévue cette saison.</p>

      <UiPuits v-if="ensuite.length" as="ol" class="ensuite" aria-label="Les samedis suivants">
        <li
          v-for="j in ensuite"
          :key="j.date"
          class="ensuite__ligne"
          :class="{
            'ensuite__ligne--relache': j.type === 'relache',
            'ensuite__ligne--fort': j.type === 'hike' || j.type === 'grande-sortie',
          }"
        >
          <span class="ensuite__quoi">{{ j.type ? typesReunion[j.type].nom : j.libelle }}</span>
          <span class="ensuite__date mono">{{ formaterDateCourte(j.date) }}</span>
        </li>
      </UiPuits>

      <template #pied>
        <NuxtLink class="lien-fleche" :to="`/sections/${slug}/agenda`">
          {{ voitLeCalendrier ? 'Tout l’agenda' : 'Les dates de réunion' }}
          <UiIcone nom="chevrons-droite" :taille="14" />
        </NuxtLink>
      </template>
    </UiBloc>

    <!-- La section elle-même -->
    <UiBloc class="bento__7" etiquette="La section">
      <div class="prose">
        <p>{{ section.description }}</p>
      </div>
      <ul class="inventaire fiche">
        <li v-if="section.ages">
          <UiTuile libelle="Âges" :sous="section.ages" icone="profil" />
        </li>
        <li v-if="composition">
          <UiTuile libelle="Composition" :sous="composition" icone="groupe" />
        </li>
        <li v-if="voitLeStaff">
          <UiTuile
            libelle="Staff"
            :sous="`${staff.length} animateur${staff.length > 1 ? 's' : ''}`"
            icone="main"
          />
        </li>
        <li>
          <UiTuile libelle="Réunions" sous="le samedi" icone="calendrier" />
        </li>
      </ul>
    </UiBloc>

    <!-- Le staff : une carte vedette pour le chef de staff, des tuiles pour
         les autres. Réservé aux familles. -->
    <UiBloc
      v-if="voitLeStaff"
      class="bento__12"
      :etiquette="`Le staff · ${staff.length} chef${staff.length > 1 ? 's' : ''}`"
    >
      <div class="staff">
        <div v-if="chefDeStaff" class="staff__vedette">
          <span class="staff__role mono">Chef de staff</span>
          <UiIcone :nom="section.icone" :taille="140" class="staff__filigrane" />
          <span class="staff__totem">{{ chefDeStaff.totem ?? chefDeStaff.prenom }}</span>
          <span v-if="chefDeStaff.totem" class="staff__prenom">{{ chefDeStaff.prenom }}</span>
        </div>
        <UiPuits as="ul" class="staff__equipe">
          <li v-for="c in equipe" :key="c.prenom + c.totem" class="staff__carte">
            <span class="staff__pastille" aria-hidden="true">{{ initiale(c) }}</span>
            <span class="staff__noms">
              <span class="staff__nom">{{ c.totem ?? c.prenom }}</span>
              <span v-if="c.totem || c.note" class="staff__detail">
                {{ [c.totem ? c.prenom : null, c.note].filter(Boolean).join(' · ') }}
              </span>
            </span>
          </li>
        </UiPuits>
      </div>

      <div v-if="adresse" class="contact">
        <span>Une question pour le staff ?</span>
        <a class="contact__lien mono" :href="`mailto:${adresse}`">
          <UiIcone nom="mail" :taille="16" />
          {{ adresse }}
        </a>
      </div>

      <p v-if="role === 'chef'" class="note-chantier">
        Les noms de famille, numéros et adresses personnelles des {{ staff.length }} chefs ne sont
        toujours pas dans le site. Le mécanisme d’accès existe désormais, mais il ne vaut pas
        consentement : il faudra le demander aux personnes concernées, une par une.
      </p>
    </UiBloc>

    <!-- Les rendez-vous propres à la section, en paquet -->
    <UiBloc
      v-if="rendezVous.length"
      :class="voitLeCalendrier ? 'bento__12' : 'bento__7'"
      etiquette="Rendez-vous"
      ton="section"
    >
      <UiPaquet
        :dessous="
          rendezVous.slice(1, 4).map((e: any) => ({
            titre: e.titre,
            detail: formaterDateCourte(e.date),
            to: `/events/${e.slug}`,
          }))
        "
      >
        <UiCarteEvent :e="rendezVous[0]" />
      </UiPaquet>
      <template #pied>
        <NuxtLink class="lien-fleche" :to="`/sections/${slug}/rendez-vous`">
          Tous les rendez-vous de la section
          <UiIcone nom="chevrons-droite" :taille="14" />
        </NuxtLink>
      </template>
    </UiBloc>

    <!-- Ce qu'un visiteur n'a pas le droit de voir, dit franchement -->
    <UiBloc
      v-if="!voitLeCalendrier"
      :class="rendezVous.length ? 'bento__5' : 'bento__12'"
      etiquette="Réservé aux familles"
    >
      <div class="reserve">
        <UiIcone nom="cadenas" :taille="20" />
        <div>
          <p class="reserve__titre">Le reste se voit une fois connecté</p>
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
    </UiBloc>
  </div>
</template>

<style lang="scss" scoped>
// Le ticket du prochain samedi : une souche à gauche, le détail à droite.
.ticket {
  display: flex;
  align-items: stretch;
  background: $ardoise;
  border-radius: $r-carte;
  overflow: hidden;

  &__date {
    flex: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    inline-size: 5.5rem;
    padding: $esp-3 $esp-1;
    background: var(--section-teinte, #{$cyan});
    color: $noir;
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  &__jour {
    font-family: $police-titre;
    font-variation-settings: 'wdth' 125;
    font-weight: 800;
    font-size: 3rem;
    line-height: 1;
    letter-spacing: 0;
  }

  &__texte {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.3rem;
    min-inline-size: 0;
    padding: $esp-3 $esp-4;
  }

  &__quoi {
    font-size: 1.1rem;
    font-weight: 600;
  }

  &__horaire {
    font-size: 0.875rem;
    color: rgba($blanc, 0.75);
  }

  &__note {
    font-size: 0.875rem;
    color: rgba($blanc, 0.65);
  }
}

.ensuite {
  &__ligne {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: $esp-2;
    padding: $esp-2 $esp-3;
    background: $ardoise;
    border-radius: $r-tuile;
    font-size: 0.95rem;

    // Une relâche n'est pas un samedi comme les autres : elle est en creux.
    &--relache {
      background: transparent;
      border: 2px dashed rgba($blanc, 0.16);
      color: rgba($blanc, 0.6);
    }

    // Un hike ou une grande sortie sort du rang : c'est ce qu'on retient.
    &--fort {
      background: var(--section-teinte, #{$cyan});
      color: $noir;
      font-weight: 600;

      .ensuite__date {
        color: $noir;
      }
    }
  }

  &__date {
    flex: none;
    font-size: 0.8rem;
    color: rgba($blanc, 0.65);
  }
}

.fiche {
  flex: 1;
  grid-template-columns: repeat(auto-fit, minmax(8.5rem, 1fr));
  grid-auto-rows: minmax(7rem, 1fr);
}

.staff {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: $esp-3;

  @include depuis($bp-poche) {
    grid-template-columns: minmax(0, 13rem) minmax(0, 1fr);
  }

  &__vedette {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: 0.2rem;
    min-block-size: 11rem;
    padding: $esp-4 $esp-3 $esp-3;
    background: var(--section-teinte, #{$cyan});
    color: $noir;
    border-radius: $r-carte;
    overflow: hidden;
  }

  &__role {
    position: absolute;
    inset-block-start: $esp-3;
    inset-inline-start: $esp-3;
    padding: 0.2rem 0.6rem;
    background: $noir;
    color: var(--section-teinte, #{$cyan});
    border-radius: $r-pilule;
    font-size: 0.7rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  // En filigrane dans le coin haut droit, assez haut pour ne jamais passer
  // derrière le totem, en bas.
  &__filigrane {
    position: absolute;
    inset-block-start: -1.25rem;
    inset-inline-end: -1.75rem;
    inline-size: 7rem;
    block-size: 7rem;
    opacity: 0.18;
  }

  &__totem {
    position: relative;
    font-family: $police-titre;
    font-variation-settings: 'wdth' 125;
    font-weight: 800;
    font-size: 1.9rem;
    line-height: 1;
    text-transform: uppercase;
    overflow-wrap: anywhere;
  }

  &__prenom {
    position: relative;
    font-weight: 500;
  }

  &__equipe {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));
    gap: $esp-1;
    align-content: start;
  }

  &__carte {
    display: flex;
    align-items: center;
    gap: $esp-2;
    min-inline-size: 0;
    padding: $esp-2;
    background: $ardoise;
    border-radius: $r-tuile;
  }

  &__pastille {
    flex: none;
    display: grid;
    place-items: center;
    inline-size: 2.25rem;
    block-size: 2.25rem;
    border-radius: 50%;
    background: $ardoise-sourd;
    color: var(--section-teinte, #{$cyan});
    font-weight: 700;
    font-size: 0.875rem;
  }

  &__noms {
    display: flex;
    flex-direction: column;
    min-inline-size: 0;
  }

  &__nom {
    font-size: 0.95rem;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__detail {
    font-size: 0.8rem;
    color: rgba($blanc, 0.65);
  }
}

.contact {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: $esp-2;
  padding: $esp-1 $esp-1 $esp-1 $esp-4;
  background: $ardoise-sourd;
  border-radius: $r-carte;
  font-size: 0.95rem;
  color: rgba($blanc, 0.75);

  &__lien {
    display: inline-flex;
    align-items: center;
    gap: $esp-1;
    padding: $esp-2 $esp-3;
    background: $ardoise;
    border-radius: $r-pilule;
    color: var(--section-teinte, #{$cyan});
    font-size: 0.85rem;
    overflow-wrap: anywhere;

    @include focus-visible;
  }
}

.note-chantier {
  padding: $esp-2 $esp-3;
  background: rgba(#f0a32e, 0.08);
  border: 1px solid rgba(#f0a32e, 0.2);
  border-radius: $r-champ;
  color: rgba(#f0a32e, 0.9);
  line-height: 1.55;
}
</style>
