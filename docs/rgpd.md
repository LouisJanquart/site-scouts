# Le RGPD sur ce site

Ce document n'est pas la politique de confidentialité — celle-là est écrite pour
les familles et se lit sur `/confidentialite`. Celui-ci est écrit pour le staff
d'unité et pour la personne qui reprendra le code : il dit **où** chaque règle
est appliquée, et **pourquoi** elle l'est comme ça.

Un site d'unité scoute conserve des données de santé d'enfants mineurs. C'est
la catégorie la plus protégée du règlement (article 9). Ce n'est pas une raison
de renoncer au site : c'est une raison de le faire proprement.

---

## 1. Le registre de traitement

Le RGPD demande de tenir un registre. En voici le contenu ; il suffit de le
recopier et de le dater pour qu'il fasse office de registre officiel.

**Responsable du traitement** : Unité scoute et guide 16e Fleurus, Notre-Dame
des Champs. Représentée par le staff d'unité.

**Sous-traitants** :

| Qui | Pour quoi | Où sont les données |
| --- | --- | --- |
| L'hébergeur du site et de la base | Faire tourner le site | À choisir — exiger l'Union européenne |
| Mollie B.V. | Encaisser les cotisations | Pays-Bas |
| Le fournisseur SMTP | Envoyer les courriels | À choisir — exiger l'Union européenne |

Il faut un contrat de sous-traitance (article 28) avec chacun. Les trois en
proposent un type ; il suffit de l'accepter et d'en garder une copie.

**Traitements** :

| Traitement | Personnes | Données | Base légale | Conservation |
| --- | --- | --- | --- | --- |
| Inscription | Animés, responsables | Identité, adresse, contacts | Exécution du contrat d'inscription | Durée d'affiliation + 5 ans |
| Fiche santé | Animés | Allergies, traitements, antécédents, vaccination | Consentement explicite (art. 9 §2 a) + intérêt vital (art. 9 §2 c) | 1 an après la fin de la saison |
| Autorisations parentales | Animés | Réponses oui/non horodatées | Consentement | Durée d'affiliation + 5 ans |
| Droit à l'image | Animés | Réponses oui/non par usage | Consentement, retirable | Durée d'affiliation + 5 ans |
| Cotisations | Responsables | Montants, moyens, dates | Obligation légale (comptabilité) | 7 ans |
| Comptes et sessions | Tous | Adresse, empreinte du mot de passe | Exécution du contrat | 30 jours d'inactivité pour les sessions |
| Journal des accès | Staff | Qui a ouvert quoi, quand | Obligation de sécurité (art. 32) | 3 ans |

---

## 2. Où chaque règle vit dans le code

| Règle | Fichier |
| --- | --- |
| Qui a le droit de voir quoi | `server/utils/droits.ts` |
| Chiffrement des fiches santé | `server/utils/chiffrement.ts` |
| Journal des accès | `server/utils/journal.ts` |
| Durées de conservation, purge automatique | `server/tasks/menage.ts` |
| Catalogue des consentements et leur texte | `shared/consentements.ts` |
| Export, journal et demandes côté famille | `server/api/mon-espace/` |
| Tableau de bord RGPD du CU | `server/api/staff/rgpd/` |

Les règles d'accès sont **testées** : `tests/droits.test.ts`. Ce fichier vérifie
qu'un parent ne peut pas ouvrir le dossier d'un autre enfant et qu'un chef ne
peut pas sortir de sa section, même en trafiquant l'adresse. Si vous touchez à
`droits.ts`, faites tourner `npm test` avant de déployer.

---

## 3. Les décisions prises, et pourquoi

### Les fiches santé sont chiffrées

AES-256-GCM, clé dans l'environnement du serveur (`NUXT_CLE_SANTE`), jamais dans
la base. Une sauvegarde de base qui fuiterait — le scénario le plus banal — ne
contiendrait rien de lisible sur la santé des enfants.

Contrepartie assumée : on ne peut pas faire de recherche SQL dans une fiche, et
**perdre la clé, c'est perdre les fiches**. Elle doit être sauvegardée ailleurs
que sur le serveur.

Deux drapeaux restent en clair, parce que les chefs en ont besoin d'un coup
d'œil sur le terrain : « cette fiche contient un point d'attention » et « sait
nager ». Ni l'un ni l'autre ne dit quoi que ce soit de précis.

### Un animé ne lit pas sa propre fiche santé

Un animé de douze ans n'a pas à découvrir un antécédent médical sur un écran. La
fiche se consulte auprès des parents ou des chefs. Appliqué dans
`exigerAccesFicheSante()`.

### Un chef de section ne voit pas les cotisations

Savoir qui a payé et qui n'a pas payé range les familles. Ce n'est pas le
travail d'un chef de section. Réservé au CU et au trésorier.

### Une case par usage pour le droit à l'image

Quatre cases distinctes : interne, site, réseaux sociaux, presse. Un
consentement groupé n'est pas un consentement libre — et dans les faits,
beaucoup de parents acceptent l'interne et refusent les réseaux. Il faut que ce
soit possible.

### Le texte signé est copié en base

Chaque consentement enregistre le libellé exact et le numéro de version du
catalogue. Si le texte change l'an prochain, ce qui a été signé cette année
reste lisible tel qu'il a été signé. C'est la seule façon de prouver un
consentement.

### Retirer un consentement n'efface rien

On ferme la ligne (`revoque_le`) et on en écrit une nouvelle. L'historique est
la preuve, la dernière ligne fait foi.

### Le journal d'accès n'est pas décoratif

Sans lui, on ne peut pas répondre à « qui a ouvert la fiche de mon fils ? ».
C'est une question qu'un parent a le droit de poser. Le journal est visible par
la famille dans son espace, pas seulement par le CU.

### Ce qu'on ne demande pas

Pas de numéro de registre national. Pas de données bancaires. Pas de mouchard,
pas de statistiques tierces. Un seul cookie, celui de la session.

---

## 4. Ce qui reste à faire, côté humain

Le code ne peut pas tout. Ces points-là demandent une décision de l'unité :

1. **Signer les contrats de sous-traitance** avec l'hébergeur, Mollie et le
   fournisseur SMTP. Sans eux, le traitement est irrégulier.
2. **Nommer une personne de contact** pour les demandes RGPD, et publier son
   adresse dans la politique de confidentialité. Une unité de cette taille n'a
   pas besoin d'un DPO formel, mais elle a besoin de quelqu'un qui répond.
3. **Sauvegarder la clé de chiffrement** ailleurs que sur le serveur, dans deux
   endroits différents.
4. **Décider de la conduite à tenir en cas de fuite** : qui prévient l'Autorité
   de protection des données dans les 72 heures, et qui écrit aux familles.
5. **Relire la politique de confidentialité** avec quelqu'un de l'unité : elle
   engage l'unité, pas le développeur.
6. **Vérifier ce que la fédération exige** exactement comme données transmises :
   la politique annonce nom, prénom, date de naissance et adresse. Si elle en
   demande plus, il faut le dire.
