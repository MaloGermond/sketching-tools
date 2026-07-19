// Warmup sketch - Échauffement avant dessin
// Utilise p5.js via CDN

function setup() {
  let canvas = createCanvas(600, 400);
  canvas.parent('sketch-container');
}

function draw() {
  background(240);
  
  if (mouseIsPressed) {
    stroke(0);
    strokeWeight(5);
    line(pmouseX, pmouseY, mouseX, mouseY);
  }
}
