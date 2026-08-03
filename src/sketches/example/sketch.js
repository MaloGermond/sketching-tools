/**
 * Sketch p5.js exemple qui utilise le module utils.js
 * Ce sketch démontre l'utilisation de modules externes avec p5.js
 */

// Importer les utilitaires depuis le module
import { mixColors, randomColor } from './utils.js';

// Variables globales pour le sketch
let bgColor = '#f0f0f0';
let circleColor = '#ff0000';
let otherColor = '#0000ff';
let mixedColor = '#00ff00';
let circleX = 100;
let circleY = 100;
let circleSize = 50;
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

export default function sketch(p) {
  p.setup = function() {
    // Créer le canvas
    const canvas = p.createCanvas(800, 600);
    canvas.mousePressed(handleMousePressed);
    canvas.mouseReleased(handleMouseReleased);
    
    // Calculer la couleur mixée
    mixedColor = mixColors(circleColor, otherColor, 0.5);
    
    p.noLoop(); // Pas besoin de redessiner en continu
  };

  p.draw = function() {
    // Fond
    p.background(bgColor);
    
    // Dessiner le cercle principal
    p.fill(circleColor);
    p.noStroke();
    p.ellipse(circleX, circleY, circleSize, circleSize);
    
    // Dessiner le deuxième cercle
    p.fill(otherColor);
    p.ellipse(300, 200, circleSize, circleSize);
    
    // Dessiner le cercle avec la couleur mixée
    p.fill(mixedColor);
    p.ellipse(500, 200, circleSize, circleSize);
    
    // Afficher les infos
    p.fill(0);
    p.textSize(14);
    p.textAlign(p.LEFT, p.TOP);
    p.text(`Couleur 1: ${circleColor}`, 20, 20);
    p.text(`Couleur 2: ${otherColor}`, 20, 40);
    p.text(`Couleur mixée: ${mixedColor}`, 20, 60);
    p.text('Glissez le cercle rouge', 20, 80);
    p.text('Cliquez pour changer les couleurs', 20, 100);
  };

  p.mousePressed = function() {
    handleMousePressed();
  };

  p.mouseReleased = function() {
    handleMouseReleased();
  };

  p.mouseDragged = function() {
    if (isDragging) {
      circleX = p.mouseX - dragOffsetX;
      circleY = p.mouseY - dragOffsetY;
      p.redraw();
    }
  };

  p.mouseClicked = function() {
    // Changer les couleurs aléatoirement au clic
    circleColor = randomColor();
    otherColor = randomColor();
    mixedColor = mixColors(circleColor, otherColor, 0.5);
    p.redraw();
  };

  // Gestionnaires d'événements
  function handleMousePressed() {
    // Vérifier si on clique sur le cercle
    const d = p.dist(p.mouseX, p.mouseY, circleX, circleY);
    if (d < circleSize / 2) {
      isDragging = true;
      dragOffsetX = p.mouseX - circleX;
      dragOffsetY = p.mouseY - circleY;
    }
  }

  function handleMouseReleased() {
    isDragging = false;
  }
}

// Export pour usage direct si nécessaire
export { mixColors, randomColor };
