// Warmup sketch - Échauffement avant dessin
// Recopier les formes affichées et obtenir un score
// Version bitmap utilisant p5.Graphics buffer

// ============================================
// 1. GLOBAL VARIABLES (State)
// ============================================

let drawing = false;
let currentShape = null;
let selectedShape = 'circle';
let currentLevel = 1;
let scoreHistory = [];
let shapeParams = {};
let currentScore = null;
let scoreTimeout = null;
let canvasElement;

// Buffer de dessin bitmap
let drawingBuffer;

// Masque de la forme guide pour le scoring
let guideMask;

// Position précédente pour le dessin continu
let prevX = null;
let prevY = null;

// Configuration du pinceau
const BRUSH_SIZE = 3;
const BRUSH_SPACING = 2;

// Configuration des formes disponibles
let shapeSettings = {
  circle: true,
  ellipse: false,
  square: false,
  triangle: false,
  'horizontal-line': false,
  'vertical-line': false
};


// ============================================
// 2. INITIALISATION
// ============================================

function setup() {
  pixelDensity(1);
  canvasElement = createCanvas(windowWidth, windowHeight);
  
  drawingBuffer = createGraphics(width, height);
  drawingBuffer.noSmooth();
  
  background(255);
  stroke(0);
  strokeWeight(3);
  strokeCap(ROUND);
  strokeJoin(ROUND);
  
  frameRate(60);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  drawingBuffer = createGraphics(width, height);
  drawingBuffer.noSmooth();
  if (currentShape !== null) {
    generateShapeParams();
    redraw();
  }
}


// ============================================
// 3. MAIN LOOP
// ============================================

function draw() {
  background(255);
  
  ensureActiveShape();
  
  if (mouseIsPressed) {
    handleUserDrawing();
  } else {
    processCompletedDrawing();
  }
  
  renderActiveShape();
  image(drawingBuffer, 0, 0);
}


// ============================================
// PURE FUNCTIONS
// ============================================

function getAvailableShapes(settings) {
  const availableShapes = Object.keys(settings).filter(shape => settings[shape]);
  if (availableShapes.length === 0) {
    return ['circle', 'square', 'triangle', 'horizontal-line', 'vertical-line'];
  }
  return availableShapes;
}

function calculateBaseSize(w, h) {
  return min(w, h) * 0.6;
}

function calculateSafeSize(w, h, angle) {
  const maxDimension = min(w, h) * 0.8;
  const rotationFactor = abs(cos(radians(angle))) + abs(sin(radians(angle)));
  return maxDimension / rotationFactor;
}

function clamp(value, minVal, maxVal) {
  return max(minVal, min(maxVal, value));
}

function getSafePositionRange(w, h, size, angle) {
  const rotationFactor = abs(cos(radians(angle))) + abs(sin(radians(angle)));
  const margin = size * rotationFactor / 2;
  return {
    minX: margin,
    maxX: w - margin,
    minY: margin,
    maxY: h - margin
  };
}


// ============================================
// IMPURE FUNCTIONS
// ============================================

function ensureActiveShape() {
  if (currentShape == null) {
    currentShape = generateNewShape();
  }
}

function handleUserDrawing() {
  if (!drawing) {
    drawingBuffer.clear();
    drawing = true;
    prevX = mouseX;
    prevY = mouseY;
    return;
  }
  
  const d = dist(mouseX, mouseY, prevX, prevY);
  
  if (d >= BRUSH_SPACING) {
    const steps = floor(d / BRUSH_SPACING);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = lerp(prevX, mouseX, t);
      const y = lerp(prevY, mouseY, t);
      drawingBuffer.noStroke();
      drawingBuffer.fill(0);
      drawingBuffer.ellipse(x, y, BRUSH_SIZE, BRUSH_SIZE);
    }
    prevX = mouseX;
    prevY = mouseY;
  }
}

function processCompletedDrawing() {
  if (drawing) {
    drawing = false;
    
    const { onShape, offShape } = calculateScoreFromBuffer();
    const totalDrawn = onShape + offShape;
    let score = 0;
    if (totalDrawn > 0) {
      score = floor((onShape / totalDrawn) * 100);
    }
    
    currentScore = score;
    scoreHistory.push(score);
    if (scoreHistory.length > 20) {
      scoreHistory.shift();
    }
    updateScoreDisplay();
    showTemporaryScore();
    
    setTimeout(() => {
      drawingBuffer.clear();
      currentShape = generateNewShape();
      redraw();
    }, 100);
  }
}

function calculateScoreFromBuffer() {
  drawingBuffer.loadPixels();
  guideMask.loadPixels();
  
  let onShape = 0;
  let offShape = 0;
  
  const width = drawingBuffer.width;
  const height = drawingBuffer.height;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      
      // Si le pixel du dessin est noir (dessin présent)
      if (drawingBuffer.pixels[idx] < 128) {
        // Si le masque est blanc (sur la forme)
        if (guideMask.pixels[idx] > 128) {
          onShape++;
        } else {
          offShape++;
        }
      }
    }
  }
  
  return { onShape, offShape };
}

function renderActiveShape() {
  if (currentShape != null) {
    drawGuideShape();
  }
}

function drawGuideShape() {
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
      } else {
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
// SHAPE GENERATION
// ============================================

function generateShapeParams() {
  shapeParams = getShapeParams();
  createGuideMask();
}

/**
 * Crée un masque de la forme guide pour le scoring pixel-perfect
 * Fond noir (0), forme remplie en blanc (255)
 * @impure - Uses guideMask, depends on global shapeParams and selectedShape
 */
function createGuideMask() {
  if (!guideMask) {
    guideMask = createGraphics(width, height);
  } else {
    guideMask.resizeCanvas(width, height);
  }
  
  guideMask.clear();
  guideMask.background(0);
  guideMask.noSmooth();
  
  const params = shapeParams;
  
  switch(selectedShape) {
    case 'horizontal-line':
    case 'vertical-line': {
      guideMask.stroke(255);
      guideMask.strokeWeight(8);
      guideMask.noFill();
      guideMask.line(params.x1, params.y1, params.x2, params.y2);
      break;
    }
    
    case 'circle':
    case 'ellipse': {
      guideMask.fill(255);
      guideMask.noStroke();
      guideMask.ellipseMode(CENTER);
      guideMask.push();
      guideMask.translate(params.cx, params.cy);
      if (params.angle !== undefined) {
        guideMask.rotate(radians(params.angle));
      }
      if (params.type === 'circle') {
        guideMask.ellipse(0, 0, params.size, params.size);
      } else {
        guideMask.ellipse(0, 0, params.w, params.h);
      }
      guideMask.pop();
      break;
    }
    
    case 'square': {
      guideMask.fill(255);
      guideMask.noStroke();
      guideMask.rectMode(CENTER);
      guideMask.push();
      guideMask.translate(params.cx, params.cy);
      if (params.angle !== undefined) {
        guideMask.rotate(radians(params.angle));
      }
      guideMask.rect(0, 0, params.size, params.size);
      guideMask.pop();
      break;
    }
    
    case 'triangle': {
      guideMask.fill(255);
      guideMask.noStroke();
      const size = params.size;
      guideMask.push();
      guideMask.translate(params.cx, params.cy);
      if (params.angle !== undefined) {
        guideMask.rotate(radians(params.angle));
      }
      if (params.type === 'equilateral') {
        const h = size * sqrt(3) / 2;
        guideMask.triangle(0, -h/2, -size/2, h/2, size/2, h/2);
      } else if (params.type === 'isosceles') {
        const base = size;
        const h = size * (params.baseRatio || 0.7);
        guideMask.triangle(0, -h/2, -base/2, h/2, base/2, h/2);
      } else {
        const a = size * 0.6;
        const c = size * 0.8;
        guideMask.triangle(0, -c/2, -a/2, c/2, a/2, c/2);
      }
      guideMask.pop();
      break;
    }
  }
}

function getHorizontalLineParams(level, w, h) {
  if (level === 1) {
    return { type: 'horizontal-line', x1: w * 0.2, y1: h/2, x2: w * 0.8, y2: h/2, angle: 0 };
  }
  if (level === 2) {
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
    return { 
      type: 'horizontal-line', 
      x1: clamp(random(w * 0.2, w * 0.8), 0, w),
      y1: clamp(random(h * 0.2, h * 0.8), 0, h),
      x2: clamp(random(w * 0.2, w * 0.8), 0, w),
      y2: clamp(random(h * 0.2, h * 0.8), 0, h),
      angle: 0
    };
  }
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

function getVerticalLineParams(level, w, h) {
  if (level === 1) {
    return { type: 'vertical-line', x1: w/2, y1: h * 0.2, x2: w/2, y2: h * 0.8, angle: 0 };
  }
  if (level === 2) {
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
    return { 
      type: 'vertical-line', 
      x1: clamp(random(w * 0.2, w * 0.8), 0, w),
      y1: clamp(random(h * 0.2, h * 0.8), 0, h),
      x2: clamp(random(w * 0.2, w * 0.8), 0, w),
      y2: clamp(random(h * 0.2, h * 0.8), 0, h),
      angle: 0
    };
  }
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

function getCircleParams(level, w, h) {
  const MARGIN = 10;
  const baseSize = calculateBaseSize(w, h);
  
  if (level === 1) {
    return { type: 'circle', cx: w/2, cy: h/2, size: baseSize, angle: 0 };
  }
  if (level === 2) {
    const size = baseSize;
    const minPos = size/2 + MARGIN;
    const maxPosX = w - size/2 - MARGIN;
    const maxPosY = h - size/2 - MARGIN;
    return { type: 'circle', cx: random(minPos, maxPosX), cy: random(minPos, maxPosY), size: size, angle: 0 };
  }
  if (level === 3) {
    const size = random(0.4, 0.8) * baseSize;
    const minPos = size/2 + MARGIN;
    const maxPosX = w - size/2 - MARGIN;
    const maxPosY = h - size/2 - MARGIN;
    return { type: 'circle', cx: random(minPos, maxPosX), cy: random(minPos, maxPosY), size: size, angle: 0 };
  }
  const angle = random(0, 180);
  const safeSize = calculateSafeSize(w, h, angle);
  const range = getSafePositionRange(w, h, safeSize, angle);
  return { type: 'circle', cx: random(range.minX, range.maxX), cy: random(range.minY, range.maxY), size: safeSize, angle: angle };
}

function getSquareParams(level, w, h) {
  const MARGIN = 10;
  const baseSize = calculateBaseSize(w, h);
  
  if (level === 1) {
    return { type: 'square', cx: w/2, cy: h/2, size: baseSize, angle: 0 };
  }
  if (level === 2) {
    const size = baseSize;
    const halfSize = size / 2;
    const minPos = halfSize + MARGIN;
    const maxPosX = w - halfSize - MARGIN;
    const maxPosY = h - halfSize - MARGIN;
    return { type: 'square', cx: random(minPos, maxPosX), cy: random(minPos, maxPosY), size: size, angle: 0 };
  }
  if (level === 3) {
    const size = random(0.4, 0.8) * baseSize;
    const halfSize = size / 2;
    const minPos = halfSize + MARGIN;
    const maxPosX = w - halfSize - MARGIN;
    const maxPosY = h - halfSize - MARGIN;
    return { type: 'square', cx: random(minPos, maxPosX), cy: random(minPos, maxPosY), size: size, angle: 0 };
  }
  const angle = random(0, 180);
  const safeSize = calculateSafeSize(w, h, angle);
  const range = getSafePositionRange(w, h, safeSize, angle);
  return { type: 'square', cx: random(range.minX, range.maxX), cy: random(range.minY, range.maxY), size: safeSize, angle: angle };
}

function getTriangleParams(level, w, h) {
  const MARGIN = 10;
  const baseSize = calculateBaseSize(w, h);
  
  if (level === 1) {
    return { type: 'equilateral', cx: w/2, cy: h/2, size: baseSize, angle: 0 };
  }
  if (level === 2) {
    const size = baseSize;
    const triangleHeight = size * sqrt(3) / 2;
    const minPosX = size/2 + MARGIN;
    const maxPosX = w - size/2 - MARGIN;
    const minPosY = triangleHeight/2 + MARGIN;
    const maxPosY = h - triangleHeight/2 - MARGIN;
    return { type: 'equilateral', cx: random(minPosX, maxPosX), cy: random(minPosY, maxPosY), size: size, angle: 0 };
  }
  if (level === 3) {
    const size = random(0.4, 0.8) * baseSize;
    const triangleHeight = size * sqrt(3) / 2;
    const minPosX = size/2 + MARGIN;
    const maxPosX = w - size/2 - MARGIN;
    const minPosY = triangleHeight/2 + MARGIN;
    const maxPosY = h - triangleHeight/2 - MARGIN;
    return { type: 'equilateral', cx: random(minPosX, maxPosX), cy: random(minPosY, maxPosY), size: size, angle: 0 };
  }
  const angle = random(0, 180);
  const safeSize = calculateSafeSize(w, h, angle) * 0.8;
  const range = getSafePositionRange(w, h, safeSize, angle);
  return { type: 'equilateral', cx: random(range.minX, range.maxX), cy: random(range.minY, range.maxY), size: safeSize, angle: angle };
}

function getEllipseParams(level, w, h) {
  const MARGIN = 10;
  const baseSize = calculateBaseSize(w, h);
  
  if (level === 1) {
    return { type: 'ellipse', cx: w/2, cy: h/2, w: baseSize, h: baseSize * 0.6, angle: 0 };
  }
  if (level === 2) {
    const ellipseW = baseSize;
    const ellipseH = baseSize * 0.6;
    const minPosX = ellipseW/2 + MARGIN;
    const maxPosX = w - ellipseW/2 - MARGIN;
    const minPosY = ellipseH/2 + MARGIN;
    const maxPosY = h - ellipseH/2 - MARGIN;
    return { type: 'ellipse', cx: random(minPosX, maxPosX), cy: random(minPosY, maxPosY), w: ellipseW, h: ellipseH, angle: 0 };
  }
  if (level === 3) {
    const ellipseW = random(0.4, 0.8) * baseSize;
    const ellipseH = random(0.4, 0.8) * baseSize * 0.6;
    const minPosX = ellipseW/2 + MARGIN;
    const maxPosX = w - ellipseW/2 - MARGIN;
    const minPosY = ellipseH/2 + MARGIN;
    const maxPosY = h - ellipseH/2 - MARGIN;
    return { type: 'ellipse', cx: random(minPosX, maxPosX), cy: random(minPosY, maxPosY), w: ellipseW, h: ellipseH, angle: 0 };
  }
  const angle = random(0, 180);
  const safeSize = calculateSafeSize(w, h, angle);
  const range = getSafePositionRange(w, h, safeSize, angle);
  return { type: 'ellipse', cx: random(range.minX, range.maxX), cy: random(range.minY, range.maxY), w: safeSize, h: safeSize * 0.6, angle: angle };
}

function getShapeParams() {
  if (!selectedShape || !currentLevel) {
    return { type: 'circle', cx: width/2, cy: height/2, size: min(width, height) * 0.6 };
  }
  
  switch(selectedShape) {
    case 'horizontal-line': return getHorizontalLineParams(currentLevel, width, height);
    case 'vertical-line': return getVerticalLineParams(currentLevel, width, height);
    case 'circle': return getCircleParams(currentLevel, width, height);
    case 'ellipse': return getEllipseParams(currentLevel, width, height);
    case 'square': return getSquareParams(currentLevel, width, height);
    case 'triangle': return getTriangleParams(currentLevel, width, height);
    default: return getCircleParams(1, width, height);
  }
}


// ============================================
// USER INTERACTIONS
// ============================================

function setShape(shape) {
  selectedShape = shape;
  currentShape = shape;
  clear();
  currentScore = null;
  scoreHistory = [];
  guideVisible = true;
  generateShapeParams();
  updateScoreDisplay();
  redraw();
}

function setLevel(level) {
  currentLevel = parseInt(level);
  clear();
  currentScore = null;
  scoreHistory = [];
  guideVisible = true;
  currentShape = generateNewShape();
  updateScoreDisplay();
  redraw();
}

function setShapeSettings(settings) {
  shapeSettings = { ...shapeSettings, ...settings };
}

function toggleShape(shape) {
  shapeSettings[shape] = !shapeSettings[shape];
  drawing = false;
  currentShape = null;
  clear();
  currentScore = null;
  scoreHistory = [];
  currentShape = generateNewShape();
  updateScoreDisplay();
  redraw();
}

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
// DISPLAY UPDATE FUNCTIONS
// ============================================

function updateScoreDisplay() {
  const scoreEl = document.getElementById('score-display');
  if (scoreEl) {
    let html = '';
    
    if (scoreHistory.length > 0) {
      const average = scoreHistory.reduce((sum, s) => sum + s, 0) / scoreHistory.length;
      html += `<div style="font-size: 20px; margin-bottom: 10px;">Moyenne: ${floor(average)}%</div>`;
    }
    
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

function showTemporaryScore() {
  const popupEl = document.getElementById('score-popup');
  if (popupEl) {
    if (scoreTimeout) {
      clearTimeout(scoreTimeout);
    }
    
    popupEl.textContent = `${floor(currentScore)}%`;
    popupEl.style.opacity = '1';
    popupEl.style.color = currentScore >= 80 ? '#22c55e' : currentScore >= 50 ? '#f59e0b' : '#ef4444';
    
    scoreTimeout = setTimeout(() => {
      popupEl.style.opacity = '0';
    }, 2000);
  }
}

function generateNewShape(level = currentLevel, settings = shapeSettings) {
  const availableShapes = getAvailableShapes(settings);
  if (availableShapes.length === 0) {
    availableShapes.push('circle', 'square', 'triangle', 'horizontal-line', 'vertical-line');
  }
  selectedShape = random(availableShapes);
  currentLevel = level;
  generateShapeParams();
  return selectedShape;
}
