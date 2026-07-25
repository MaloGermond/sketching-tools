// Warmup sketch - Échauffement avant dessin
// Recopier les formes affichées et obtenir un score

// ============================================
// 1. GLOBAL VARIABLES
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

// Paramètres des formes disponibles (toutes activées par défaut)
let shapeSettings = {
  circle: true,
  square: true,
  triangle: true,
  line: true
};


// ============================================
// 2. INITIALISATION
// ============================================

function setup() {
  let canvas = createCanvas(600, 400);
  canvas.parent('sketch-container');
  background(255);
  stroke(0);
  strokeWeight(3);
  strokeCap(ROUND);
  strokeJoin(ROUND);
  currentShape = null; // Pas de forme active au démarrage
  // La première forme sera générée dans ensureActiveShape() lors du premier draw()
}


// ============================================
// 3. MAIN LOOP
// ============================================

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
  
  // Affichage
  renderCurrentStroke();
  renderActiveShape();
}

// --- Étape 1 : Garantir qu'une forme est active ---
function ensureActiveShape() {
  if (currentShape == null) {
    currentShape = generateNewShape();
    guideVisible = true;
  }
}

// --- Étape 2-4 : Gérer le dessin utilisateur ---
function handleUserDrawing() {
  // Début du dessin
  if (!drawing) {
    guideVisible = false;
    userPoints = [];
    drawing = true;
  }
  
  // Collecte des points (Étape 3)
  userPoints.push({x: mouseX, y: mouseY});
}

// --- Étape 5 : Traiter le dessin terminé ---
function processCompletedDrawing() {
  if (drawing && userPoints.length > 0) {
    drawing = false;
    const score = calculateScore();
    currentScore = score;
    scoreHistory.push(score);
    if (scoreHistory.length > 100) {
      scoreHistory.shift();
    }
    updateScoreDisplay();
    showTemporaryScore();
    
    // Réinitialiser pour le prochain dessin
    setTimeout(() => {
      userPoints = [];
      clear();
      guideVisible = true;
      currentShape = generateNewShape();
      redraw();
    }, 100);
  }
}

// --- Affichage : Forme active (guide) ---
function renderActiveShape() {
  if (guideVisible && !drawing && currentShape != null) {
    drawGuideShape();
  }
}

// --- Affichage : Tracé en cours ---
function renderCurrentStroke() {
  if (drawing && userPoints.length >= 2) {
    noFill();
    beginShape();
    curveVertex(userPoints[0].x, userPoints[0].y);
    for (let i = 0; i < userPoints.length; i++) {
      curveVertex(userPoints[i].x, userPoints[i].y);
    }
    curveVertex(userPoints[userPoints.length - 1].x, userPoints[userPoints.length - 1].y);
    endShape();
  }
}

// Générer une nouvelle forme aléatoire en tenant compte des settings et du niveau
// @param {number} level - Niveau de difficulté (1-10), utilise currentLevel si non fourni
// @param {Object} settings - Paramètres des formes (ex: {circle: true, square: false}), utilise shapeSettings si non fourni
function generateNewShape(level = currentLevel, settings = shapeSettings) {
  // Filtrer les formes activées dans les settings
  const availableShapes = Object.keys(settings).filter(shape => settings[shape]);
  
  // Si aucune forme n'est activée, activer toutes par défaut
  if (availableShapes.length === 0) {
    availableShapes.push('circle', 'square', 'triangle', 'line');
  }
  
  // Choisir une forme aléatoire parmi celles disponibles
  selectedShape = random(availableShapes);
  currentLevel = level;
  generateShapeParams();
  return selectedShape;
}

// Configurer quelles formes sont disponibles
// @param {Object} settings - Objet avec les formes comme clés et boolean comme valeur
function setShapeSettings(settings) {
  shapeSettings = { ...shapeSettings, ...settings };
}


// ============================================
// 4. END OF DRAWING
// ============================================
// La logique de fin de dessin est maintenant dans processCompletedDrawing()
// qui est appelée dans la boucle draw()


// ============================================
// 5. SHAPE GENERATION
// ============================================

// Générer les paramètres de la forme actuelle
function generateShapeParams() {
  shapeParams = getShapeParams();
}

// Générer les paramètres de la forme selon le niveau
function getShapeParams() {
  const baseSize = min(width, height) * 0.6;
  
  switch(selectedShape) {
    case 'line':
      switch(currentLevel) {
        case 1: return { type: 'horizontal', x1: width * 0.2, y1: height/2, x2: width * 0.8, y2: height/2, size: baseSize };
        case 2: return { type: 'horizontal', x1: width * 0.2, y1: height/2, x2: width * 0.8, y2: height/2, size: random(0.4, 0.8) * width };
        case 3: return { type: 'horizontal', x1: random(width * 0.2, width * 0.8), y1: random(height * 0.2, height * 0.8), x2: random(width * 0.2, width * 0.8), y2: random(height * 0.2, height * 0.8), size: baseSize };
        case 4: return { type: 'vertical', x1: width/2, y1: height * 0.2, x2: width/2, y2: height * 0.8, size: baseSize };
        case 5: return { type: 'vertical', x1: width/2, y1: height * 0.2, x2: width/2, y2: height * 0.8, size: random(0.4, 0.8) * height };
        case 6: return { type: 'vertical', x1: random(width * 0.2, width * 0.8), y1: random(height * 0.2, height * 0.8), x2: random(width * 0.2, width * 0.8), y2: random(height * 0.2, height * 0.8), size: baseSize };
        case 7: return { type: 'diagonal', angle: 45, x1: width * 0.2, y1: height * 0.8, x2: width * 0.8, y2: height * 0.2, size: baseSize };
        case 8: return { type: 'diagonal', angle: 45, x1: width * 0.2, y1: height * 0.8, x2: width * 0.8, y2: height * 0.2, size: random(0.4, 0.8) * width };
        case 9: return { type: 'diagonal', angle: 135, x1: width * 0.2, y1: height * 0.2, x2: width * 0.8, y2: height * 0.8, size: baseSize };
        case 10: return { type: 'random', angle: random(0, 180), size: baseSize };
        default: return { type: 'horizontal', x1: width * 0.2, y1: height/2, x2: width * 0.8, y2: height/2, size: baseSize };
      }
    
    case 'circle':
      switch(currentLevel) {
        case 1: return { type: 'circle', cx: width/2, cy: height/2, size: baseSize };
        case 2: return { type: 'circle', cx: width/2, cy: height/2, size: random(0.4, 0.8) * baseSize };
        case 3: return { type: 'circle', cx: random(width * 0.2, width * 0.8), cy: random(height * 0.2, height * 0.8), size: baseSize };
        case 4: return { type: 'circle', cx: random(width * 0.2, width * 0.8), cy: random(height * 0.2, height * 0.8), size: random(0.4, 0.8) * baseSize };
        case 5: return { type: 'ellipse', cx: width/2, cy: height/2, w: baseSize, h: baseSize * 0.6 };
        case 6: return { type: 'ellipse', cx: width/2, cy: height/2, w: random(0.4, 0.8) * baseSize, h: random(0.4, 0.8) * baseSize * 0.6 };
        case 7: return { type: 'ellipse', cx: random(width * 0.2, width * 0.8), cy: random(height * 0.2, height * 0.8), w: baseSize, h: baseSize * 0.6 };
        default: return { type: 'circle', cx: width/2, cy: height/2, size: baseSize };
      }
    
    case 'square':
      switch(currentLevel) {
        case 1: return { type: 'square', cx: width/2, cy: height/2, size: baseSize, angle: 0 };
        case 2: return { type: 'square', cx: width/2, cy: height/2, size: random(0.4, 0.8) * baseSize, angle: 0 };
        case 3: return { type: 'square', cx: random(width * 0.2, width * 0.8), cy: random(height * 0.2, height * 0.8), size: baseSize, angle: 0 };
        case 4: return { type: 'square', cx: random(width * 0.2, width * 0.8), cy: random(height * 0.2, height * 0.8), size: random(0.4, 0.8) * baseSize, angle: 0 };
        case 5: return { type: 'square', cx: width/2, cy: height/2, size: baseSize, angle: 45 };
        case 6: return { type: 'square', cx: width/2, cy: height/2, size: random(0.4, 0.8) * baseSize, angle: 45 };
        case 7: return { type: 'square', cx: random(width * 0.2, width * 0.8), cy: random(height * 0.2, height * 0.8), size: baseSize, angle: 45 };
        default: return { type: 'square', cx: width/2, cy: height/2, size: baseSize, angle: 0 };
      }
    
    case 'triangle':
      switch(currentLevel) {
        case 1: case 2: case 3:
          return { type: 'equilateral', cx: width/2, cy: height/2, size: baseSize * (currentLevel === 2 ? random(0.4, 0.8) : 0.8) };
        case 4: case 5: case 6:
          return { type: 'isosceles', cx: width/2, cy: height/2, size: baseSize * 0.8, baseRatio: 0.7 };
        case 7: case 8:
          return { type: 'scalene', cx: width/2, cy: height/2, size: baseSize * 0.8 };
        default:
          return { type: 'equilateral', cx: width/2, cy: height/2, size: baseSize * 0.8 };
      }
    
    default:
      return { type: 'circle', cx: width/2, cy: height/2, size: baseSize };
  }
}


// ============================================
// 6. DISPLAY
// ============================================

// Dessiner la forme guide en gris clair
function drawGuideShape() {
  // Utiliser les paramètres déjà générés
  const params = shapeParams;
  
  push();
  stroke(200);
  noFill();
  strokeWeight(2);
  
  switch(selectedShape) {
    case 'line':
      line(params.x1, params.y1, params.x2, params.y2);
      break;
    
    case 'circle':
    case 'ellipse':
      if (params.type === 'circle') {
        ellipse(params.cx, params.cy, params.size, params.size);
      } else {
        ellipse(params.cx, params.cy, params.w, params.h);
      }
      break;
    
    case 'square':
      push();
      translate(params.cx, params.cy);
      if (params.angle) {
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

// Calculer le score (0-100) avec tolérance selon le niveau
function calculateScore() {
  if (userPoints.length === 0) return 0;
  
  const params = shapeParams;
  const tolerance = map(currentLevel, 1, 10, 0.3, 0.05); // Plus le niveau est élevé, moins la tolérance est grande
  
  let totalDistance = 0;
  let scoringAvgError = 0;
  
  switch(selectedShape) {
    case 'line': {
      const lineY = params.y1; // La ligne peut être à n'importe quelle position
      for (let p of userPoints) {
        totalDistance += abs(p.y - lineY);
      }
      scoringAvgError = totalDistance / userPoints.length;
      return max(0, 100 - (scoringAvgError / (height * 0.2) * 100) * tolerance);
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
      return max(0, 100 - (scoringAvgError / radius * 100) * tolerance);
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
      return max(0, 100 - (scoringAvgError / (halfSize) * 100) * tolerance);
    }
    
    case 'triangle': {
      // Calculer les sommets du triangle basé sur params
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
      return max(0, 100 - (scoringAvgError / (size/2) * 100) * tolerance);
    }
  }
  
  return 0;
}

// Distance d'un point à une ligne (segment)
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

// Changer la forme
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

// Changer le niveau de difficulté (1-10)
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

// Mettre à jour l'affichage du score dans le DOM
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
