# Contexte du Projet : Sketching Tools Hub

## 📌 Vue d'Ensemble
**Sketching Tools Hub** est une application web centralisant des outils de sketching et de conception pour faciliter la création rapide de prototypes, dessins, et animations.

---

## 🎯 Objectifs Principaux
1. **Centralisation** : Regrouper tous les outils de sketching en un seul endroit accessible.
2. **Simplicité** : Interface intuitive pour créer et utiliser des outils sans configuration complexe.
3. **Extensibilité** : Architecture modulaire pour ajouter facilement de nouveaux outils.
4. **Performance** : Temps de chargement optimisés pour une expérience fluide.

---

## 🛠️ Stack Technique

### ✅ Validé
- **[Astro](https://astro.build/)** : Framework principal pour le rendu hybride (SSG + SSR).
  - **Pourquoi ?** : Léger, rapide, et optimisé pour les sites statiques avec des îles d'interactivité.
  - **Usage** : Structure des pages, routing, intégration des composants React.
- **[React](https://react.dev/)** : Bibliothèque pour les composants UI dynamiques.
  - **Pourquoi ?** : Intégration native avec Astro, écosystème riche.
  - **Usage** : Composants interactifs (ex: boutons, modales, paramètres des outils).

### ⏳ À Valider (Voir [AGENTS.md](./AGENTS.md) pour le processus)
- **[p5.js](https://p5js.org/)** : Bibliothèque pour le dessin créatif et les animations.
  - **Cas d'usage** :
    - Outil de dessin libre (`/tools/drawing-canvas`).
    - Générateur de formes géométriques.
    - Animations interactives.
- **[Tailwind CSS](https://tailwindcss.com/)** : Framework CSS utilitaire.
  - **Cas d'usage** :
    - Styling cohérent du hub (boutons, cartes, layouts).
    - Design responsive sans écrire de CSS custom.
- **[@astrojs/tailwind](https://docs.astro.build/en/guides/integrations-guide/tailwind/)** : Intégration officielle de Tailwind pour Astro.

---

## 📁 Structure du Projet

```
sketching-tools/
├── src/
│   ├── components/          # Composants réutilisables (Astro/React)
│   │   ├── Header.astro     # En-tête du site
│   │   └── ToolCard.astro   # Carte pour afficher un outil
│   │
│   ├── layouts/             # Layouts partagés
│   │   └── MainLayout.astro # Layout principal (header + footer)
│   │
│   ├── pages/               # Pages du site
│   │   ├── index.astro      # Page d'accueil (liste des outils)
│   │   └── tools/           # Dossier des outils
│   │       ├── drawing-canvas.astro  # Exemple : outil de dessin
│   │       └── ...          # Ajoute tes outils ici
│   │
│   └── styles/              # Styles globaux
│       └── global.css       # Fichier Tailwind CSS (à créer)
│
├── public/                  # Assets statiques (images, polices)
│
├── package.json            # Dépendances et scripts
├── astro.config.mjs        # Configuration Astro
├── AGENTS.md               # Règles pour les agents IA
└── CONTEXT.md              # Ce fichier
```

---

## 🚀 Fonctionnalités Clés

### 1. Hub Principal (`/`)
- **Description** : Page d'accueil listant tous les outils disponibles sous forme de cartes cliquables.
- **Composants** :
  - `Header` : Titre + navigation.
  - `ToolCard` : Carte avec icône, titre, description, et couleur thématique.
  - `MainLayout` : Structure de base pour toutes les pages.

### 2. Outils Individuels (`/tools/*`)
- **Structure** : Chaque outil est une page Astro dans `/src/pages/tools/`.
- **Exemple** : `drawing-canvas.astro` pour un outil de dessin avec p5.js.
- **Intégration** :
  - Utilise `MainLayout` pour la cohérence.
  - Peut inclure du JavaScript côté client (ex: p5.js).

### 3. Ajout d'un Nouvel Outil
1. Créer un fichier dans `/src/pages/tools/` (ex: `mon-outil.astro`).
2. Ajouter une entrée dans le tableau `tools` de `index.astro` :
   ```javascript
   {
     title: "Mon outil",
     description: "Description courte",
     href: "/tools/mon-outil",
     icon: "🎨",  // Emoji ou SVG
     color: "blue" // Couleur de la carte (voir ci-dessous)
   }
   ```
3. Utiliser `MainLayout` dans le fichier de l'outil.

---

## 🎨 Design System

### Couleurs des Cartes (`ToolCard`)
Les couleurs disponibles pour l'attribut `color` des outils :
- `blue` (défaut)
- `green`
- `purple`
- `orange`
- `red`
- `pink`
- `indigo`
- `teal`

> **Note** : Ces couleurs sont définies dans Tailwind CSS (à valider).

### Icônes
- Utilise des **emojis** pour les icônes (ex: `🎨` pour un outil de dessin, `📐` pour un outil de géométrie).
- Alternative : Intégrer une bibliothèque d'icônes (ex: [Heroicons](https://heroicons.com/)) si besoin.

---

## 📦 Dépendances

### Actuelles (Validées)
```json
{
  "dependencies": {
    "astro": "^4.x",
    "react": "^18.x",
    "react-dom": "^18.x"
  }
}
```

### Proposées (À Valider)
| Dépendance | Version | Usage | Statut |
|------------|---------|-------|--------|
| `p5` | ^1.9.0 | Dessin/Animation | ⏳ |
| `tailwindcss` | ^3.4.0 | Styling | ⏳ |
| `@astrojs/tailwind` | ^5.0.0 | Intégration Tailwind | ⏳ |
| `postcss` | ^8.4.0 | Requise par Tailwind | ⏳ |
| `autoprefixer` | ^10.4.0 | Requise par Tailwind | ⏳ |

> ⚠️ **Ne pas installer** sans approbation (voir [AGENTS.md](./AGENTS.md)).

---

## 🔧 Commandes Utiles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Démarre le serveur de développement (`localhost:4321`). |
| `npm run build` | Construit le projet pour la production (`./dist/`). |
| `npm run preview` | Prévisionne le build localement. |
| `npm install [package]` | Installe une dépendance (⚠️ Voir règles dans [AGENTS.md](./AGENTS.md)). |
| `npx astro add [integration]` | Ajoute une intégration Astro (ex: `tailwind`). |
| `npx tailwindcss init -p` | Initialise Tailwind CSS + PostCSS. |

---

## 📝 Historique des Décisions

| Date | Décision | Contexte |
|------|----------|----------|
| 2025-08-02 | Choix d'Astro + React | Framework léger et modulaire pour un hub d'outils. |
| 2025-08-02 | Structure `/tools/*` | Permet un routing clair et une extensibilité facile. |

---

## 🔗 Liens Utiles
- [Documentation Astro](https://docs.astro.build/)
- [Documentation React](https://react.dev/)
- [p5.js Reference](https://p5js.org/reference/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [GitHub du Projet](https://github.com/MaloGermond/sketching-tools)
