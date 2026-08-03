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

## Core Rules

### 1. Pure Functions
**Every function must be deterministic (same inputs → same outputs).**

- **No external state dependencies** - No global variables, no modification of props/arguments
- **No side effects** - No DOM modification, no API calls, no logging, no state mutation
- **Only depends on parameters** - All data must come through function arguments

### 2. Early Input Validation
**Validate inputs at the start of functions.**

- Check for invalid values (`null`, `undefined`, empty arrays) immediately
- Return early with `return;` or a default value if validation fails
- Example:
  ```javascript
  if (!array || array.length === 0) return;
  if (!user || !user.id) return null;
  ```

### 3. Avoid Nested Conditions
**No `if` inside `if` (or `else if`/`switch` nesting).**

- Use **early returns** to flatten logic
- Use **logical operators** (`&&`, `||`) where appropriate
- Example to avoid:
  ```javascript
  if (condition1) {
    if (condition2) { ... } // ❌ Nested
  }
  ```
- Prefer:
  ```javascript
  if (!condition1) return;
  if (!condition2) return;
  // Main logic here
  ```

### 4. Avoid Nested Arrays
**No arrays inside arrays in chained operations.**

- Replace `array.map(item => item.subArray.map(...))` with explicit variables or dedicated functions
- Example to avoid:
  ```javascript
  const result = data.map(group => group.items.map(item => item.value)); // ❌ Nesting
  ```
- Prefer:
  ```javascript
  const extractValues = (items) => items.map(item => item.value);
  const result = data.map(group => extractValues(group.items));
  ```

### 5. Clarity and Readability
- Use **explicit names** (e.g., `isValidUser` instead of `check`)
- Use **descriptive variable names** that reveal intent
- Comments **only if necessary** - code should be self-documenting
- Prefer clear code over clever code

## Organization Rules

### 1. Single-Responsibility Functions
- Each function should do ONE thing
- Functions should be short (ideally < 20 lines)
- Complex logic should be broken into smaller pure functions

### 2. Documentation
- Use JSDoc comments for all functions
- Document parameters, return types, and side effects
- Mark purity explicitly with `@pure` or `@impure`

### 3. Section Organization
- Group related functions together
- Use section comments: `// ===== SECTION NAME =====`
- Order: Pure functions first, then impure functions

### 4. Naming Conventions
- Use camelCase for functions and variables
- Use descriptive names that reveal intent
- Prefix getters with `get` (e.g., `getAvailableShapes`)
- Prefix setters with `set` (e.g., `setShapeSettings`)
- Use verbs for actions (e.g., `calculateScore`, `renderShape`)

### 5. UI Components & Styling
- **Component-based styling** - Styles should live within their respective components using inline styles or scoped `<style>` tags
- **Global styles only for shared utilities** - Variables (colors, fonts, spacing) go in `src/styles/variables.css`
- **No external CSS frameworks without validation** - Do not add Tailwind, Bootstrap, etc. without explicit user approval
- Toast/notification components should be reusable with configurable duration and position

### 6. Cross-Component Communication
- **Use Custom Events for decoupled communication** - Components should communicate via `CustomEvent` rather than direct function calls
- **Event naming convention** - Use kebab-case for event names (e.g., `showToast`, `scoreUpdated`)
- **Event detail** - Pass data via `event.detail` object
- **Example:**
  ```javascript
  // Dispatch event
  document.dispatchEvent(new CustomEvent('showToast', {
    detail: { score: 95 }
  }));
  
  // Listen for event
  document.addEventListener('showToast', (e) => {
    const score = e.detail.score;
  });
  ```
- **P5.js integration** - When P5.js needs to communicate with Astro components, use custom events instead of setting `window` properties

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
