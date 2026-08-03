# Sketching Tools Hub

Un hub centralisé pour tous tes outils de sketching et de conception.

## Tech Stack
- **Astro** - Framework principal
- **React** - Pour les composants UI (validé)
- **p5.js** - Pour les outils de dessin et animation (à valider)
- **Tailwind CSS** - Pour le style (à valider)

## Structure du projet

```
sketching-tools/
├── src/
│   ├── components/          # Composants réutilisables
│   │   ├── Header.astro      # En-tête du site
│   │   └── ToolCard.astro    # Carte pour afficher un outil
│   │
│   ├── layouts/             # Layouts
│   │   └── MainLayout.astro  # Layout principal avec header/footer
│   │
│   ├── pages/               # Pages du site
│   │   ├── index.astro       # Page d'accueil (hub principal)
│   │   └── tools/           # Dossier des outils
│   │       ├── drawing-canvas.astro  # Exemple: outil de dessin
│   │       └── ...           # Ajoute tes outils ici
│   │
│   └── styles/              # (À créer) Styles globaux
│       └── global.css       # Fichier Tailwind CSS
│
├── public/                  # Assets statiques
├── package.json
├── astro.config.mjs
└── AGENTS.md                # Configuration et besoins du projet
```

## Ajouter un nouvel outil

1. **Créer le fichier** dans `src/pages/tools/` (ex: `mon-outil.astro`)
2. **Ajouter l'entrée** dans le tableau `tools` dans `src/pages/index.astro`:
   ```javascript
   {
     title: "Mon outil",
     description: "Description de mon outil",
     href: "/tools/mon-outil",
     icon: "🎨",
     color: "blue", // ou: green, purple, orange, red, pink, indigo, teal
   }
   ```
3. **Utiliser le layout** dans ton outil:
   ```astro
   ---
   import MainLayout from "../../layouts/MainLayout.astro";
   ---
   <MainLayout title="Mon outil">
     <!-- Ton contenu ici -->
   </MainLayout>
   ```

## Utiliser p5.js dans un outil

1. **Installer p5.js**: `npm install p5`
2. **Créer un conteneur** dans ton fichier Astro:
   ```html
   <div id="sketch-container"></div>
   ```
3. **Ajouter le script p5.js**:
   ```html
   <script>
     function setup() {
       let canvas = createCanvas(800, 600);
       canvas.parent('sketch-container');
     }
     
     function draw() {
       // Ton code de dessin ici
     }
   </script>
   ```

## Utiliser Tailwind CSS

1. **Installer Tailwind**: `npm install -D tailwindcss postcss autoprefixer`
2. **Configurer Tailwind**: `npx tailwindcss init -p`
3. **Mettre à jour astro.config.mjs**:
   ```javascript
   import { defineConfig } from 'astro/config';
   import tailwind from '@astrojs/tailwind';
   
   export default defineConfig({
     integrations: [tailwind()],
   });
   ```
4. **Créer global.css** dans `src/styles/`:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

## Dépendances à valider

- [ ] **p5.js** - Pour les outils de dessin et animation
- [ ] **Tailwind CSS** - Pour le style du hub et des outils
- [ ] **@astrojs/tailwind** - Intégration Tailwind pour Astro

## Commandes utiles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Démarre le serveur de développement |
| `npm run build` | Construit le projet pour la production |
| `npm run preview` | Prévisionne le build |
| `astro dev --background` | Démarre le serveur en arrière-plan |
| `astro dev stop` | Arrête le serveur en arrière-plan |

## Couleurs disponibles pour ToolCard

- `blue` (défaut)
- `green`
- `purple`
- `orange`
- `red`
- `pink`
- `indigo`
- `teal`
