# Instructions projet pour Claude Code

## Workflow Git (règle impérative)

- **Toujours travailler sur une branche dédiée**, jamais directement sur `main`.
  Préfixes : `feature/`, `update/`, `refactor/`, `bugfix/`, `hotfix/`, `chore/`, `component/`.
- **Quand le travail correspond à un ticket GitHub (issue), le nom de la branche
  doit reprendre le ticket** : `<préfixe>/<numéro-du-ticket>-<slug-du-titre>`.
  Exemple pour l'issue #23 "Snackbar de feedback utilisateur" :
  `feature/23-snackbar-feedback-utilisateur`. Ne pas utiliser de nom de branche
  généré aléatoirement pour un ticket identifié.
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
