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
let guideVisible = true;
let currentScore = null;
let scoreTimeout = null;
let canvasElement;

// Buffer de dessin bitmap
let drawingBuffer;

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
  drawingBuffer.background(255);
  
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
  drawingBuffer.background(255);
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
  
  image(drawingBuffer, 0, 0);
  renderActiveShape();
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

function getShapeSamples() {
  const params = shapeParams;
  const count = 100;
  const samples = [];
  
  if (!params) return samples;
  
  switch(selectedShape) {
    case 'circle':
    case 'ellipse': {
      const cx = params.cx;
      const cy = params.cy;
      const w = params.type === 'circle' ? params.size : params.w;
      const h = params.type === 'circle' ? params.size : params.h;
      const radiusX = w / 2;
      const radiusY = h / 2;
      
      for (let i = 0; i < count; i++) {
        const angle = TWO_PI * i / count;
        samples.push({
          x: cx + radiusX * cos(angle),
          y: cy + radiusY * sin(angle)
        });
      }
      break;
    }
    
    case 'horizontal-line':
    case 'vertical-line': {
      const x1 = params.x1, y1 = params.y1;
      const x2 = params.x2, y2 = params.y2;
      for (let i = 0; i < count; i++) {
        const t = i / (count - 1);
        samples.push({
          x: lerp(x1, x2, t),
          y: lerp(y1, y2, t)
        });
      }
      break;
    }
    
    case 'square': {
      const cx = params.cx;
      const cy = params.cy;
      const size = params.size;
      const half = size / 2;
      const left = cx - half;
      const right = cx + half;
      const top = cy - half;
      const bottom = cy + half;
      
      const perSide = floor(count / 4);
      for (let i = 0; i < count; i++) {
        const side = floor(i / perSide);
        const t = (i % perSide) / max(perSide - 1, 1);
        
        switch(side % 4) {
          case 0: samples.push({x: lerp(left, right, t), y: top}); break;
          case 1: samples.push({x: right, y: lerp(top, bottom, t)}); break;
          case 2: samples.push({x: lerp(right, left, t), y: bottom}); break;
          case 3: samples.push({x: left, y: lerp(bottom, top, t)}); break;
        }
      }
      break;
    }
    
    case 'triangle': {
      const cx = params.cx;
      const cy = params.cy;
      const size = params.size;
      let v1, v2, v3;
      
      if (params.type === 'equilateral') {
        const h = size * sqrt(3) / 2;
        v1 = {x: cx, y: cy - h/2};
        v2 = {x: cx - size/2, y: cy + h/2};
        v3 = {x: cx + size/2, y: cy + h/2};
      } else if (params.type === 'isosceles') {
        const base = size;
        const h = size * (params.baseRatio || 0.7);
        v1 = {x: cx, y: cy - h/2};
        v2 = {x: cx - base/2, y: cy + h/2};
        v3 = {x: cx + base/2, y: cy + h/2};
      } else {
        const a = size * 0.6;
        const b = size * 0.7;
        const c = size * 0.8;
        v1 = {x: cx, y: cy - c/2};
        v2 = {x: cx - a/2, y: cy + c/2};
        v3 = {x: cx + a/2, y: cy + c/2};
      }
      
      const perSide = floor(count / 3);
      for (let i = 0; i < count; i++) {
        const side = floor(i / perSide);
        const t = (i % perSide) / max(perSide - 1, 1);
        
        switch(side % 3) {
          case 0: samples.push({x: lerp(v1.x, v2.x, t), y: lerp(v1.y, v2.y, t)}); break;
          case 1: samples.push({x: lerp(v2.x, v3.x, t), y: lerp(v2.y, v3.y, t)}); break;
          case 2: samples.push({x: lerp(v3.x, v1.x, t), y: lerp(v3.y, v1.y, t)}); break;
        }
      }
      break;
    }
  }
  
  return samples;
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
    guideVisible = true;
  }
}

function handleUserDrawing() {
  if (!drawing) {
    drawingBuffer.clear();
    drawingBuffer.background(255);
    drawing = true;
    guideVisible = false;
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
    guideVisible = true;
    
    const score = calculateScoreFromBuffer();
    currentScore = score;
    scoreHistory.push(score);
    if (scoreHistory.length > 20) {
      scoreHistory.shift();
    }
    updateScoreDisplay();
    showTemporaryScore();
    
    setTimeout(() => {
      drawingBuffer.clear();
      drawingBuffer.background(255);
      currentShape = generateNewShape();
      redraw();
    }, 100);
  }
}

function calculateScoreFromBuffer() {
  const samples = getShapeSamples();
  if (samples.length === 0) return 0;
  
  drawingBuffer.loadPixels();
  let hits = 0;
  
  for (const sample of samples) {
    const x = floor(constrain(sample.x, 0, drawingBuffer.width - 1));
    const y = floor(constrain(sample.y, 0, drawingBuffer.height - 1));
    const idx = (y * drawingBuffer.width + x) * 4;
    
    if (drawingBuffer.pixels[idx] < 200) {
      hits++;
    }
  }
  
  return floor((hits / samples.length) * 100);
}

function renderActiveShape() {
  if (guideVisible && !drawing && currentShape != null) {
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
  guideVisible = true;
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
