<script setup lang="ts">
defineProps<{ champs: Record<string, string> }>()
const { dossier } = useDossier()

const liens = [
  { valeur: 'mere', libelle: 'Mère' },
  { valeur: 'pere', libelle: 'Père' },
  { valeur: 'parent', libelle: 'Parent' },
  { valeur: 'tuteur', libelle: 'Tuteur ou tutrice' },
  { valeur: 'autre', libelle: 'Autre' },
]

function ajouterResponsable() {
  if (dossier.value.responsables.length >= 4) return
  dossier.value.responsables.push({
    lien: 'parent', prenom: '', nom: '', email: '', telephone: '',
    autoriteParentale: true, destinataireFacture: false, memeAdresseQueLEnfant: true,
  })
}

function retirerResponsable(i: number) {
  if (dossier.value.responsables.length <= 1) return
  dossier.value.responsables.splice(i, 1)
  // Il faut toujours quelqu'un pour recevoir l'appel de cotisation.
  if (!dossier.value.responsables.some((r) => r.destinataireFacture)) {
    dossier.value.responsables[0]!.destinataireFacture = true
  }
}

// Un seul destinataire de facture : cocher l'un décoche les autres.
function choisirDestinataire(i: number) {
  dossier.value.responsables.forEach((r, j) => (r.destinataireFacture = i === j))
}

function ajouterContact() {
  if (dossier.value.contactsUrgence.length >= 3) return
  dossier.value.contactsUrgence.push({ nom: '', lien: '', telephone: '' })
}
</script>

<template>
  <div class="pile">
    <section class="groupe">
      <h2 class="groupe__titre">Les responsables</h2>
      <p class="groupe__chapo">
        Le premier responsable est celui qui ouvre l’espace famille : c’est son adresse qui sert
        d’identifiant. Les autres reçoivent les mêmes informations, et pourront demander un accès
        s’ils le souhaitent.
      </p>

      <article v-for="(r, i) in dossier.responsables" :key="i" class="responsable">
        <header class="responsable__entete">
          <h3 class="responsable__titre">
            {{ i === 0 ? 'Responsable principal' : `Responsable ${i + 1}` }}
          </h3>
          <button
            v-if="i > 0"
            type="button"
            class="responsable__retirer"
            @click="retirerResponsable(i)"
          >
            <UiIcone nom="croix" :taille="13" />
            Retirer
          </button>
        </header>

        <div class="grille-champs">
          <UiChoix
            v-model="r.lien"
            etiquette="Lien avec l’enfant"
            :nom="`responsables.${i}.lien`"
            :options="liens"
            obligatoire
          />
          <UiChamp
            v-model="r.prenom"
            etiquette="Prénom"
            :nom="`responsables.${i}.prenom`"
            obligatoire
            :erreur="champs[`responsables.${i}.prenom`]"
          />
          <UiChamp
            v-model="r.nom"
            etiquette="Nom"
            :nom="`responsables.${i}.nom`"
            obligatoire
            :erreur="champs[`responsables.${i}.nom`]"
          />
          <UiChamp
            v-model="r.email"
            etiquette="Adresse e-mail"
            :nom="`responsables.${i}.email`"
            type="email"
            :autocomplete="i === 0 ? 'username' : 'off'"
            obligatoire
            :erreur="champs[`responsables.${i}.email`]"
          />
          <UiChamp
            v-model="r.telephone"
            etiquette="Téléphone"
            :nom="`responsables.${i}.telephone`"
            type="tel"
            inputmode="tel"
            obligatoire
            aide="Le numéro sur lequel on vous joint un dimanche après-midi."
            :erreur="champs[`responsables.${i}.telephone`]"
          />
        </div>

        <div class="pile">
          <UiCase
            v-model="r.autoriteParentale"
            titre="A l’autorité parentale"
            texte="Peut signer les autorisations et prendre les décisions concernant l’enfant."
          />
          <label class="case">
            <input
              type="radio"
              name="destinataire"
              :checked="r.destinataireFacture"
              @change="choisirDestinataire(i)"
            />
            <span>
              <span class="case__titre">Reçoit l’appel de cotisation</span>
              <span class="case__texte">Une seule personne par famille.</span>
            </span>
          </label>
          <UiCase
            v-model="r.memeAdresseQueLEnfant"
            titre="Habite à la même adresse que l’enfant"
            consequence="Indiquez l’adresse de ce responsable ci-dessous."
          />
        </div>

        <div v-if="!r.memeAdresseQueLEnfant" class="grille-champs">
          <UiChamp
            v-model="(r.adresse ??= { rue: '', numero: '', codePostal: '', localite: '', pays: 'BE' }).rue"
            etiquette="Rue"
            :nom="`responsables.${i}.adresse.rue`"
            class="plein"
            obligatoire
          />
          <UiChamp v-model="r.adresse!.numero" etiquette="Numéro" :nom="`responsables.${i}.adresse.numero`" obligatoire />
          <UiChamp v-model="r.adresse!.codePostal" etiquette="Code postal" :nom="`responsables.${i}.adresse.codePostal`" inputmode="numeric" obligatoire />
          <UiChamp v-model="r.adresse!.localite" etiquette="Localité" :nom="`responsables.${i}.adresse.localite`" obligatoire />
        </div>
      </article>

      <p v-if="champs.responsables" class="champ__erreur">
        <UiIcone nom="alerte" :taille="14" /><span>{{ champs.responsables }}</span>
      </p>

      <div>
        <button
          v-if="dossier.responsables.length < 4"
          type="button"
          class="bouton bouton--fantome"
          @click="ajouterResponsable"
        >
          <UiIcone nom="plus" :taille="15" />
          Ajouter un responsable
        </button>
      </div>
    </section>

    <section class="groupe">
      <h2 class="groupe__titre">En cas d’urgence</h2>
      <p class="groupe__chapo">
        D’autres personnes à appeler si aucun responsable n’est joignable : un grand-parent, un
        voisin. Facultatif, mais très utile en camp.
      </p>

      <article v-for="(c, i) in dossier.contactsUrgence" :key="i" class="grille-champs">
        <UiChamp v-model="c.nom" etiquette="Nom et prénom" :nom="`contactsUrgence.${i}.nom`" obligatoire />
        <UiChamp v-model="c.lien as string" etiquette="Lien" :nom="`contactsUrgence.${i}.lien`" placeholder="Grand-mère, voisin…" />
        <UiChamp v-model="c.telephone" etiquette="Téléphone" :nom="`contactsUrgence.${i}.telephone`" type="tel" obligatoire />
      </article>

      <div>
        <button
          v-if="dossier.contactsUrgence.length < 3"
          type="button"
          class="bouton bouton--fantome"
          @click="ajouterContact"
        >
          <UiIcone nom="plus" :taille="15" />
          Ajouter un contact
        </button>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.responsable {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding-block-start: 1rem;
  border-block-start: 1px solid rgba($blanc, 0.08);

  &:first-of-type {
    border-block-start: 0;
    padding-block-start: 0;
  }

  &__entete {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  &__titre {
    font-size: 1rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: $cyan;
  }

  &__retirer {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.75rem;
    color: rgba($blanc, 0.6);
    @include focus-visible;
    &:hover {
      color: $rouge-texte;
    }
  }
}
</style>
