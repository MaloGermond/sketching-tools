// ============================================
// Module: Drawing Buffer
// Gère le buffer de dessin et les opérations de tracé
// Indépendant de p5.js - peut être utilisé avec n'importe quel contexte canvas
// ============================================

/**
 * Crée un buffer de dessin
 * @param {number} width - Largeur du buffer
 * @param {number} height - Hauteur du buffer
 * @param {object} p5 - Instance p5.js (optionnel, pour la compatibilité)
 * @returns {object} Buffer de dessin avec méthodes
 */
export function createDrawingBuffer(width, height, p5) {
  const buffer = p5 ? p5.createGraphics(width, height) : null;
  
  return {
    buffer,
    clear: () => {
      if (buffer) buffer.clear();
    },
    drawPoint: (x, y, size, color = 0) => {
      if (buffer) {
        buffer.noStroke();
        buffer.fill(color);
        buffer.ellipse(x, y, size, size);
      }
    },
    drawLine: (x1, y1, x2, y2, weight, color = 0) => {
      if (buffer) {
        buffer.stroke(color);
        buffer.strokeWeight(weight);
        buffer.line(x1, y1, x2, y2);
      }
    },
    getPixels: () => {
      if (buffer) {
        buffer.loadPixels();
        return buffer.pixels;
      }
      return null;
    },
    resize: (newWidth, newHeight) => {
      if (buffer) {
        buffer.resizeCanvas(newWidth, newHeight);
      }
    }
  };
}

/**
 * Dessine une ligne avec interpolation pour un tracé fluide
 * @param {object} buffer - Buffer de dessin
 * @param {number} x1 - Coordonnée x de départ
 * @param {number} y1 - Coordonnée y de départ
 * @param {number} x2 - Coordonnée x de fin
 * @param {number} y2 - Coordonnée y de fin
 * @param {number} spacing - Espacement entre les points
 * @param {number} size - Taille du pinceau
 * @param {number} color - Couleur du tracé
 */
export function drawSmoothLine(buffer, x1, y1, x2, y2, spacing, size, color = 0) {
  const d = dist(x1, y1, x2, y2);
  if (d < spacing) return;
  
  const steps = Math.floor(d / spacing);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = lerp(x1, x2, t);
    const y = lerp(y1, y2, t);
    buffer.noStroke();
    buffer.fill(color);
    buffer.ellipse(x, y, size, size);
  }
}

/**
 * Calcule la distance entre deux points
 */
export function dist(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * Interpolation linéaire
 */
export function lerp(start, end, t) {
  return start + (end - start) * t;
}

