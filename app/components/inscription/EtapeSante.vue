<script setup lang="ts">
defineProps<{ champs: Record<string, string> }>()
const { dossier } = useDossier()
const sante = computed(() => dossier.value.sante)

// Les listes (allergies, régimes) se saisissent ligne par ligne. On garde
// toujours une ligne vide au bout, pour ne pas obliger à cliquer « ajouter ».
function nettoyerListe(liste: string[]) {
  const propres = liste.filter((v) => v.trim())
  return [...propres, '']
}

const allergies = computed({
  get: () => (sante.value.allergies.length ? sante.value.allergies : ['']),
  set: (v) => (sante.value.allergies = v),
})
const regimes = computed({
  get: () => (sante.value.regimesAlimentaires.length ? sante.value.regimesAlimentaires : ['']),
  set: (v) => (sante.value.regimesAlimentaires = v),
})

function ajouterTraitement() {
  sante.value.traitements.push({ libelle: '', posologie: '', autonome: false })
}
</script>

<template>
  <div class="pile">
    <div class="alerte alerte--info">
      <UiIcone nom="cadenas" :taille="18" />
      <span>
        Cette fiche est chiffrée dès qu’elle est enregistrée. Seuls les chefs de la section de
        votre enfant et le staff d’unité peuvent l’ouvrir, et chaque consultation est
        enregistrée : vous pouvez demander à tout moment qui l’a lue.
        <strong>Elle n’est pas conservée dans le brouillon</strong> — si vous quittez la page, ce
        bloc sera à ressaisir.
      </span>
    </div>

    <section class="groupe">
      <h2 class="groupe__titre">Médecin et mutuelle</h2>
      <div class="grille-champs">
        <UiChamp v-model="sante.medecinNom as string" etiquette="Médecin traitant" nom="sante.medecinNom" />
        <UiChamp v-model="sante.medecinTelephone as string" etiquette="Téléphone du médecin" nom="sante.medecinTelephone" type="tel" />
        <UiChamp v-model="sante.mutuelle as string" etiquette="Mutuelle" nom="sante.mutuelle" />
        <UiChamp
          v-model="sante.numeroAffiliationMutuelle as string"
          etiquette="Numéro d’affiliation"
          nom="sante.numeroAffiliationMutuelle"
          aide="Facultatif. Utile en cas d’hospitalisation pendant un camp."
        />
      </div>
    </section>

    <section class="groupe">
      <h2 class="groupe__titre">Points d’attention</h2>
      <p class="groupe__chapo">
        Tout ce qui doit être su avant un camp : ce qui peut mettre votre enfant en danger, ce
        qu’il ne peut pas manger, ce qu’il doit prendre. En cas de doute, écrivez-le.
      </p>

      <div class="pile">
        <p class="etiquette-liste">Allergies et intolérances</p>
        <div v-for="(_, i) in allergies" :key="`a${i}`" class="ligne">
          <UiChamp
            v-model="allergies[i]!"
            etiquette="Allergie"
            :nom="`sante.allergies.${i}`"
            placeholder="Arachides, piqûres de guêpe, pollen…"
            @update:model-value="sante.allergies = nettoyerListe(allergies)"
          />
        </div>
      </div>

      <div class="pile">
        <p class="etiquette-liste">Régime alimentaire</p>
        <div v-for="(_, i) in regimes" :key="`r${i}`" class="ligne">
          <UiChamp
            v-model="regimes[i]!"
            etiquette="Régime"
            :nom="`sante.regimes.${i}`"
            placeholder="Sans porc, végétarien, sans gluten…"
            @update:model-value="sante.regimesAlimentaires = nettoyerListe(regimes)"
          />
        </div>
      </div>

      <div class="pile">
        <p class="etiquette-liste">Traitements en cours</p>
        <article v-for="(t, i) in sante.traitements" :key="`t${i}`" class="traitement">
          <div class="grille-champs">
            <UiChamp v-model="t.libelle" etiquette="Médicament" :nom="`sante.traitements.${i}.libelle`" obligatoire />
            <UiChamp v-model="t.posologie as string" etiquette="Posologie" :nom="`sante.traitements.${i}.posologie`" placeholder="1 comprimé le matin" />
          </div>
          <UiCase
            v-model="t.autonome"
            titre="L’enfant le prend seul"
            texte="Sinon, un chef s’en charge et le note dans le carnet de camp."
          />
          <button type="button" class="retirer" @click="sante.traitements.splice(i, 1)">
            <UiIcone nom="croix" :taille="13" /> Retirer ce traitement
          </button>
        </article>
        <div>
          <button type="button" class="bouton bouton--fantome" @click="ajouterTraitement">
            <UiIcone nom="plus" :taille="15" /> Ajouter un traitement
          </button>
        </div>
      </div>

      <UiChamp
        v-model="sante.antecedents as string"
        etiquette="Antécédents médicaux"
        nom="sante.antecedents"
        zone
        :max="2000"
        aide="Asthme, épilepsie, opération récente, port de lunettes ou d’un appareil…"
      />
      <UiChamp
        v-model="sante.remarques as string"
        etiquette="Autre chose à savoir"
        nom="sante.remarques"
        zone
        :max="2000"
        aide="Sommeil, angoisses, alimentation, ce qui l’aide quand ça ne va pas."
      />
    </section>

    <section class="groupe">
      <h2 class="groupe__titre">Deux questions pratiques</h2>
      <div class="pile">
        <UiCase
          v-model="(sante.tetanosAJour as boolean)"
          titre="La vaccination contre le tétanos est à jour"
          texte="Le rappel se fait tous les dix ans. C’est le vaccin qui compte le plus pour un camp."
        />
        <UiChamp
          v-if="sante.tetanosAJour"
          v-model="sante.tetanosDate as string"
          etiquette="Date du dernier rappel"
          nom="sante.tetanosDate"
          type="date"
        />
        <UiCase
          v-model="(sante.saitNager as boolean)"
          titre="Sait nager"
          texte="Détermine ce qui est permis à la piscine et au bord de l’eau."
        />
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.etiquette-liste {
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: $cyan;
}

.traitement {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  padding: 0.9rem;
  border: 1px solid rgba($blanc, 0.08);
  border-radius: $r-champ;
}

.retirer {
  align-self: flex-start;
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
</style>
