# Project Instructions for Sketching Tools Hub

## Project Overview
- **Name**: Sketching Tools Hub
- **Purpose**: Central hub for sketching/company tools
- **Tech Stack**: Astro, React, p5.js (pending), Tailwind CSS (pending)

## Key Files
- `src/pages/index.astro` - Main hub page (auto-detects tools)
- `src/pages/tools/*.astro` - Individual tools (auto-registered)
- `src/components/ToolCard.astro` - Tool card component
- `src/layouts/MainLayout.astro` - Main layout

## How It Works
1. Add any `.astro` file to `src/pages/tools/`
2. Define metadata in frontmatter:
   ```
   const title = "Tool Name";
   const description = "Tool description";
   const icon = "🎨";
   const color = "blue";
   ```
3. The tool automatically appears on the home page

## Available Colors
- blue (default)
- green
- purple
- orange
- red
- pink
- indigo
- teal

## Pending Dependencies
- [ ] p5.js - for drawing/animation tools
- [ ] Tailwind CSS - for styling
- [ ] @astrojs/tailwind - Astro integration

## Commands
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview build
```

## Astro glob usage
- `Astro.glob("./tools/*.astro")` from `src/pages/index.astro` gets all tools
- Each entry has: `file`, `url`, `frontmatter` properties
