<script setup lang="ts">
import { bornesSections } from '#shared/orientation'

definePageMeta({ middleware: 'staff' })

const { data, pending, refresh } = await useFetch('/api/staff/comptes')
const souci = ref<string | null>(null)
const enCours = ref<string | null>(null)

const roleAAjouter = ref<Record<string, { role: string; section: string }>>({})

function tampon(id: string) {
  if (!roleAAjouter.value[id]) roleAAjouter.value[id] = { role: 'chef', section: '' }
  return roleAAjouter.value[id]!
}

async function agir(compteId: string, role: string, sectionSlug: string | null, action: 'ajouter' | 'retirer') {
  enCours.value = compteId
  souci.value = null
  try {
    await $fetch('/api/staff/comptes/role', {
      method: 'POST',
      body: { compteId, role, sectionSlug: sectionSlug || undefined, action },
    })
    await refresh()
  } catch (e: any) {
    souci.value = e?.data?.statusMessage ?? 'Impossible de modifier ce rôle.'
  } finally {
    enCours.value = null
  }
}

const roles = [
  { valeur: 'chef', libelle: 'Chef de section' },
  { valeur: 'cu', libelle: 'Staff d’unité (CU)' },
  { valeur: 'tresorier', libelle: 'Trésorier' },
  { valeur: 'parent', libelle: 'Parent' },
  { valeur: 'anime', libelle: 'Animé' },
]

const optionsSections = bornesSections.map((s) => ({ valeur: s.slug, libelle: s.nom }))

useHead({ title: 'Comptes et rôles — 16e Fleurus' })
</script>

<template>
  <AppPage
    titre="Comptes et rôles"
    surtitre="Staff d’unité"
    chapo="Qui a accès à quoi. Retirer un rôle déconnecte la personne immédiatement."
    :retour="{ to: '/gestion', texte: 'Back office' }"
  >
    <template #entete>
      <GestionBarre />
    </template>

    <div class="pile">
      <div class="alerte alerte--info">
        <UiIcone nom="info" :taille="18" />
        <span>
          Un chef ne voit que sa section : c’est son rôle qui le décide, pas sa bonne volonté.
          Donner « Staff d’unité » à quelqu’un lui ouvre toutes les fiches santé de l’unité —
          à réserver aux personnes qui en ont réellement besoin.
        </span>
      </div>

      <p v-if="souci" class="alerte alerte--erreur" role="alert">
        <UiIcone nom="alerte" :taille="18" /><span>{{ souci }}</span>
      </p>
      <p v-if="pending" class="alerte alerte--info">Chargement…</p>

      <article v-for="c in data?.comptes ?? []" :key="c.id" class="compte">
        <header class="compte__entete">
          <div>
            <h2 class="compte__nom">{{ c.prenom }} {{ c.nom }}</h2>
            <p class="compte__mail mono">{{ c.email }}</p>
          </div>
          <p class="compte__etat">
            <span v-if="!c.emailVerifieLe" class="compte__alerte">adresse non confirmée</span>
            <span v-if="c.desactiveLe" class="compte__alerte">désactivé</span>
            <span class="doux">
              {{ c.derniereConnexionLe
                ? `vu le ${new Date(c.derniereConnexionLe).toLocaleDateString('fr-BE')}`
                : 'jamais connecté' }}
            </span>
          </p>
        </header>

        <ul class="roles">
          <li v-for="(r, i) in c.roles" :key="i">
            <span class="etiquette" :data-section="r.sectionSlug ?? undefined">
              {{ r.role }}<template v-if="r.sectionSlug"> · {{ r.sectionSlug }}</template>
            </span>
            <button
              class="roles__retirer"
              type="button"
              :disabled="enCours === c.id"
              :aria-label="`Retirer le rôle ${r.role}`"
              @click="agir(c.id, r.role, r.sectionSlug, 'retirer')"
            >
              <UiIcone nom="croix" :taille="12" />
            </button>
          </li>
          <li v-if="!c.roles.length" class="doux">aucun rôle</li>
        </ul>

        <div class="ajout">
          <UiChoix
            v-model="tampon(c.id).role"
            etiquette="Rôle à donner"
            :nom="`role-${c.id}`"
            :options="roles"
          />
          <UiChoix
            v-if="tampon(c.id).role === 'chef'"
            v-model="tampon(c.id).section"
            etiquette="Section"
            :nom="`section-${c.id}`"
            :options="optionsSections"
            vide="Choisir…"
          />
          <button
            class="bouton bouton--fantome"
            type="button"
            :disabled="enCours === c.id"
            @click="agir(c.id, tampon(c.id).role, tampon(c.id).section, 'ajouter')"
          >
            <UiIcone nom="plus" :taille="15" /> Donner ce rôle
          </button>
        </div>
      </article>
    </div>
  </AppPage>
</template>

<style lang="scss" scoped>
.compte {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem 1.15rem;
  background: rgba($blanc, 0.025);
  border: 1px solid rgba($blanc, 0.07);
  border-radius: $r-carte;

  &__entete {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }

  &__nom {
    font-size: 1rem;
    font-weight: 600;
  }

  &__mail {
    font-size: 0.75rem;
    color: rgba($blanc, 0.55);
  }

  &__etat {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.15rem;
    font-size: 0.75rem;
  }

  &__alerte {
    color: #f0a32e;
  }
}

.roles {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }

  // 32 px de cible au lieu de 19 : c'est un bouton qui retire un rôle, on
  // doit pouvoir le viser au doigt sans toucher le voisin.
  &__retirer {
    display: grid;
    place-items: center;
    inline-size: 2rem;
    block-size: 2rem;
    margin-block: -0.4rem;
    margin-inline-end: -0.4rem;
    border-radius: 50%;
    color: rgba($blanc, 0.62);
    @include focus-visible;
    &:hover {
      background: rgba($rouge, 0.18);
      color: $rouge-texte;
    }
  }
}

.ajout {
  display: flex;
  align-items: flex-end;
  gap: 0.6rem;
  flex-wrap: wrap;

  .champ {
    min-inline-size: 11rem;
  }
}

.doux {
  color: rgba($blanc, 0.62);
  font-size: 1rem;
}
</style>
