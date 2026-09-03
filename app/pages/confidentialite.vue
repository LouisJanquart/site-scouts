<script setup lang="ts">
import { consentementsCatalogue } from '#shared/consentements'

// La politique de confidentialité.
//
// Écrite pour être lue, pas pour être opposable : phrases courtes, pas de
// jargon, et à chaque fois qu'on demande quelque chose, on dit pourquoi. Un
// texte que personne ne lit ne vaut aucun consentement.

useHead({
  title: 'Politique de confidentialité — 16e Fleurus',
  meta: [{ name: 'robots', content: 'noindex' }],
})

const maj = '3 septembre 2026'
</script>

<template>
  <AppPage
    titre="Politique de confidentialité"
    surtitre="Vos données"
    chapo="Ce que nous conservons, pourquoi, pendant combien de temps, et comment reprendre la main."
  >
    <div class="texte">
      <p class="maj mono">Dernière mise à jour : {{ maj }}</p>

      <h2>Qui traite vos données</h2>
      <p>
        L’unité scoute et guide 16<sup>e</sup> Fleurus, Notre-Dame des Champs. Le responsable du
        traitement est le staff d’unité. Pour toute question ou demande, écrivez à l’adresse de
        contact du staff d’unité, ou passez par la rubrique
        <NuxtLink to="/mon-espace/mes-donnees">Mes données</NuxtLink> de votre espace.
      </p>

      <h2>Ce que nous conservons, et pourquoi</h2>
      <p>
        Nous ne demandons rien « au cas où ». Chaque information a une raison d’être, et si cette
        raison disparaît, l’information disparaît avec.
      </p>

      <table class="table">
        <thead>
          <tr><th>Information</th><th>Pourquoi</th><th>Sur quelle base</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>Nom, prénom, date de naissance, adresse de l’enfant</td>
            <td>L’inscrire, l’affilier à la fédération, l’assurer</td>
            <td>Exécution de l’inscription</td>
          </tr>
          <tr>
            <td>Coordonnées des responsables</td>
            <td>Vous joindre, vous prévenir, vous appeler s’il arrive quelque chose</td>
            <td>Exécution de l’inscription et intérêt vital</td>
          </tr>
          <tr>
            <td>Fiche santé (allergies, traitements, antécédents)</td>
            <td>Protéger l’enfant en réunion et en camp</td>
            <td>Votre consentement explicite, et l’intérêt vital</td>
          </tr>
          <tr>
            <td>Autorisations parentales</td>
            <td>Savoir ce que nous avons le droit de faire</td>
            <td>Votre consentement</td>
          </tr>
          <tr>
            <td>Droit à l’image</td>
            <td>Publier — ou ne pas publier — des photos</td>
            <td>Votre consentement, retirable à tout moment</td>
          </tr>
          <tr>
            <td>Paiements de cotisation</td>
            <td>Tenir la comptabilité de l’unité</td>
            <td>Obligation légale (comptabilité)</td>
          </tr>
          <tr>
            <td>Journal des consultations</td>
            <td>Pouvoir vous dire qui a ouvert le dossier de votre enfant</td>
            <td>Obligation de sécurité</td>
          </tr>
        </tbody>
      </table>

      <h2>Ce que nous ne demandons pas</h2>
      <p>
        Pas de numéro de registre national. Pas de données bancaires : le paiement en ligne passe
        par un prestataire agréé (Mollie), et aucun numéro de carte ne touche notre serveur. Pas
        de suivi publicitaire, pas de mouchard, pas de statistiques revendues. Le site ne dépose
        qu’un seul cookie, celui qui vous garde connecté.
      </p>

      <h2>Qui peut voir quoi</h2>
      <ul>
        <li><strong>Un visiteur</strong> : rien. Les pages publiques ne contiennent aucune donnée personnelle.</li>
        <li><strong>Un animé</strong> : son propre dossier, et le détail de sa section. Pas sa fiche santé.</li>
        <li><strong>Un parent</strong> : le dossier de ses enfants, leur fiche santé, et le calendrier de toute l’unité.</li>
        <li>
          <strong>Un chef</strong> : les animés de sa section, fiches santé comprises, et le fait
          qu’une cotisation soit réglée ou non — pas son montant. Rien des autres sections.
        </li>
        <li><strong>Le staff d’unité</strong> : l’ensemble, parce qu’il en répond.</li>
        <li><strong>Le trésorier</strong> : les cotisations, montants compris, pas les fiches santé.</li>
      </ul>
      <p>
        Ces règles ne sont pas de simples réglages d’affichage : elles sont appliquées par le
        serveur, à chaque demande. Modifier une adresse dans son navigateur ne donne accès à rien.
      </p>

      <h2>Comment les fiches santé sont protégées</h2>
      <p>
        Elles sont chiffrées avant d’être écrites dans la base de données, avec une clé qui ne s’y
        trouve pas. Une copie volée de la base ne contient donc rien de lisible sur la santé de
        votre enfant. Chaque ouverture d’une fiche est enregistrée, et vous pouvez consulter cette
        liste depuis votre espace.
      </p>

      <h2>Combien de temps</h2>
      <ul>
        <li><strong>Fiche santé</strong> : un an après la fin de la saison concernée, puis effacée.</li>
        <li><strong>Journal des consultations</strong> : trois ans.</li>
        <li><strong>Dossier d’inscription et autorisations</strong> : conservés tant que l’enfant est dans l’unité, puis cinq ans — c’est le délai pendant lequel une question d’assurance peut encore se poser.</li>
        <li><strong>Écritures de paiement</strong> : sept ans, comme l’exige la loi comptable belge.</li>
        <li><strong>Personnes sans lien avec l’unité</strong> : anonymisées après trois ans.</li>
        <li><strong>Sessions de connexion</strong> : trente jours sans activité.</li>
      </ul>
      <p>Ces effacements sont automatiques : ils ne dépendent pas de la bonne mémoire de quelqu’un.</p>

      <h2>À qui nous transmettons</h2>
      <ul>
        <li>
          <strong>La fédération scoute</strong> à laquelle l’unité est affiliée : nom, prénom,
          date de naissance et adresse, pour l’affiliation et l’assurance. C’est une condition de
          l’inscription.
        </li>
        <li>
          <strong>Mollie</strong>, prestataire de paiement agréé, si vous payez en ligne : le
          montant et une référence, rien d’autre.
        </li>
        <li>
          <strong>Un service de secours ou un médecin</strong>, s’il arrive quelque chose : c’est
          précisément à cela que sert la fiche santé.
        </li>
      </ul>
      <p>Nous ne vendons rien, nous ne partageons rien d’autre, avec personne.</p>

      <h2>Les autorisations que nous demandons</h2>
      <p>
        Une case par usage, jamais une seule case pour tout. Voici la liste complète, telle
        qu’elle apparaît dans le formulaire :
      </p>
      <ul class="consentements">
        <li v-for="c in consentementsCatalogue" :key="c.cle">
          <strong>{{ c.titre }}</strong>
          <span v-if="c.obligatoire" class="oblig">indispensable</span>
          <span class="bloc">{{ c.texte }}</span>
        </li>
      </ul>

      <h2>Vos droits</h2>
      <p>
        Vous pouvez à tout moment savoir ce que nous conservons, le corriger, le récupérer dans un
        fichier, en demander l’effacement, ou retirer une autorisation. Tout se fait depuis la
        rubrique <NuxtLink to="/mon-espace/mes-donnees">Mes données</NuxtLink>. Retirer une
        autorisation de photo prend effet immédiatement.
      </p>
      <p>
        Le staff d’unité a un mois pour répondre à une demande. Si la réponse ne vous satisfait
        pas, vous pouvez saisir l’Autorité de protection des données (Rue de la Presse 35, 1000
        Bruxelles — autoriteprotectiondonnees.be).
      </p>
      <p class="avertissement">
        Une réserve honnête : demander l’effacement complet des données d’un enfant encore inscrit
        revient à demander sa désinscription. Sans fiche santé ni autorisation parentale, nous
        n’avons pas le droit de l’emmener en camp. Nous en parlerons avec vous avant d’agir.
      </p>

      <h2>Si quelque chose tourne mal</h2>
      <p>
        En cas de fuite de données présentant un risque pour les personnes concernées, l’unité
        préviendra l’Autorité de protection des données dans les 72 heures, et vous préviendra
        directement si le risque est élevé. Nous vous dirons ce qui s’est passé, ce qui est
        concerné, et ce que nous faisons.
      </p>
    </div>
  </AppPage>
</template>

<style lang="scss" scoped>
.texte {
  max-inline-size: 46rem;
  font-size: 0.92rem;
  line-height: 1.75;
  color: rgba($blanc, 0.8);

  h2 {
    margin-block: 2rem 0.6rem;
    font-family: $police-titre;
    font-weight: 700;
    font-size: 1.05rem;
    text-transform: uppercase;
    letter-spacing: -0.005em;
    color: $blanc;
  }

  p {
    margin-block-end: 0.85rem;
  }

  ul {
    margin: 0 0 1rem;
    padding-inline-start: 1.15rem;

    li {
      margin-block-end: 0.35rem;
    }
  }

  a {
    color: $cyan;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  strong {
    color: $blanc;
  }
}

.maj {
  font-size: 0.74rem;
  color: rgba($blanc, 0.5);
}

.table {
  inline-size: 100%;
  border-collapse: collapse;
  margin-block-end: 1rem;
  font-size: 0.83rem;

  th,
  td {
    text-align: start;
    vertical-align: top;
    padding: 0.5rem 0.7rem;
    border-block-end: 1px solid rgba($blanc, 0.08);
  }

  thead th {
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: $cyan;
  }
}

.consentements {
  list-style: none;
  padding: 0;

  li {
    padding: 0.6rem 0.8rem;
    margin-block-end: 0.35rem;
    background: rgba($blanc, 0.03);
    border-radius: $r-champ;
    font-size: 0.85rem;
  }
}

.oblig {
  margin-inline-start: 0.5rem;
  padding: 0.05rem 0.45rem;
  border-radius: $r-pilule;
  background: rgba($rouge, 0.16);
  color: $rouge-texte;
  font-size: 0.66rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.bloc {
  display: block;
  margin-block-start: 0.2rem;
  color: rgba($blanc, 0.65);
  font-size: 0.82rem;
}

.avertissement {
  padding: 0.85rem 1rem;
  background: rgba($cyan, 0.06);
  border-inline-start: 2px solid rgba($cyan, 0.4);
  border-radius: $r-champ;
  font-size: 0.87rem;
}
</style>
