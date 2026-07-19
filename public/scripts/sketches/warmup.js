// Warmup sketch - Échauffement avant dessin
// Effet crayon avec p5.js

let drawing = false;

function setup() {
  let canvas = createCanvas(600, 400);
  canvas.parent('sketch-container');
  background(255);
  stroke(0);
  strokeWeight(3);
  strokeCap(ROUND);
  strokeJoin(ROUND);
}

function draw() {
  if (mouseIsPressed) {
    if (!drawing) {
      // Nouveau trait : effacer l'ancien
      clear();
      drawing = true;
    }
    // Dessiner la ligne en temps réel
    line(pmouseX, pmouseY, mouseX, mouseY);
  }
}

function mouseReleased() {
  drawing = false;
}
