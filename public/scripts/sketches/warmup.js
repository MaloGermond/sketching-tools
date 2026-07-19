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
  noFill();
}

function draw() {
  if (mouseIsPressed) {
    if (!drawing) {
      // Nouveau trait : effacer l'ancien
      clear();
      beginShape(LINE_STRIP);
      drawing = true;
    }
    vertex(mouseX, mouseY);
  } else {
    if (drawing) {
      endShape();
      drawing = false;
    }
  }
}

function mouseReleased() {
  if (drawing) {
    endShape();
    drawing = false;
  }
}

function mouseLeft() {
  if (drawing) {
    endShape();
    drawing = false;
  }
}
