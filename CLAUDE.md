# Sketching Tools Hub

## Vue d'ensemble
- **Nom** : Sketching Tools Hub
- **But** : hub centralisé pour les outils de sketching/dessin
- **Stack** : Astro, React/Preact, p5.js, Tailwind CSS

## Fichiers clés
- `src/pages/index.astro` - Page d'accueil du hub (détecte automatiquement les outils)
- `src/pages/tools/*.astro` - Outils individuels (auto-enregistrés)
- `src/components/ToolCard.astro` - Carte d'affichage d'un outil
- `src/layouts/MainLayout.astro` - Layout principal

## Ajouter un outil
1. Ajouter un fichier `.astro` dans `src/pages/tools/`
2. Définir les métadonnées dans le frontmatter :
   ```
   const title = "Nom de l'outil";
   const description = "Description de l'outil";
   const icon = "🎨";
   const color = "blue";
   ```
3. L'outil apparaît automatiquement sur la page d'accueil (`Astro.glob("./tools/*.astro")` dans `src/pages/index.astro`, chaque entrée expose `file`, `url`, `frontmatter`)

Couleurs disponibles : blue (défaut), green, purple, orange, red, pink, indigo, teal

## Commandes
```bash
npm run dev      # Démarre le serveur de développement
npm run build    # Build de production
npm run preview  # Prévisualise le build
```

## Règles de code

### Fonctions pures par défaut
Toute nouvelle fonction doit être pure sauf contrainte de framework (p5.js, React...) :
- Aucun effet de bord (pas de mutation d'état global, DOM, fichiers...)
- Déterministe (mêmes entrées → même sortie)
- Ne dépend que de ses paramètres

Si une fonction ne peut pas être pure, elle doit :
1. Être documentée avec le tag JSDoc `@impure`
2. Lister tous ses effets de bord
3. Lister toutes ses dépendances externes

```javascript
/**
 * @pure - No side effects, only depends on parameters
 */
function getAvailableShapes(settings) {
  const availableShapes = Object.keys(settings).filter(shape => settings[shape]);
  return availableShapes.length ? availableShapes : ['circle', 'square', 'triangle', 'line'];
}

/**
 * @impure - Modifies selectedShape, currentLevel, shapeParams. Uses random()
 */
function generateNewShape(level = currentLevel, settings = shapeSettings) {
  selectedShape = random(getAvailableShapes(settings));
  currentLevel = level;
  generateShapeParams();
  return selectedShape;
}
```

### Dépendances
- Utiliser uniquement les dépendances déjà présentes dans `package.json` (npm, pas de CDN)
- Exception : P5.js peut rester en CDN (temporaire, en attendant l'intégration npm complète)
- Tailwind CSS via le package `tailwindcss` (`@import "tailwindcss"`), jamais le CDN

### Validation des entrées
Valider en tout début de fonction, retourner tôt (`return;`) en cas d'entrée invalide.

### Pas de conditions imbriquées
Préférer les retours anticipés aux `if` imbriqués.

### Pas de tableaux imbriqués dans les chaînes
Extraire une fonction dédiée plutôt que `array.map(item => item.subArray.map(...))`.

### Lisibilité
Noms explicites, code auto-documenté, commentaires seulement si nécessaires.

### Organisation
- Une fonction = une responsabilité, idéalement < 20 lignes
- JSDoc sur toutes les fonctions (paramètres, retour, effets de bord, `@pure`/`@impure`)
- Regrouper les fonctions liées, sections marquées `// ===== SECTION NAME =====`, pures avant impures
- camelCase, préfixes `get`/`set`, verbes pour les actions

### UI et styles
- Styles au sein des composants (inline ou `<style>` scopé)
- Variables partagées (couleurs, fonts, espacements) dans `src/styles/variables.css`
- Pas de framework CSS externe sans validation explicite de l'utilisateur
- Composants toast/notification réutilisables (durée, position configurables)
- Voir `.claude/best-practices.md` pour les règles UI/UX détaillées (accessibilité, animation, typographie, couleurs, layout, rédaction)
- Voir `.claude/ux-heuristics.md` pour les critères ergonomiques Bastien & Scapin (guidage, charge de travail, contrôle explicite, gestion des erreurs, cohérence, etc.)

### Communication inter-composants
Utiliser des `CustomEvent` plutôt que des appels de fonction directs :
```javascript
document.dispatchEvent(new CustomEvent('showToast', { detail: { score: 95 } }));
document.addEventListener('showToast', (e) => { const score = e.detail.score; });
```
Événements en kebab-case, données dans `event.detail`. Pour l'intégration P5.js/Astro, préférer les custom events aux propriétés `window`.

## Workflow

- Être économe en tokens
- Afficher une checklist avant chaque action
- Commit après chaque tâche terminée
- **Branches** : toujours créer une branche dédiée à partir de `dev` (jamais depuis `main`), nommée `<numero-ticket>-<nom-du-ticket>` en kebab-case (ex : `42-ajout-mode-sombre`). Sans numéro de ticket, utiliser les préfixes `feature/`, `bugfix/`, etc.
- **Pull Requests** : une fois le développement terminé, créer une PR en **draft** ciblant `dev` (jamais `main`)

### Design (Penpot)
- Le fichier Penpot est organisé en pages par périmètre : **Website** (site vitrine/marketing) et **Tools** (produits/outils). Les composants suivent le même découpage : **Website / Components** et **Tools / Components**. Toujours vérifier ces pages en premier pour retrouver les références existantes.
- **Avant de considérer qu'un design est manquant** (écran, composant, comportement responsive...) : toujours checker le MCP Penpot en premier — page **Website** ou **Tools** selon le périmètre du ticket — pour voir si la maquette existe déjà. Ne conclure à son absence qu'après avoir vérifié.
- **Quand un ticket référence déjà un design existant** : checker le MCP Penpot pour vérifier que la maquette est bien à jour avant de l'utiliser comme référence — elle a pu évoluer depuis la création du ticket.
- Si le design est bien manquant et que le MCP Penpot est disponible :
  1. Identifier le bon périmètre (Website vs Tools)
  2. Créer une nouvelle Page Penpot dans ce périmètre, nommée `<numéro> - <nom du ticket>`
  3. Produire un ou plusieurs designs sur cette page pour illustrer le ticket
  4. Référencer cette page/ces designs dans le ticket (lien ou export) une fois créés
- Si la connexion MCP n'est pas active, demander l'accès au projet Penpot avant de continuer.
- **Tokens** : toujours utiliser les design tokens de la librairie locale (`penpot.library.local.tokens`), jamais de valeurs codées en dur (couleurs, espacements, typographies, rayons)
- **Composants** :
  1. Utiliser en priorité les composants des pages Website / Components et Tools / Components de la librairie Penpot (`penpot.library.local.components`, ou librairies connectées)
  2. À défaut, se référer aux composants déjà existants dans `src/components/`
  3. Ne jamais créer un nouveau composant (Penpot ou code) sans validation explicite de l'utilisateur : proposer le composant, expliquer pourquoi les composants existants ne suffisent pas, attendre l'accord

### Checklist
```
## Checklist
- [ ] Task 1
- [ ] Task 2
```

## Skills
Les skills du projet vivent dans `.claude/skills/` :
- `product-manager-agent` - création d'issues GitHub minimalistes
- `content-director` - rédaction/révision de contenu textuel minimaliste
