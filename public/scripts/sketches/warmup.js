// Warmup sketch - Échauffement avant dessin
// Recopier les formes affichées et obtenir un score

let drawing = false;
let selectedShape = 'circle';
let userPoints = []; // Stocke les points du dessin utilisateur

function setup() {
  let canvas = createCanvas(600, 400);
  canvas.parent('sketch-container');
  background(255);
  stroke(0);
  strokeWeight(3);
  strokeCap(ROUND);
  strokeJoin(ROUND);
  
  drawGuideShape();
}

let currentScore = null;

function draw() {
  if (mouseIsPressed) {
    if (!drawing) {
      clear();
      userPoints = [];
      drawGuideShape();
      drawing = true;
    }
    userPoints.push({x: mouseX, y: mouseY});
    line(pmouseX, pmouseY, mouseX, mouseY);
  }
  
  // Afficher le score en bas à gauche
  if (currentScore !== null) {
    push();
    fill(240);
    noStroke();
    rect(20, height - 60, 200, 50, 8);
    fill(0);
    textSize(28);
    textAlign(LEFT, CENTER);
    text(`Score: ${floor(currentScore)}%`, 35, height - 35);
    pop();
  }
}

function mouseReleased() {
  if (drawing) {
    drawing = false;
    const score = calculateScore();
    currentScore = score;
    redraw();
  }
}

// Changer la forme
function setShape(shape) {
  selectedShape = shape;
  clear();
  userPoints = [];
  currentScore = null;
  drawGuideShape();
}

// Dessiner la forme guide en gris clair
function drawGuideShape() {
  push();
  stroke(200);
  noFill();
  strokeWeight(2);
  
  const size = min(width, height) * 0.6;
  
  switch(selectedShape) {
    case 'circle':
      ellipse(width/2, height/2, size, size);
      break;
    case 'square':
      rectMode(CENTER);
      rect(width/2, height/2, size, size);
      break;
    case 'triangle':
      const triSize = size * 0.8;
      triangle(width/2, height/2 - triSize/2, 
               width/2 - triSize/2, height/2 + triSize/2,
               width/2 + triSize/2, height/2 + triSize/2);
      break;
    case 'line':
      line(width * 0.2, height/2, width * 0.8, height/2);
      break;
  }
  pop();
}

// Calculer le score (0-100)
function calculateScore() {
  if (userPoints.length < 10) return 0; // Trop peu de points
  
  const size = min(width, height) * 0.6;
  const centerX = width / 2;
  const centerY = height / 2;
  
  let totalDistance = 0;
  let avgError = 0;
  
  switch(selectedShape) {
    case 'circle': {
      const radius = size / 2;
      for (let p of userPoints) {
        const d = dist(p.x, p.y, centerX, centerY);
        totalDistance += abs(d - radius);
      }
      avgError = totalDistance / userPoints.length;
      return max(0, 100 - (avgError / radius * 100));
    }
    
    case 'square': {
      const halfSize = size / 2;
      const left = centerX - halfSize;
      const right = centerX + halfSize;
      const top = centerY - halfSize;
      const bottom = centerY + halfSize;
      
      for (let p of userPoints) {
        const distToLeft = abs(p.x - left);
        const distToRight = abs(p.x - right);
        const distToTop = abs(p.y - top);
        const distToBottom = abs(p.y - bottom);
        const minDist = min(distToLeft, distToRight, distToTop, distToBottom);
        totalDistance += minDist;
      }
      avgError = totalDistance / userPoints.length;
      return max(0, 100 - (avgError / (size/2) * 100));
    }
    
    case 'line': {
      const lineY = height / 2;
      for (let p of userPoints) {
        totalDistance += abs(p.y - lineY);
      }
      avgError = totalDistance / userPoints.length;
      return max(0, 100 - (avgError / (height/4) * 100));
    }
    
    case 'triangle': {
      const triSize = size * 0.8;
      const v1 = {x: width/2, y: height/2 - triSize/2};
      const v2 = {x: width/2 - triSize/2, y: height/2 + triSize/2};
      const v3 = {x: width/2 + triSize/2, y: height/2 + triSize/2};
      
      for (let p of userPoints) {
        const d1 = pointToLineDistance(p, v1, v2);
        const d2 = pointToLineDistance(p, v2, v3);
        const d3 = pointToLineDistance(p, v3, v1);
        totalDistance += min(d1, d2, d3);
      }
      avgError = totalDistance / userPoints.length;
      return max(0, 100 - (avgError / (triSize/2) * 100));
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
