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
- Le paiement de la cotisation par Bancontact ou carte (Mollie), avec le
  virement à communication structurée comme solution de repli.
- Le RGPD pour de vrai : consentements horodatés et révocables, chiffrement des
  fiches santé, journal des accès visible par les familles, export complet des
  données, demandes d'exercice des droits, purge automatique.

## Ce qu'il ne fait pas, et pourquoi

| Manque | Raison |
| --- | --- |
| Galerie photos | Décision du staff d'unité sur le droit à l'image, et stockage protégé. Le consentement, lui, est déjà recueilli et exploitable. |
| Dépôt de documents | Suppose un stockage de fichiers. Le socle est là, il manque le seau. |
| Synchronisation avec Desk | La fédération a son propre outil. À décider : recopier ou brancher. |
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

### Les données

Deux sources, et c'est volontaire.

**Le contenu éditorial** est dans `app/data/`, en TypeScript : il change au
rythme des saisons, il se relit en revue de code, et il n'a pas besoin d'une
base.

**Les données des personnes** sont dans PostgreSQL. Elles changent tous les
jours, elles sont privées, et elles doivent pouvoir être effacées.

- `planning.ts` — les 96 dates de la saison, transcrites du classeur
  « [HE16] Planning Annuel Réunions » partagé par le staff d'unité.
- `sections.ts` — les huit entrées du rail, avec le mapping vers les noms du
  classeur (`Loups` → `louveteaux`, `Horizons` → `pios`).
- `staff.ts` — prénoms et totems seulement. Lire la note en tête du fichier.
- `evenements.ts`, `actus.ts`, `documents.ts`, `unite.ts` — contenu rédigé,
  à relire.

### Mettre à jour le planning

Le classeur reste la source de vérité. Pour reporter une saison :

```bash
# Exporter l'onglet de la saison en CSV depuis Google Sheets, puis :
node scripts/importer-planning.mjs chemin/vers/planning.csv
```

Le script réécrit `app/data/planning.ts`. À terme, le site devrait lire
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

L'ancienne version statique est encore en ligne sur
<https://16e-fleurus.netlify.app> (non indexée). La construction Netlify échoue
depuis le début et ses journaux n'étaient pas lisibles depuis l'environnement
de développement — première chose à regarder :
<https://app.netlify.com/projects/16e-fleurus/deploys>.

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

Ce qui ne l'est pas encore :

- Le sélecteur de rôle en bas à gauche reste un outil de démonstration. Il ne
  s'affiche plus quand on est connecté, mais il masque toujours sans protéger —
  et le contenu réservé du site public (planning des sections, contacts) est
  toujours livré dans le paquet JavaScript à qui va le chercher. La suite
  logique est de faire passer ces données-là par l'API, comme tout le reste.
- Pas de deuxième facteur pour les comptes du staff d'unité.
- Pas de limitation de débit sur les autres routes que la connexion.
