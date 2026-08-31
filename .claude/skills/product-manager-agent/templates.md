# 📄 Templates d'Issues GitHub - Version Ultra-Concise

**Règles pour tous les templates :**
- Max 15 lignes de description
- Pas de code dans la description principale
- Toujours lister les technos déjà présentes
- Toujours poser une question si une nouvelle dépendance/composant est envisagée
- Toujours inclure Hors Scope et Dépendances (prérequis)

---

## 📌 Template de Base (Feature Minimale)

```markdown
## [Titre : 5 mots max]

### 🎯 Besoin Produit
[1 phrase : problème business/technique résolu]

### 👥 Besoin Utilisateur  
[1 phrase : qui et quel besoin]

### 📋 À Développer
[2-3 phrases max : description non-technique de ce qui doit être fait]

### 🔗 Dépendances
- [ ] [Prérequis 1 : issue #X doit être terminée]
- [ ] [Prérequis 2 : fonctionnalité Y doit exister]

### 🛠️ Spécifications Techniques
- **Frontend :** [Technos existantes]
- **Backend :** [Technos existantes]
- **Base de données :** [Technos existantes]
- **À valider :** [Si ajout nécessaire : "Est-ce qu'on ajoute [X] ? Argumentaire : [pourquoi]"]

### 🎨 Maquettes
[Lien vers Figma/Adobe XD] ou [Description visuelle simple]

### 🔗 Liens Utiles
- [Lien 1]
- [Lien 2]

### ✅ Critères d'Acceptation
- [ ] [Critère 1]
- [ ] [Critère 2]
- [ ] [Critère 3]

### ❌ Hors Scope
- [Ce qui n'est pas inclus]
```

---

## 🐛 Template pour Bug

```markdown
## 🐛 [Titre : problème en 5 mots]

### 🎯 Besoin Produit
[1 phrase : impact du bug]

### 👥 Besoin Utilisateur
[1 phrase : qui est bloqué]

### 📋 À Développer
[2 phrases : description du bug et de la correction attendue]

### 🔗 Dépendances
- [ ] [Prérequis si applicable]

### 🛠️ Spécifications Techniques
- **Composant concerné :** [Nom]
- **Technos :** [Liste]

### 🎨 Maquettes
[Si applicable : capture d'écran du bug]

### 🔗 Liens Utiles
- [Lien vers logs/erreurs]
- [Lien vers discussion]

### ✅ Critères d'Acceptation
- [ ] [Comportement attendu après fix]
- [ ] [Test pour reproduire le bug]

### ❌ Hors Scope
- [Ce qui ne sera pas corrigé dans cette issue]
```

---

## 🔄 Template pour Itération

```markdown
## 🔄 [Titre : itération sur X]

### 🎯 Besoin Produit
[1 phrase : pourquoi cette itération ?]

### 👥 Besoin Utilisateur
[1 phrase : quel gain pour l'utilisateur]

### 📋 À Développer
[2-3 phrases : ce qui change]

### 🔗 Dépendances
- [ ] [Feature initiale #X doit être livrée]

### 🛠️ Spécifications Techniques
- **Modifications :** [Liste des changements techniques]
- **Technos :** [Déjà présentes]

### 🎨 Maquettes
[Lien ou description des changements visuels]

### 🔗 Liens Utiles
- [Lien vers la feature initiale]

### ✅ Critères d'Acceptation
- [ ] [Critère 1]
- [ ] [Critère 2]

### ❌ Hors Scope
- [Ce qui reste hors scope]
```

---

## 🏗️ Template pour Refactoring

```markdown
## 🔄 [Titre : ce qui est refactoré]

### 🎯 Besoin Produit
[1 phrase : pourquoi ce refactoring ?]

### 👥 Besoin Utilisateur
[1 phrase : impact indirect]

### 📋 À Développer
[2 phrases : ce qui change concrètement]

### 🔗 Dépendances
- [ ] [Aucune ou prérequis]

### 🛠️ Spécifications Techniques
- **Fichiers concernés :** [Liste]
- **Technos :** [Déjà présentes]

### 🔗 Liens Utiles
- [Lien vers le code actuel]

### ✅ Critères d'Acceptation
- [ ] [Fonctionnalité X toujours fonctionnelle]
- [ ] [Code plus maintenable]
- [ ] [Tous les tests passent]

### ❌ Hors Scope
- [Nouvelles fonctionnalités]
```

---

## 💡 Exemple Complet

```markdown
## Bouton Like

### 🎯 Besoin Produit
Permettre aux utilisateurs d'exprimer leur appréciation.

### 👥 Besoin Utilisateur
Les utilisateurs connectés veulent liker un contenu en un clic.

### 📋 À Développer
Ajouter un bouton "👍" sur chaque contenu. Au clic, incrémenter un compteur en base.

### 🔗 Dépendances
- [ ] Authentification utilisateur doit être fonctionnelle (issue #42)

### 🛠️ Spécifications Techniques
- **Frontend :** React, CSS vanilla (déjà présentes)
- **Backend :** Node.js + Express (déjà présents)
- **Base :** PostgreSQL (déjà présente)
- **À valider :** Utiliser fetch() ou ajouter Axios ?

### 🎨 Maquettes
[Lien Figma : https://figma.com/...]

### 🔗 Liens Utiles
- [Design System : https://...]

### ✅ Critères d'Acceptation
- [ ] Bouton visible sur chaque contenu
- [ ] Compteur affiché à côté du bouton
- [ ] Clic incrémente le compteur

### ❌ Hors Scope
- Pas de dislike
- Pas de liste des likers
```

---

## 📌 Règles
1. Titre : 5 mots max
2. Besoins : 1 phrase chacun
3. À Développer : 2-3 phrases non-techniques
4. Dépendances : Prérequis
5. Spécifications Techniques : Technos existantes + questions pour les ajouts
6. Maquettes : Lien ou description visuelle
7. Liens Utiles : Max 3 liens
8. Critères d'Acceptation : Max 5, testables
9. Hors Scope : Toujours présent