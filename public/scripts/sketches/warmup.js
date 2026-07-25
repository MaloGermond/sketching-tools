// Warmup sketch - Échauffement avant dessin
// Recopier les formes affichées et obtenir un score

let drawing = false;
let selectedShape = 'circle';
let userPoints = []; // Stocke les points du dessin utilisateur
let scoreHistory = []; // Historique des scores de la session

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
    
    // Ajouter le point actuel
    userPoints.push({x: mouseX, y: mouseY});
    
    // Dessiner avec courbe de p5.js
    if (userPoints.length >= 2) {
      beginShape();
      // Premier point répété pour un bon départ de la courbe
      curveVertex(userPoints[0].x, userPoints[0].y);
      for (let i = 0; i < userPoints.length; i++) {
        curveVertex(userPoints[i].x, userPoints[i].y);
      }
      // Dernier point répété pour une bonne fin de la courbe
      curveVertex(userPoints[userPoints.length - 1].x, userPoints[userPoints.length - 1].y);
      endShape();
    }
  }
}

function mouseReleased() {
  if (drawing) {
    drawing = false;
    const score = calculateScore();
    currentScore = score;
    scoreHistory.push(score);
    if (scoreHistory.length > 100) {
      scoreHistory.shift();
    }
    updateScoreDisplay();
    showTemporaryScore();
    redraw();
  }
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
let scoreTimeout = null;

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

// Changer la forme
function setShape(shape) {
  selectedShape = shape;
  clear();
  userPoints = [];
  currentScore = null;
  drawGuideShape();
  updateScoreDisplay();
}

// Réinitialiser l'historique
function resetHistory() {
  scoreHistory = [];
  currentScore = null;
  updateScoreDisplay();
  redraw();
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
  if (userPoints.length === 0) return 0;
  
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
