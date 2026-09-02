# Site de la 16e Fleurus

Plateforme web de l'unité scoute et guide 16e Fleurus — Notre-Dame des Champs.

> **Ce dépôt est un chantier.** Rien n'a été relu par le staff d'unité. Le
> déploiement porte un `X-Robots-Tag: noindex` et un `robots.txt` qui interdit
> tout référencement, volontairement.

## Démarrer

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm generate   # site statique dans .output/public
```

Nuxt 4, Vue 3, Sass. Pas de framework CSS, pas de bibliothèque de composants.

## Ce que le site fait aujourd'hui

- Un tableau de bord en page d'accueil : prochaine réunion, météo réelle de
  Fleurus, événements et actualités.
- Une page par section (six sections animées, la Route, le staff d'unité),
  avec son staff, son calendrier et la répartition de sa saison.
- Le planning annuel complet, filtrable par section.
- Huit flux iCalendar auxquels on peut s'abonner depuis n'importe quel agenda.
- Une recherche locale sur tout le contenu du site.
- Quatre vues selon le public : visiteur, parent, animé, chef.

## Ce qu'il ne fait pas, et pourquoi

| Manque | Raison |
| --- | --- |
| Authentification | Le sélecteur de rôle change l'affichage, pas les droits. Il faut un rendu côté serveur ou un service d'authentification. |
| Coordonnées des chefs | Voir la note en tête de `app/data/staff.ts`. Un site statique livre tout son contenu à tout le monde. |
| Galerie photos | Décision du staff d'unité sur le droit à l'image, et stockage protégé. |
| Inscriptions et cotisations | La fédération fournit déjà Desk. Ne pas le refaire. |
| Dépôt de documents | Suppose un stockage et une connexion. |

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
server/
  routes/          flux iCalendar et sitemap, prérendus au build
  utils/ics.ts     génération iCalendar
```

### Les données

Tout est dans `app/data/`. Aucune base, aucun CMS pour l'instant : les fichiers
TypeScript sont la source.

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

Vérifié avec axe-core sur huit pages : aucune violation. Contrastes calculés
pour 4.5:1 sur les deux fonds ($noir et $ardoise), navigation au clavier,
repères ARIA, `prefers-reduced-motion` respecté.

## Déploiement

En ligne : <https://16e-fleurus.netlify.app> (non indexé).

Le build tourne **en local**, pas sur Netlify : leur image de build échoue sur
ce projet (installation pnpm). En attendant d'avoir tracé la cause, on dépose
la sortie déjà générée.

```bash
pnpm generate
rm -rf /tmp/deploy && mkdir /tmp/deploy
cp -r .output/public/. /tmp/deploy/
printf '[build]\n  publish = "."\n  command = ""\n' > /tmp/deploy/netlify.toml
# puis déployer /tmp/deploy sur le site 16e-fleurus
```

Les en-têtes (noindex, type des flux iCal, cache des images) viennent de
`public/_headers`, copié dans la sortie statique.

**À faire** : brancher le dépôt Git sur Netlify et faire fonctionner leur build,
pour que chaque commit se déploie tout seul.
