# Site de la 16e Fleurus

Plateforme web de l'unité scoute et guide 16e Fleurus — Notre-Dame des Champs.

> **Ce dépôt est un chantier.** Rien n'a été relu par le staff d'unité. Le
> déploiement porte un `X-Robots-Tag: noindex` et un `robots.txt` qui interdit
> tout référencement, volontairement.

## Démarrer

```bash
npm install
cp .env.exemple .env       # puis remplir : base, clé de chiffrement, SMTP
npm run base:appliquer     # crée les tables
npm run base:semer         # crée la saison et le premier compte CU
npm run dev                # http://localhost:3000
npm run build              # serveur Node dans .output/
npm test                   # les règles d'accès, sur une vraie base
```

Il faut un PostgreSQL. En développement, n'importe lequel fait l'affaire ;
`docs/exploitation.md` explique comment en obtenir un en production.

> npm 12 bloque par défaut les scripts d'installation. Si `esbuild` manque
> après un `npm install`, lancer `npm install-scripts approve esbuild` puis
> `npm install-scripts approve @parcel/watcher`. Les versions antérieures de
> npm, dont celle de Netlify, les exécutent d'office.

Nuxt 4, Vue 3, Sass. Pas de framework CSS, pas de bibliothèque de composants.

## Ce que le site fait aujourd'hui

**La partie publique** — fabriquée une fois pour toutes au déploiement, servie
en fichiers, ne touche jamais la base :

- Un tableau de bord en page d'accueil : prochaine réunion, météo réelle de
  Fleurus, événements et actualités.
- Une page par section (six sections animées, la Route, le staff d'unité).
- Le planning annuel complet, filtrable par section.
- Huit flux iCalendar auxquels on peut s'abonner depuis n'importe quel agenda.
- Une recherche locale sur tout le contenu du site.

**La partie privée** — rendue dans le navigateur, chaque requête contrôlée par
le serveur :

- Un formulaire d'inscription en cinq étapes : l'enfant, les responsables, la
  fiche santé, les autorisations, la vérification. Le brouillon survit à la
  fermeture de l'onglet ; la fiche santé, non — elle n'est jamais écrite sur le
  disque du visiteur.
- Des comptes : adresse e-mail et mot de passe, sessions en base, mot de passe
  oublié, confirmation d'adresse. Tout écrit ici, sans service tiers.
- Un espace famille : les enfants, leurs inscriptions, leur fiche santé, leurs
  autorisations — modifiables à tout moment.
- Un back office : liste d'appel du chef limitée à sa section, dossiers à
  relire, fiches santé, état des cotisations (le montant reste au CU et au
  trésorier), distribution des rôles.
- Le barème d'affiliation de la fédération, appliqué correctement : le tarif
  famille vaut pour **tous** les membres du ménage inscrits, pas seulement pour
  le deuxième — inscrire un cadet fait donc baisser la cotisation de l'aîné, et
  le site recalcule toute la fratrie. Route, inscription tardive, tarif social
  et réduction animateur breveté sont couverts (`shared/cotisations.ts`).
- Le paiement de la cotisation par Bancontact ou carte (Mollie), avec le
  virement à communication structurée comme solution de repli — et un
  simulateur de paiement tant que le compte Mollie n'est pas ouvert, pour
  dérouler toute la chaîne sans banque (`NUXT_PAIEMENT_DEMO=1`).
- Le RGPD pour de vrai : consentements horodatés et révocables, chiffrement des
  fiches santé, journal des accès visible par les familles, export complet des
  données, demandes d'exercice des droits, purge automatique.

## Ce qu'il ne fait pas, et pourquoi

| Manque | Raison |
| --- | --- |
| Galerie photos | Décision du staff d'unité sur le droit à l'image, et stockage protégé. Le consentement, lui, est déjà recueilli et exploitable. |
| Dépôt de documents | Suppose un stockage de fichiers. Le socle est là, il manque le seau. |
| Synchronisation avec SCRIBe | Les Guides ont leur propre base, à mettre à jour pour le 15 novembre. À décider : recopier à la main ou exporter. |
| Deuxième facteur pour le staff | Un CU voit toutes les fiches santé de l'unité. À terme, ce compte-là mérite mieux qu'un mot de passe. |

## Architecture

```
app/
  assets/scss/     architecture 7-1, BEM, propriétés logiques
  components/
    app/           coque : rail, barre d'outils, recherche, sélecteur de rôle
    panneau/       les trois panneaux du tableau de bord
    ui/            le jeu d'icônes
  composables/     rôle, planning, météo
  data/            toutes les données du site, en TypeScript
  layouts/         la coque « console »
  pages/           les routes
  middleware/      gardes de navigation (connecté, staff)
shared/            ce que le navigateur ET le serveur utilisent :
                   catalogue des consentements, schémas de validation,
                   bornes d'âge des sections
server/
  api/             les routes de l'application (auth, inscriptions, espace
                   famille, back office, paiements, RGPD)
  base/schema/     les 17 tables, en Drizzle
  base/migrations/ le SQL versionné
  middleware/      lecture de la session à chaque requête
  tasks/menage.ts  la purge RGPD, toutes les nuits
  utils/           droits d'accès, chiffrement, journal, sessions, courriels
  routes/          flux iCalendar et sitemap, prérendus au build
tests/             les règles d'accès, testées sur une vraie base
docs/              RGPD et exploitation
```

### Les trois documents à lire avant de toucher au code

- `docs/rgpd.md` — où vit chaque règle, et pourquoi elle est comme ça.
- `docs/exploitation.md` — héberger, sauvegarder, mettre en route.
- `server/utils/droits.ts` — la seule place où l'on décide qui voit quoi.

### Une singularité de l'unité, à connaître avant de toucher au code

La 16e est née de la fusion de deux unités non mixtes. Elle est affiliée **aux
Guides**, toutes sections confondues — il y avait une embrouille avec la
fédération scoute au moment de la fusion. Mais les sections non mixtes ont été
gardées avec leurs noms et leur lore : Lutins et Guides d'un côté, Louveteaux et
Scouts de l'autre.

Donc : **un seul barème de cotisation, celui des Guides**, malgré les noms de
sections. C'est le genre de détail qu'on « corrige » de travers en arrivant sur
le projet.

### Les données

Deux sources, et c'est volontaire.

**Le contenu éditorial** est en TypeScript, et il est coupé en deux selon qui a
le droit de le lire :

- `app/data/` — public. Ce dossier part dans le paquet JavaScript téléchargé par
  n'importe quel visiteur. N'y mettre que ce que tout le monde peut lire :
  l'identité des sections, l'unité, les infos pratiques.
- `server/donnees/` — réservé. Le planning, le staff, les événements, les actus,
  les documents. Le navigateur ne reçoit jamais ces fichiers ; ils sortent par
  `/api/contenu`, filtrés selon le compte.

La règle pour trancher : *est-ce que je serais gêné de le voir apparaître dans
un fichier public ?* Si oui, c'est `server/donnees/`.

**Les données des personnes** sont dans PostgreSQL. Elles changent tous les
jours, elles sont privées, et elles doivent pouvoir être effacées.

- `planning.ts` — les 32 samedis de la saison, transcrits du classeur
  « [HE16] Planning Annuel Réunions » partagé par le staff d'unité.
- `sections.ts` — les huit entrées du rail, avec le mapping vers les noms du
  classeur (`Loups` → `louveteaux`). Depuis le 28/09/2026, la section des 16-18
  s'appelle `horizons` partout, comme dans le classeur ; `/sections/pios`
  redirige.
- `staff.ts` — prénoms et totems seulement. Lire la note en tête du fichier.
- `evenements.ts`, `actus.ts`, `documents.ts`, `unite.ts` — contenu rédigé,
  à relire.

### Mettre à jour le planning

Le classeur reste la source de vérité. Pour reporter une saison :

```bash
# Exporter l'onglet de la saison en CSV depuis Google Sheets, puis :
node scripts/importer-planning.mjs chemin/vers/planning.csv 2026
```

Le script réécrit `server/donnees/planning.ts` (le planning est réservé, il
ne repasse pas par `app/data/`). Il s'arrête à la fin de la première saison de
l'export et prévient si une date ne tombe pas un samedi. À terme, le site devrait lire
directement les flux iCal que le classeur génère déjà, ce qui supprimerait
cette étape.

## Direction visuelle

Reprise des maquettes Figma « Scouts - Website » : panneaux flottants très
arrondis, rail de sections, cartes empilées, fond sombre. Les variables de
couleur viennent du fichier Figma (`#10111A`, `#302E41`, `#E72C1C`, `#4DCBF3`).

Deux écarts assumés par rapport aux maquettes :

1. **Photos au lieu d'illustrations**, conformément au cahier des charges de
   juillet 2026 (`Notes/05 Scouts/Site web — cahier des charges.md`), qui est
   postérieur aux maquettes.
2. **Teintes de section éclaircies.** Elles servent de couleur de texte sur les
   cartes et devaient passer le seuil de contraste 4.5:1.

## Accessibilité

Vérifié avec axe-core sur vingt pages, publiques et privées : aucune violation. Contrastes calculés
pour 4.5:1 sur les deux fonds ($noir et $ardoise), navigation au clavier,
repères ARIA, `prefers-reduced-motion` respecté.

## Déploiement

Le site n'est plus statique : il lui faut un serveur Node et une base
PostgreSQL. `docs/exploitation.md` compare trois hébergements possibles avec
leurs prix, et donne la liste de contrôle à passer avant d'ouvrir aux familles.

Le site est en ligne sur <https://16e-fleurus.netlify.app> (non indexé). La
construction Netlify passe depuis le 4 septembre 2026 : le déploiement porte
bien la fonction serveur de Nitro, et les pages publiques comme `/api/contenu`
répondent.

Les variables d'environnement ont été posées dans Netlify le 29 septembre
2026 : `NUXT_BASE_URL` (la base Neon), `NUXT_CLE_SANTE`, `CRON_SECRET` en
secrets, plus `NUXT_PUBLIC_URL_SITE`. Avant ça, toute connexion en ligne
tombait en 500, faute de base. Les trois secrets ne se relisent pas par l'API :
en cas de doute, c'est dans
<https://app.netlify.com/projects/16e-fleurus/configuration/env>.

Tant que les comptes de démonstration existent (`NUXT_DEMO_AUTORISEE=1`),
n'importe qui connaissant l'adresse peut ouvrir le back office avec un mot de
passe trivial, donc les fiches santé. C'est tenable avec des familles
fictives, pas une minute de plus : `npm run base:semer -- --sans-demo`.

Les en-têtes (noindex, type des flux iCal, cache des images) viennent de
`public/_headers`.

## Sécurité — ce qui est vrai, et ce qui ne l'est pas

Ce qui est vrai :

- Les mots de passe sont hachés (scrypt, paramètres OWASP), jamais stockés.
- Les sessions sont des jetons aléatoires ; la base n'en garde que l'empreinte.
- Les fiches santé sont chiffrées avec une clé absente de la base.
- Chaque route de l'API refait le contrôle des droits, sans faire confiance au
  navigateur. Les cas limites sont testés (`npm test`).
- Les essais de connexion sont freinés, par adresse et par IP.
- Le formulaire de connexion et celui de mot de passe oublié ne révèlent pas si
  une adresse est connue.

- Le contenu réservé n'est plus dans le paquet JavaScript public. Le planning
  des sections, les intitulés internes du classeur, les adresses des staffs, les
  actus et rendez-vous réservés vivent dans `server/donnees/` et sortent par
  `/api/contenu`, qui lit le rôle dans la session. Un visiteur reçoit le
  squelette du planning — les dates et les horaires, qui sont publics — et rien
  d'autre. Vérifié par des tests écrits du point de vue de quelqu'un qui
  interroge l'API directement.
- Les flux iCalendar ne sont plus des fichiers publics. Ils sont servis contre
  une clé personnelle, que chacun peut changer d'un bouton.

Ce qui ne l'est pas encore :

- Le sélecteur de rôle en bas à gauche reste un outil de démonstration, pour
  les visiteurs uniquement. Il ne change plus que l'affichage de ce que le
  serveur a déjà accepté d'envoyer — c'est-à-dire presque rien.
- Pas de deuxième facteur pour les comptes du staff d'unité.
- Pas de limitation de débit sur les autres routes que la connexion.
