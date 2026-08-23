# Instructions projet pour Claude Code

## Workflow Git (règle impérative)

- **Toujours travailler sur une branche dédiée**, jamais directement sur `main`.
  Préfixes : `feature/`, `update/`, `refactor/`, `bugfix/`, `hotfix/`, `chore/`, `component/`.
- **Toujours ouvrir la Pull Request en mode draft** dès le début du travail, et la
  garder en draft tant que le développement n'est pas terminé et testé. Ne la
  repasser "Ready for review" que lorsque le travail est complet.

Ces règles sont aussi documentées dans `.vibe/workflow.md` (utilisé par Mistral
Vibe) ; ce fichier sert d'équivalent pour Claude Code, qui ne lit pas `.vibe/`.

## Règles de code

Voir `.vibe/rules.md` pour le détail (fonctions pures par défaut, validation
précoce, pas de conditions imbriquées, communication inter-composants via
`CustomEvent`, etc.). À respecter également pour tout code généré par Claude.

## Stack

Astro + Preact (`@astrojs/preact`) + Tailwind CSS (`@tailwindcss/vite`) + p5.js
(seule lib autorisée en CDN, le reste passe par npm).
