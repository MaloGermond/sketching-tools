// Warmup sketch - Échauffement avant dessin
// Recopier les formes affichées et obtenir un score

// ============================================
// 1. GLOBAL VARIABLES (State)
// ============================================

let drawing = false;
let currentShape = null; // Forme active actuellement (null = aucune)
let selectedShape = 'circle';
let currentLevel = 1; // Niveau de difficulté (1-10)
let userPoints = []; // Stocke les points du dessin utilisateur
let scoreHistory = []; // Historique des scores de la session
let shapeParams = {}; // Paramètres de la forme actuelle (pour recalcul)
let guideVisible = true; // La forme guide est-elle visible ?
let currentScore = null;
let scoreTimeout = null;
let canvasElement;

// Configuration des formes disponibles (cercle sélectionné par défaut)
// @note: Cette variable est modifiée par setShapeSettings() - fonction impure
let shapeSettings = {
  circle: true,
  ellipse: false,
  square: false,
  triangle: false,
  'horizontal-line': false,
  'vertical-line': false
};

// ============================================
// RULE: All new functions should be pure by default.
// A pure function:
//   - Has no side effects (doesn't modify external state)
//   - Returns the same output for the same inputs
//   - Only depends on its parameters
// Impure functions must be clearly documented with @impure
// ============================================


// ============================================
// 2. INITIALISATION
// ============================================



/** @impure - Modifies global state and uses p5.js APIs */
function setup() {
  canvasElement = createCanvas(windowWidth, windowHeight);
  background(255);
  stroke(0);
  strokeWeight(3);
  strokeCap(ROUND);
  strokeJoin(ROUND);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (currentShape !== null) {
    generateShapeParams();
    redraw();
  }
}


// ============================================
// 3. MAIN LOOP
// ============================================

/** @impure - Modifies global state and uses p5.js APIs */
function draw() {
  // Étape 1 : Sélectionner une forme si aucune n'est active
  ensureActiveShape();
  
  // Étape 2 : Attendre une interaction utilisateur
  if (mouseIsPressed) {
    handleUserDrawing();
  } else {
    // Étape 5 : Si pas d'interaction, vérifier si on a des points à traiter
    processCompletedDrawing();
  }
  
  // Affichage - dessiner la forme guide d'abord, puis le tracé utilisateur par-dessus
  renderActiveShape();
  renderCurrentStroke();
}

// ============================================
// PURE FUNCTIONS (No side effects, same input -> same output)
// ============================================

/**
 * Retourne la liste des formes activées selon les settings
 * @pure
 * @param {Object} settings - Objet avec les formes comme clés et boolean comme valeur
 * @returns {Array} Tableau des noms de formes activées
 */
function getAvailableShapes(settings) {
  const availableShapes = Object.keys(settings).filter(shape => settings[shape]);
  
  // Si aucune forme n'est activée, retourner toutes les formes par défaut
  if (availableShapes.length === 0) {
    return ['circle', 'square', 'triangle', 'horizontal-line', 'vertical-line'];
  }
  
  return availableShapes;
}

// ============================================
// IMPURE FUNCTIONS (Documented with @impure)
// ============================================

/** @impure - Modifies currentShape, guideVisible */
function ensureActiveShape() {
  if (currentShape == null) {
    currentShape = generateNewShape();
    guideVisible = true;
  }
}

/**
 * Minimum distance between consecutive points to avoid loops in splines
 */
const MIN_POINT_DISTANCE = 3;

/** @impure - Modifies drawing, guideVisible, userPoints. Uses mouseIsPressed, mouseX, mouseY */
function handleUserDrawing() {
  // Début du dessin
  if (!drawing) {
    guideVisible = false;
    userPoints = [];
    drawing = true;
  }
  
  // Collecte des points (Étape 3)
  // Filtrer les points trop proches pour éviter les boucles avec curveVertex
  if (userPoints.length === 0 || 
      dist(mouseX, mouseY, userPoints[userPoints.length - 1].x, userPoints[userPoints.length - 1].y) >= MIN_POINT_DISTANCE) {
    userPoints.push({x: mouseX, y: mouseY});
  }
}

/** @impure - Modifies drawing, currentScore, scoreHistory. Uses setTimeout, clear, redraw */
function processCompletedDrawing() {
  if (drawing && userPoints.length > 0) {
    drawing = false;
    guideVisible = true;
    
    // Vérifier si le tracé est valide (assez de points et assez long)
    if (userPoints.length < MIN_POINTS_FOR_SCORE) {
      // Pas assez de points, réinitialiser sans scorer
      userPoints = [];
      clear();
      redraw();
      return;
    }
    
    // Vérifier la longueur du tracé
    let traceLength = 0;
    for (let i = 1; i < userPoints.length; i++) {
      traceLength += dist(userPoints[i].x, userPoints[i].y, userPoints[i-1].x, userPoints[i-1].y);
    }
    if (traceLength < MIN_TRACE_LENGTH) {
      // Tracé trop court, réinitialiser sans scorer
      userPoints = [];
      clear();
      redraw();
      return;
    }
    
    const score = calculateScore();
    currentScore = score;
    scoreHistory.push(score);
    if (scoreHistory.length > 20) {
      scoreHistory.shift();
    }
    updateScoreDisplay();
    showTemporaryScore();
    
    // Réinitialiser pour le prochain dessin
    setTimeout(() => {
      userPoints = [];
      clear();
      currentShape = generateNewShape();
      redraw();
    }, 100);
  }
}

/** @impure - Uses p5.js drawing functions */
function renderActiveShape() {
  if (guideVisible && !drawing && currentShape != null) {
    drawGuideShape();
  }
}

/** @impure - Uses p5.js drawing functions */
function renderCurrentStroke() {
  // Dessiner le tracé tant qu'il y a des points (même après avoir relâché la souris)
  if (userPoints.length >= 2) {
    noFill();
    beginShape();
    // Pour les splines avec curveVertex, il faut répéter le premier et dernier point
    curveVertex(userPoints[0].x, userPoints[0].y);
    for (let i = 0; i < userPoints.length; i++) {
      curveVertex(userPoints[i].x, userPoints[i].y);
    }
    curveVertex(userPoints[userPoints.length - 1].x, userPoints[userPoints.length - 1].y);
    endShape();
  }
}

/**
 * Génère une nouvelle forme aléatoire en tenant compte des settings et du niveau
 * @impure - Modifies selectedShape, currentLevel, shapeParams. Uses random()
 * @param {number} level - Niveau de difficulté (1-10), utilise currentLevel si non fourni
 * @param {Object} settings - Paramètres des formes, utilise shapeSettings si non fourni
 * @returns {string} Le nom de la forme sélectionnée
 */
function generateNewShape(level = currentLevel, settings = shapeSettings) {
  const availableShapes = getAvailableShapes(settings);
  // Fallback si aucune forme disponible
  if (availableShapes.length === 0) {
    availableShapes.push('circle', 'square', 'triangle', 'horizontal-line', 'vertical-line');
  }
  selectedShape = random(availableShapes);
  currentLevel = level;
  generateShapeParams();
  return selectedShape;
}

/**
 * Configurer quelles formes sont disponibles
 * @impure - Modifies shapeSettings
 * @param {Object} settings - Objet avec les formes comme clés et boolean comme valeur
 */
function setShapeSettings(settings) {
  shapeSettings = { ...shapeSettings, ...settings };
}

/**
 * Activer/désactiver une forme
 * @impure - Modifies shapeSettings and DOM
 * @param {string} shape - Nom de la forme à toggler
 */
function toggleShape(shape) {
  shapeSettings[shape] = !shapeSettings[shape];
  // Réinitialiser et générer une nouvelle forme immédiatement
  drawing = false;
  currentShape = null;
  clear();
  userPoints = [];
  guideVisible = true;
  currentScore = null;
  scoreHistory = [];
  currentShape = generateNewShape();
  updateScoreDisplay();
  redraw();
}

/**
 * Initialiser les checkboxes de l'interface selon shapeSettings
 * @impure - Modifies DOM
 */
function initShapeCheckboxes() {
  const shapes = ['circle', 'square', 'triangle', 'horizontal-line', 'vertical-line'];
  shapes.forEach(shape => {
    const checkbox = document.getElementById(`shape-${shape}`);
    if (checkbox) {
      checkbox.checked = shapeSettings[shape] || false;
    }
  });
}


// ============================================
// 4. END OF DRAWING
// ============================================
// La logique de fin de dessin est maintenant dans processCompletedDrawing()
// qui est appelée dans la boucle draw()


// ============================================
// 5. SHAPE GENERATION
// ============================================

/** @impure - Modifies shapeParams, uses global selectedShape and currentLevel */
function generateShapeParams() {
  shapeParams = getShapeParams();
}

// ============================================
// PURE FUNCTIONS for shape parameter generation
// Note: These use random() so they are not purely pure,
// but they have no side effects and only depend on parameters
// ============================================

/**
 * Calculate base size for shape parameters
 * @pure
 * @param {number} w - Canvas width
 * @param {number} h - Canvas height
 * @returns {number} Base size
 */
function calculateBaseSize(w, h) {
  return min(w, h) * 0.6;
}

/**
 * Calculate safe size for rotated shapes to stay within canvas
 * @pure
 * @param {number} w - Canvas width
 * @param {number} h - Canvas height
 * @param {number} angle - Rotation angle in degrees
 * @returns {number} Safe size that fits when rotated
 */
function calculateSafeSize(w, h, angle) {
  // For rotated shapes, the bounding box increases
  // The maximum dimension after rotation is size * (|cos(a)| + |sin(a)|)
  // We need this to be <= min(w, h) * 0.8 (with margin)
  const maxDimension = min(w, h) * 0.8;
  const rotationFactor = abs(cos(radians(angle))) + abs(sin(radians(angle)));
  return maxDimension / rotationFactor;
}

/**
 * Clamp value between min and max
 * @pure
 * @param {number} value
 * @param {number} minVal
 * @param {number} maxVal
 * @returns {number}
 */
function clamp(value, minVal, maxVal) {
  return max(minVal, min(maxVal, value));
}

/**
 * Calculate safe position range for a shape to stay within canvas
 * @pure
 * @param {number} w - Canvas width
 * @param {number} h - Canvas height
 * @param {number} size - Shape size (width for ellipses, size for squares/circles)
 * @param {number} angle - Rotation angle in degrees
 * @returns {Object} Min and max safe positions { minX, maxX, minY, maxY }
 */
function getSafePositionRange(w, h, size, angle) {
  // Calculate the margin needed to keep the shape within canvas
  // For rotated shapes, margin = size * (|cos(a)| + |sin(a)|) / 2
  const rotationFactor = abs(cos(radians(angle))) + abs(sin(radians(angle)));
  const margin = size * rotationFactor / 2;
  
  return {
    minX: margin,
    maxX: w - margin,
    minY: margin,
    maxY: h - margin
  };
}

/**
 * Get horizontal line parameters - Normalized to 4 levels
 * @impure - Uses random()
 * @param {number} level - Difficulty level (1-4)
 * @param {number} w - Canvas width
 * @param {number} h - Canvas height
 * @returns {Object} Shape parameters
 */
function getHorizontalLineParams(level, w, h) {
  if (level === 1) {
    // Centre, taille fixe
    return { type: 'horizontal-line', x1: w * 0.2, y1: h/2, x2: w * 0.8, y2: h/2, angle: 0 };
  }
  if (level === 2) {
    // Déplacement
    return { 
      type: 'horizontal-line', 
      x1: w * 0.2, 
      y1: clamp(random(h * 0.2, h * 0.8), 0, h),
      x2: w * 0.8, 
      y2: clamp(random(h * 0.2, h * 0.8), 0, h),
      angle: 0
    };
  }
  if (level === 3) {
    // Déplacement + taille variable
    return { 
      type: 'horizontal-line', 
      x1: clamp(random(w * 0.2, w * 0.8), 0, w),
      y1: clamp(random(h * 0.2, h * 0.8), 0, h),
      x2: clamp(random(w * 0.2, w * 0.8), 0, w),
      y2: clamp(random(h * 0.2, h * 0.8), 0, h),
      angle: 0
    };
  }
  // Niveau 4: Déplacement + taille + rotation (ligne diagonale)
  const angle = random(0, 180);
  const length = random(0.4, 0.8) * min(w, h);
  const cx = random(w * 0.2, w * 0.8);
  const cy = random(h * 0.2, h * 0.8);
  const x1 = cx - length * cos(radians(angle)) / 2;
  const y1 = cy - length * sin(radians(angle)) / 2;
  const x2 = cx + length * cos(radians(angle)) / 2;
  const y2 = cy + length * sin(radians(angle)) / 2;
  return { type: 'horizontal-line', x1: clamp(x1, 0, w), y1: clamp(y1, 0, h), x2: clamp(x2, 0, w), y2: clamp(y2, 0, h), angle: angle };
}

/**
 * Get vertical line parameters - Normalized to 4 levels
 * @impure - Uses random()
 * @param {number} level - Difficulty level (1-4)
 * @param {number} w - Canvas width
 * @param {number} h - Canvas height
 * @returns {Object} Shape parameters
 */
function getVerticalLineParams(level, w, h) {
  if (level === 1) {
    // Centre, taille fixe
    return { type: 'vertical-line', x1: w/2, y1: h * 0.2, x2: w/2, y2: h * 0.8, angle: 0 };
  }
  if (level === 2) {
    // Déplacement
    return { 
      type: 'vertical-line', 
      x1: clamp(random(w * 0.2, w * 0.8), 0, w),
      y1: h * 0.2, 
      x2: clamp(random(w * 0.2, w * 0.8), 0, w),
      y2: h * 0.8,
      angle: 0
    };
  }
  if (level === 3) {
    // Déplacement + taille variable
    return { 
      type: 'vertical-line', 
      x1: clamp(random(w * 0.2, w * 0.8), 0, w),
      y1: clamp(random(h * 0.2, h * 0.8), 0, h),
      x2: clamp(random(w * 0.2, w * 0.8), 0, w),
      y2: clamp(random(h * 0.2, h * 0.8), 0, h),
      angle: 0
    };
  }
  // Niveau 4: Déplacement + taille + rotation (ligne diagonale)
  const angle = random(0, 180);
  const length = random(0.4, 0.8) * min(w, h);
  const cx = random(w * 0.2, w * 0.8);
  const cy = random(h * 0.2, h * 0.8);
  const x1 = cx - length * cos(radians(angle)) / 2;
  const y1 = cy - length * sin(radians(angle)) / 2;
  const x2 = cx + length * cos(radians(angle)) / 2;
  const y2 = cy + length * sin(radians(angle)) / 2;
  return { type: 'vertical-line', x1: clamp(x1, 0, w), y1: clamp(y1, 0, h), x2: clamp(x2, 0, w), y2: clamp(y2, 0, h), angle: angle };
}

/**
 * Get circle parameters - Normalized to 4 levels
 * @impure - Uses random()
 * @param {number} level - Difficulty level (1-4)
 * @param {number} w - Canvas width
 * @param {number} h - Canvas height
 * @returns {Object} Shape parameters
 */
function getCircleParams(level, w, h) {
  const MARGIN = 10;
  const baseSize = calculateBaseSize(w, h);
  
  if (level === 1) {
    // Centre, taille fixe
    return { type: 'circle', cx: w/2, cy: h/2, size: baseSize, angle: 0 };
  }
  if (level === 2) {
    // Déplacement - cercle toujours dans le canvas avec marge de 10px
    const size = baseSize;
    const minPos = size/2 + MARGIN;
    const maxPosX = w - size/2 - MARGIN;
    const maxPosY = h - size/2 - MARGIN;
    return { 
      type: 'circle', 
      cx: random(minPos, maxPosX), 
      cy: random(minPos, maxPosY), 
      size: size, 
      angle: 0 
    };
  }
  if (level === 3) {
    // Déplacement + taille variable
    const size = random(0.4, 0.8) * baseSize;
    const minPos = size/2 + MARGIN;
    const maxPosX = w - size/2 - MARGIN;
    const maxPosY = h - size/2 - MARGIN;
    return { 
      type: 'circle', 
      cx: random(minPos, maxPosX), 
      cy: random(minPos, maxPosY), 
      size: size, 
      angle: 0 
    };
  }
  // Niveau 4: Déplacement + taille + rotation
  const angle = random(0, 180);
  const safeSize = calculateSafeSize(w, h, angle);
  const range = getSafePositionRange(w, h, safeSize, angle);
  return { type: 'circle', cx: random(range.minX, range.maxX), cy: random(range.minY, range.maxY), size: safeSize, angle: angle };
}

/**
 * Get square parameters - Normalized to 4 levels
 * @impure - Uses random()
 * @param {number} level - Difficulty level (1-4)
 * @param {number} w - Canvas width
 * @param {number} h - Canvas height
 * @returns {Object} Shape parameters
 */
function getSquareParams(level, w, h) {
  const MARGIN = 10;
  const baseSize = calculateBaseSize(w, h);
  
  if (level === 1) {
    // Centre, taille fixe
    return { type: 'square', cx: w/2, cy: h/2, size: baseSize, angle: 0 };
  }
  if (level === 2) {
    // Déplacement - carré toujours dans le canvas avec marge de 10px
    const size = baseSize;
    const halfSize = size / 2;
    const minPos = halfSize + MARGIN;
    const maxPosX = w - halfSize - MARGIN;
    const maxPosY = h - halfSize - MARGIN;
    return { 
      type: 'square', 
      cx: random(minPos, maxPosX), 
      cy: random(minPos, maxPosY), 
      size: size, 
      angle: 0 
    };
  }
  if (level === 3) {
    // Déplacement + taille variable
    const size = random(0.4, 0.8) * baseSize;
    const halfSize = size / 2;
    const minPos = halfSize + MARGIN;
    const maxPosX = w - halfSize - MARGIN;
    const maxPosY = h - halfSize - MARGIN;
    return { 
      type: 'square', 
      cx: random(minPos, maxPosX), 
      cy: random(minPos, maxPosY), 
      size: size, 
      angle: 0 
    };
  }
  // Niveau 4: Déplacement + taille + rotation
  const angle = random(0, 180);
  const safeSize = calculateSafeSize(w, h, angle);
  const range = getSafePositionRange(w, h, safeSize, angle);
  return { type: 'square', cx: random(range.minX, range.maxX), cy: random(range.minY, range.maxY), size: safeSize, angle: angle };
}

/**
 * Get triangle parameters - Normalized to 4 levels
 * @impure - Uses random()
 * @param {number} level - Difficulty level (1-4)
 * @param {number} w - Canvas width
 * @param {number} h - Canvas height
 * @returns {Object} Shape parameters
 */
function getTriangleParams(level, w, h) {
  const MARGIN = 10;
  const baseSize = calculateBaseSize(w, h);
  
  if (level === 1) {
    // Centre, taille fixe
    return { type: 'equilateral', cx: w/2, cy: h/2, size: baseSize, angle: 0 };
  }
  if (level === 2) {
    // Déplacement - triangle toujours dans le canvas avec marge de 10px
    const size = baseSize;
    // Pour un triangle équilatéral, le bounding box est environ size x (size * sqrt(3)/2)
    const triangleHeight = size * sqrt(3) / 2;
    const minPosX = size/2 + MARGIN;
    const maxPosX = w - size/2 - MARGIN;
    const minPosY = triangleHeight/2 + MARGIN;
    const maxPosY = h - triangleHeight/2 - MARGIN;
    return { 
      type: 'equilateral', 
      cx: random(minPosX, maxPosX), 
      cy: random(minPosY, maxPosY), 
      size: size, 
      angle: 0 
    };
  }
  if (level === 3) {
    // Déplacement + taille variable
    const size = random(0.4, 0.8) * baseSize;
    const triangleHeight = size * sqrt(3) / 2;
    const minPosX = size/2 + MARGIN;
    const maxPosX = w - size/2 - MARGIN;
    const minPosY = triangleHeight/2 + MARGIN;
    const maxPosY = h - triangleHeight/2 - MARGIN;
    return { 
      type: 'equilateral', 
      cx: random(minPosX, maxPosX), 
      cy: random(minPosY, maxPosY), 
      size: size, 
      angle: 0 
    };
  }
  // Niveau 4: Déplacement + taille + rotation
  const angle = random(0, 180);
  const safeSize = calculateSafeSize(w, h, angle) * 0.8;
  const range = getSafePositionRange(w, h, safeSize, angle);
  return { type: 'equilateral', cx: random(range.minX, range.maxX), cy: random(range.minY, range.maxY), size: safeSize, angle: angle };
}

/**
 * Get ellipse parameters - Normalized to 4 levels
 * @impure - Uses random()
 * @param {number} level - Difficulty level (1-4)
 * @param {number} w - Canvas width
 * @param {number} h - Canvas height
 * @returns {Object} Shape parameters
 */
function getEllipseParams(level, w, h) {
  const MARGIN = 10;
  const baseSize = calculateBaseSize(w, h);
  
  if (level === 1) {
    // Centre, taille fixe
    return { type: 'ellipse', cx: w/2, cy: h/2, w: baseSize, h: baseSize * 0.6, angle: 0 };
  }
  if (level === 2) {
    // Déplacement - ellipse toujours dans le canvas avec marge de 10px
    const ellipseW = baseSize;
    const ellipseH = baseSize * 0.6;
    const minPosX = ellipseW/2 + MARGIN;
    const maxPosX = w - ellipseW/2 - MARGIN;
    const minPosY = ellipseH/2 + MARGIN;
    const maxPosY = h - ellipseH/2 - MARGIN;
    return { 
      type: 'ellipse', 
      cx: random(minPosX, maxPosX), 
      cy: random(minPosY, maxPosY), 
      w: ellipseW, 
      h: ellipseH, 
      angle: 0 
    };
  }
  if (level === 3) {
    // Déplacement + taille variable
    const ellipseW = random(0.4, 0.8) * baseSize;
    const ellipseH = random(0.4, 0.8) * baseSize * 0.6;
    const minPosX = ellipseW/2 + MARGIN;
    const maxPosX = w - ellipseW/2 - MARGIN;
    const minPosY = ellipseH/2 + MARGIN;
    const maxPosY = h - ellipseH/2 - MARGIN;
    return { 
      type: 'ellipse', 
      cx: random(minPosX, maxPosX), 
      cy: random(minPosY, maxPosY), 
      w: ellipseW, 
      h: ellipseH, 
      angle: 0 
    };
  }
  // Niveau 4: Déplacement + taille + rotation
  const angle = random(0, 180);
  const safeSize = calculateSafeSize(w, h, angle);
  const range = getSafePositionRange(w, h, safeSize, angle);
  return { type: 'ellipse', cx: random(range.minX, range.maxX), cy: random(range.minY, range.maxY), w: safeSize, h: safeSize * 0.6, angle: angle };
}

/**
 * Génère les paramètres de la forme selon le niveau
 * @impure - Uses random(), depends on global selectedShape and currentLevel
 * @returns {Object} Paramètres de la forme
 */
function getShapeParams() {
  // Validation précoce
  if (!selectedShape || !currentLevel) {
    return { type: 'circle', cx: canvasElement.width/2, cy: canvasElement.height/2, size: min(canvasElement.width, canvasElement.height) * 0.6 };
  }
  
  // Dispatch vers les fonctions spécifiques
  switch(selectedShape) {
    case 'horizontal-line': return getHorizontalLineParams(currentLevel, canvasElement.width, canvasElement.height);
    case 'vertical-line': return getVerticalLineParams(currentLevel, canvasElement.width, canvasElement.height);
    case 'circle': return getCircleParams(currentLevel, canvasElement.width, canvasElement.height);
    case 'ellipse': return getEllipseParams(currentLevel, canvasElement.width, canvasElement.height);
    case 'square': return getSquareParams(currentLevel, canvasElement.width, canvasElement.height);
    case 'triangle': return getTriangleParams(currentLevel, canvasElement.width, canvasElement.height);
    default: return getCircleParams(1, canvasElement.width, canvasElement.height);
  }
}


// ============================================
// 6. DISPLAY
// ============================================

/** @impure - Uses p5.js drawing functions, depends on global shapeParams and selectedShape */
function drawGuideShape() {
  // Utiliser les paramètres déjà générés
  const params = shapeParams;
  
  push();
  stroke(200);
  noFill();
  strokeWeight(2);
  
  switch(selectedShape) {
    case 'horizontal-line':
    case 'vertical-line':
      line(params.x1, params.y1, params.x2, params.y2);
      break;
    
    case 'circle':
    case 'ellipse':
      push();
      translate(params.cx, params.cy);
      if (params.angle !== undefined) {
        rotate(radians(params.angle));
      }
      ellipseMode(CENTER);
      if (params.type === 'circle') {
        ellipse(0, 0, params.size, params.size);
      } else {
        ellipse(0, 0, params.w, params.h);
      }
      pop();
      break;
    
    case 'square':
      push();
      translate(params.cx, params.cy);
      if (params.angle !== undefined) {
        rotate(radians(params.angle));
      }
      rectMode(CENTER);
      rect(0, 0, params.size, params.size);
      pop();
      break;
    
    case 'triangle':
      const size = params.size;
      push();
      translate(params.cx, params.cy);
      if (params.angle !== undefined) {
        rotate(radians(params.angle));
      }
      if (params.type === 'equilateral') {
        const h = size * sqrt(3) / 2;
        triangle(0, -h/2, -size/2, h/2, size/2, h/2);
      } else if (params.type === 'isosceles') {
        const base = size;
        const h = size * (params.baseRatio || 0.7);
        triangle(0, -h/2, -base/2, h/2, base/2, h/2);
      } else { // scalene
        const a = size * 0.6;
        const b = size * 0.7;
        const c = size * 0.8;
        triangle(0, -c/2, -a/2, c/2, a/2, c/2);
      }
      pop();
      break;
  }
  pop();
}


// ============================================
// 7. SCORING
// ============================================

/**
 * Minimum number of points required for a valid score calculation
 */
const MIN_POINTS_FOR_SCORE = 10;

/**
 * Minimum total length of the trace (in pixels) for a valid score calculation
 */
const MIN_TRACE_LENGTH = 30;

/**
 * Normalization factor for score calculation (same for all shapes and levels)
 * Smaller value = stricter scoring
 */
const SCORE_NORMALIZATION_FACTOR = 0.045;

/**
 * Calculer le score (0-100) - Système unique pour toutes les formes
 * @pure - Does not modify state, but depends on global userPoints, shapeParams, canvasElement.width, canvasElement.height
 * @returns {number} Score entre 0 et 100
 */
function calculateScore() {
  // Validation précoce: besoin d'un minimum de points pour évaluer
  if (userPoints.length < MIN_POINTS_FOR_SCORE) {
    return 0;
  }
  
  const params = shapeParams;
  const canvasSize = min(canvasElement.width, canvasElement.height);
  
  let totalDistance = 0;
  let scoringAvgError = 0;
  
  switch(selectedShape) {
    case 'horizontal-line': {
      const lineY = params.y1;
      for (let p of userPoints) {
        totalDistance += abs(p.y - lineY);
      }
      scoringAvgError = totalDistance / userPoints.length;
      break;
    }
    
    case 'vertical-line': {
      const lineX = params.x1;
      for (let p of userPoints) {
        totalDistance += abs(p.x - lineX);
      }
      scoringAvgError = totalDistance / userPoints.length;
      break;
    }
    
    case 'circle':
    case 'ellipse': {
      const cx = params.cx;
      const cy = params.cy;
      const radius = params.type === 'circle' ? params.size / 2 : max(params.w, params.h) / 2;
      for (let p of userPoints) {
        const d = dist(p.x, p.y, cx, cy);
        totalDistance += abs(d - radius);
      }
      scoringAvgError = totalDistance / userPoints.length;
      break;
    }
    
    case 'square': {
      const halfSize = params.size / 2;
      const left = params.cx - halfSize;
      const right = params.cx + halfSize;
      const top = params.cy - halfSize;
      const bottom = params.cy + halfSize;
      
      for (let p of userPoints) {
        const distToLeft = abs(p.x - left);
        const distToRight = abs(p.x - right);
        const distToTop = abs(p.y - top);
        const distToBottom = abs(p.y - bottom);
        const minDist = min(distToLeft, distToRight, distToTop, distToBottom);
        totalDistance += minDist;
      }
      scoringAvgError = totalDistance / userPoints.length;
      break;
    }
    
    case 'triangle': {
      let v1, v2, v3;
      const size = params.size;
      
      if (params.type === 'equilateral') {
        const h = size * sqrt(3) / 2;
        v1 = {x: params.cx, y: params.cy - h/2};
        v2 = {x: params.cx - size/2, y: params.cy + h/2};
        v3 = {x: params.cx + size/2, y: params.cy + h/2};
      } else if (params.type === 'isosceles') {
        const base = size;
        const h = size * (params.baseRatio || 0.7);
        v1 = {x: params.cx, y: params.cy - h/2};
        v2 = {x: params.cx - base/2, y: params.cy + h/2};
        v3 = {x: params.cx + base/2, y: params.cy + h/2};
      } else { // scalene
        const a = size * 0.6;
        const b = size * 0.7;
        const c = size * 0.8;
        v1 = {x: params.cx, y: params.cy - c/2};
        v2 = {x: params.cx - a/2, y: params.cy + c/2};
        v3 = {x: params.cx + a/2, y: params.cy + c/2};
      }
      
      for (let p of userPoints) {
        const d1 = pointToLineDistance(p, v1, v2);
        const d2 = pointToLineDistance(p, v2, v3);
        const d3 = pointToLineDistance(p, v3, v1);
        totalDistance += min(d1, d2, d3);
      }
      scoringAvgError = totalDistance / userPoints.length;
      break;
    }
  }
  
  // Système de scoring unique: normaliser par rapport à la taille du canvas
  const normalizedError = scoringAvgError / (canvasSize * SCORE_NORMALIZATION_FACTOR);
  return max(0, 100 - normalizedError * 100);
}

/**
 * Calcule la distance d'un point à une ligne (segment)
 * @pure - No side effects, only depends on parameters
 * @param {Object} point - Point avec x, y
 * @param {Object} lineStart - Point de début de la ligne
 * @param {Object} lineEnd - Point de fin de la ligne
 * @returns {number} Distance
 */
function pointToLineDistance(point, lineStart, lineEnd) {
  const x = point.x, y = point.y;
  const x1 = lineStart.x, y1 = lineStart.y;
  const x2 = lineEnd.x, y2 = lineEnd.y;
  
  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;
  
  const dot = A * C + B * D;
  const len_sq = C * C + D * D;
  let param = -1;
  if (len_sq !== 0) param = dot / len_sq;
  
  let xx, yy;
  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }
  
  const dx = x - xx;
  const dy = y - yy;
  return sqrt(dx * dx + dy * dy);
}


// ============================================
// 8. USER INTERACTIONS
// ============================================

/** @impure - Modifies multiple global state variables, uses p5.js clear() and redraw() */
function setShape(shape) {
  selectedShape = shape;
  currentShape = shape;
  clear();
  userPoints = [];
  currentScore = null;
  scoreHistory = [];
  guideVisible = true;
  generateShapeParams();
  updateScoreDisplay();
  redraw();
}

/** @impure - Modifies multiple global state variables, uses p5.js clear() and redraw() */
function setLevel(level) {
  currentLevel = parseInt(level);
  clear();
  userPoints = [];
  currentScore = null;
  scoreHistory = [];
  guideVisible = true;
  currentShape = generateNewShape();
  updateScoreDisplay();
  redraw();
}

/** @impure - Modifies DOM, depends on global scoreHistory and currentScore */
function updateScoreDisplay() {
  const scoreEl = document.getElementById('score-display');
  if (scoreEl) {
    let html = '';
    
    // Moyenne de tous les scores
    if (scoreHistory.length > 0) {
      const average = scoreHistory.reduce((sum, s) => sum + s, 0) / scoreHistory.length;
      html += `<div style="font-size: 20px; margin-bottom: 10px;">Moyenne: ${floor(average)}%</div>`;
    }
    
    // Historique des scores
    if (scoreHistory.length > 0) {
      html += '<div style="font-size: 14px;">';
      for (let i = 0; i < scoreHistory.length; i++) {
        const idx = scoreHistory.length - 1 - i;
        html += `<div>#${i+1}: ${floor(scoreHistory[idx])}%</div>`;
      }
      html += '</div>';
    }
    
    scoreEl.innerHTML = html;
  }
}

/** @impure - Modifies DOM, uses setTimeout */
// Afficher le score temporairement au centre
function showTemporaryScore() {
  const popupEl = document.getElementById('score-popup');
  if (popupEl) {
    // Effacer le timeout précédent s'il existe
    if (scoreTimeout) {
      clearTimeout(scoreTimeout);
    }
    
    popupEl.textContent = `${floor(currentScore)}%`;
    popupEl.style.opacity = '1';
    popupEl.style.color = currentScore >= 80 ? '#22c55e' : currentScore >= 50 ? '#f59e0b' : '#ef4444';
    
    // Faire disparaître après 2 secondes
    scoreTimeout = setTimeout(() => {
      popupEl.style.opacity = '0';
    }, 2000);
  }
}
