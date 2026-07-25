// Warmup sketch - Échauffement avant dessin
// Recopier les formes affichées

let drawing = false;
let selectedShape = 'circle'; // cercle, square, triangle, line

function setup() {
  let canvas = createCanvas(600, 400);
  canvas.parent('sketch-container');
  background(255);
  stroke(0);
  strokeWeight(3);
  strokeCap(ROUND);
  strokeJoin(ROUND);
  
  // Dessiner la forme en fond
  drawGuideShape();
}

function draw() {
  if (mouseIsPressed) {
    if (!drawing) {
      clear();
      drawGuideShape(); // Redessiner la forme guide
      drawing = true;
    }
    line(pmouseX, pmouseY, mouseX, mouseY);
  }
}

function mouseReleased() {
  drawing = false;
}

// Changer la forme via un message depuis la page
function setShape(shape) {
  selectedShape = shape;
  clear();
  drawGuideShape();
}

// Dessiner la forme guide en gris clair
function drawGuideShape() {
  push();
  stroke(200);
  noFill();
  strokeWeight(2);
  
  // Utiliser la plus petite dimension pour garder les proportions
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
