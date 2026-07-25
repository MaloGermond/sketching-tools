# Coding Rules for Sketching Tools Project

## Function Purity Rule

**All new functions must be pure by default.**

### Definition of a Pure Function
A pure function must satisfy ALL of the following:
1. **No side effects** - Does not modify any external state (globals, DOM, files, etc.)
2. **Deterministic** - Same input always produces the same output
3. **Dependent only on parameters** - Does not rely on global variables or external state

### When a Function CANNOT be Pure
Some functions must be impure due to framework requirements (p5.js, React, etc.).

**If a function is impure, it MUST:**
1. Be documented with `@impure` JSDoc tag
2. List all side effects in the documentation
3. List all external dependencies

### Example: Pure Function
```javascript
/**
 * @pure - No side effects, only depends on parameters
 * @param {Object} settings - Shape availability settings
 * @returns {Array} Array of enabled shape names
 */
function getAvailableShapes(settings) {
  const availableShapes = Object.keys(settings).filter(shape => settings[shape]);
  if (availableShapes.length === 0) {
    return ['circle', 'square', 'triangle', 'line'];
  }
  return availableShapes;
}
```

### Example: Impure Function
```javascript
/**
 * @impure - Modifies selectedShape, currentLevel, shapeParams. Uses random()
 * @param {number} level - Difficulty level
 * @param {Object} settings - Shape settings
 * @returns {string} Selected shape name
 */
function generateNewShape(level = currentLevel, settings = shapeSettings) {
  const availableShapes = getAvailableShapes(settings);
  selectedShape = random(availableShapes);  // Side effect: modifies global
  currentLevel = level;  // Side effect: modifies global
  generateShapeParams();  // Side effect: modifies global
  return selectedShape;
}
```

## Additional Rules

### 1. Prefer Small, Single-Responsibility Functions
- Each function should do ONE thing
- Functions should be short (ideally < 20 lines)
- Complex logic should be broken into smaller pure functions

### 2. Document All Functions
- Use JSDoc comments for all functions
- Document parameters, return types, and side effects
- Mark purity explicitly

### 3. Section Organization
- Group related functions together
- Use section comments: `// ===== SECTION NAME =====`
- Order: Pure functions first, then impure functions

### 4. Naming Conventions
- Use camelCase for functions
- Use descriptive names that reveal intent
- Prefix getters with `get` (e.g., `getAvailableShapes`)
- Prefix setters with `set` (e.g., `setShapeSettings`)
- Use verbs for actions (e.g., `calculateScore`, `renderShape`)

## Directory Structure

```
.vibe/
  rules.md          # This file - coding rules
  warmup/
    levels.md       # Warmup exercise difficulty levels
public/
  scripts/
    sketches/
      warmup.js     # Main sketch file
```
