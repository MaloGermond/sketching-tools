# Règles pour Vibe Code et les Agents IA

## Contexte
Ce document définit les règles spécifiques pour Vibe Code et les agents IA travaillant sur le projet **Sketching Tools Hub**.

---

## Règles Générales

### 1. **Portée des Modifications**
- **Ne modifie que ce qui est demandé** : Si la tâche est spécifique (ex: "ajoute une dépendance X"), limite-toi à cette action.
- **Ne fais pas de refactoring non demandé** : Sauf si explicitement demandé ou si c'est nécessaire pour résoudre un bug critique.

### 2. **Communication**
- **Sois concis** : Évite les explications inutiles ou les résumés génériques.
- **Signale les blocages** : Si une décision impacte la portée, le risque ou la livraison, demande une clarification.
- **Propose des alternatives** : Si tu identifies une meilleure approche, présente-la brièvement avec ses avantages/inconvénients.

### 3. **Qualité du Code**
- **Respecte le style existant** : Architecture, naming, gestion des erreurs, et conventions du projet.
- **Pas de commentaires inutiles** : Seuls les invariants non évidents, protocoles ou contraintes de sécurité méritent un commentaire.
- **Tests** : Exécute les tests existants avant de pousser. Ajoute des tests si le code existant en a.

---

## Gestion des Dépendances

### ⚠️ **Règle Strictement Appliquée**
**Quand tu ajoutes une dépendance (ex: `npm install X`) :**
1. **Ajoute UNIQUEMENT la dépendance demandée**.
2. **Ne fais PAS d'hypothèses** sur les dépendances complémentaires.

### Processus pour les Suggestions de Dépendances
Si tu penses qu'une dépendance supplémentaire serait utile **ou nécessaire** pour le projet :

1. **Arrête-toi** avant de l'ajouter.
2. **Présente une proposition** sous ce format :
   ```markdown
   ### Proposition de dépendance : [nom]
   - **Description** : [1 phrase expliquant ce que fait la dépendance]
   - **Utilité pour le projet** : [1 phrase expliquant son rôle dans Sketching Tools Hub]
   - **Exemple d'usage** : [Optionnel - cas concret dans le projet]
   - **Impact** : [Taille, dépendances transitives, maintenance]
   ```
3. **Attends l'approbation explicite** avant de procéder à l'installation.

### Exemples de Propositions

#### Exemple 1 : p5.js
```markdown
### Proposition de dépendance : p5.js
- **Description** : Bibliothèque JavaScript pour le dessin créatif et les animations.
- **Utilité pour le projet** : Permet de créer des outils de sketching interactifs (ex: canvas de dessin, générateurs de formes).
- **Exemple d'usage** : Intégration dans `/src/pages/tools/drawing-canvas.astro` pour un outil de dessin.
- **Impact** : ~500Ko (minifié), aucune dépendance transitive, très stable.
```

#### Exemple 2 : Tailwind CSS
```markdown
### Proposition de dépendance : tailwindcss + @astrojs/tailwind
- **Description** : Framework CSS utilitaire pour un styling rapide et cohérent.
- **Utilité pour le projet** : Standardise le style du hub et des outils avec des classes prêtes à l'emploi.
- **Exemple d'usage** : Style des `ToolCard` et des layouts dans `/src/components/`.
- **Impact** : ~20Mo (dev), optimisé en prod. Nécessite `postcss` et `autoprefixer`.
```

---

## Workflow Git

### Branches
- **Nommage** : Utilise le préfixe `vibe/` pour les branches créées par Vibe Code (ex: `vibe/feature-drawing-tool-02b2d9`).
- **Protection** : Ne force-push PAS sur `main` ou des branches protégées sans approbation.

### Commits
- **Messages** : Utilise des messages clairs et atomiques (ex: `feat: add p5.js dependency`, `fix: toolcard color bug`).
- **Portée** : Un commit = une modification logique. Évite les commits géants.

---

## Livraison

### Pull Requests
- **Draft PR** : Ouvre une PR en draft si le travail n'est pas finalisé.
- **Description** : Inclus :
  - Résumé des changements (1-2 lignes).
  - Commandes de vérification exécutées (ex: `npm run build`, `npm test`).
  - Capture d'écran si UI impactée.
- **Clôture** : Utilise `Closes #123` si la PR résout une issue GitHub.

### Monitoring CI
- Si l'utilisateur demande de monitorer la CI :
  1. Inspecte les logs des checks.
  2. Identifie la cause racine des échecs.
  3. Propose une correction ciblée.

---

## Sécurité

- **Ne jamais exposer de secrets** : Tokens, clés API, mots de passe, etc.
- **Vérifie les fichiers** avant commit : `.env`, `config.json`, etc.
- **Dépendances** : Vérifie la réputation et la maintenance des packages avant suggestion (ex: nombre de téléchargements, dernière mise à jour).

---

## Outils du Projet

### Tech Stack Validée
| Outil | Usage | Statut |
|-------|-------|--------|
| Astro | Framework principal | ✅ Validé |
| React | Composants UI | ✅ Validé |

### Tech Stack à Valider
| Outil | Usage | Statut |
|-------|-------|--------|
| p5.js | Dessin/Animation | ⏳ En attente |
| Tailwind CSS | Styling | ⏳ En attente |
| @astrojs/tailwind | Intégration Tailwind | ⏳ En attente |

> ⚠️ **Ne pas installer** les dépendances "à valider" sans approbation explicite.
