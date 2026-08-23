// ============================================
// Module: Shape Renderer
// Dessine les formes sur un canvas (p5.js ou autre)
// ============================================

import { SHAPE_TYPES, TRIANGLE_TYPES } from './shapeTypes.js';

/**
 * Style pour l'affichage vectoriel du guide
 */
export const GUIDE_DISPLAY_STYLE = {
  strokeColor: 200,
  strokeWeight: 2,
  noFill: true
};

/**
 * Style pour le masque de scoring
 */
export const GUIDE_MASK_STYLE = {
  strokeColor: 255,
  strokeWeight: 20,
  noSmooth: true
};

/**
 * Dessine une forme guide sur un contexte p5.js
 * @param {object} p5 - Instance p5.js
 * @param {object} params - Paramètres de la forme
 * @param {string} shapeType - Type de la forme
 * @param {object} style - Style de dessin (optionnel, utilise GUIDE_DISPLAY_STYLE par défaut)
 */
export function drawShape(p5, params, shapeType, style = GUIDE_DISPLAY_STYLE) {
  if (!p5 || !params) return;

  p5.stroke(style.strokeColor || GUIDE_DISPLAY_STYLE.strokeColor);
  p5.strokeWeight(style.strokeWeight || GUIDE_DISPLAY_STYLE.strokeWeight);
  if (style.noFill || GUIDE_DISPLAY_STYLE.noFill) p5.noFill();

  switch (shapeType) {
    case SHAPE_TYPES.HORIZONTAL_LINE:
    case SHAPE_TYPES.VERTICAL_LINE:
      p5.line(params.x1, params.y1, params.x2, params.y2);
      break;

    case SHAPE_TYPES.CIRCLE:
    case SHAPE_TYPES.ELLIPSE:
      p5.ellipseMode(p5.CENTER);
      p5.push();
      p5.translate(params.cx, params.cy);
      if (params.angle !== undefined) {
        p5.rotate(p5.radians(params.angle));
      }
      if (shapeType === SHAPE_TYPES.CIRCLE) {
        p5.ellipse(0, 0, params.size, params.size);
      } else {
        p5.ellipse(0, 0, params.w, params.h);
      }
      p5.pop();
      break;

    case SHAPE_TYPES.SQUARE:
      p5.rectMode(p5.CENTER);
      p5.push();
      p5.translate(params.cx, params.cy);
      if (params.angle !== undefined) {
        p5.rotate(p5.radians(params.angle));
      }
      p5.rect(0, 0, params.size, params.size);
      p5.pop();
      break;

    case SHAPE_TYPES.TRIANGLE:
      const size = params.size;
      p5.push();
      p5.translate(params.cx, params.cy);
      if (params.angle !== undefined) {
        p5.rotate(p5.radians(params.angle));
      }
      
      if (params.type === TRIANGLE_TYPES.EQUILATERAL) {
        const h = size * Math.sqrt(3) / 2;
        p5.triangle(0, -h / 2, -size / 2, h / 2, size / 2, h / 2);
      } else if (params.type === TRIANGLE_TYPES.ISOSCELES) {
        const base = size;
        const h = size * (params.baseRatio || 0.7);
        p5.triangle(0, -h / 2, -base / 2, h / 2, base / 2, h / 2);
      } else {
        const a = size * 0.6;
        const c = size * 0.8;
        p5.triangle(0, -c / 2, -a / 2, c / 2, a / 2, c / 2);
      }
      p5.pop();
      break;
  }
}

/**
 * Crée un masque de scoring pour une forme
 * @param {object} p5 - Instance p5.js
 * @param {object} params - Paramètres de la forme
 * @param {string} shapeType - Type de la forme
 * @param {object} maskStyle - Style du masque (optionnel)
 * @returns {object} Graphics buffer avec le masque
 */
export function createShapeMask(p5, params, shapeType, maskStyle = GUIDE_MASK_STYLE) {
  if (!p5 || !params) return null;

  const mask = p5.createGraphics(p5.width, p5.height);
  mask.pixelDensity(1);
  mask.clear();
  
  if (maskStyle.noSmooth) mask.noSmooth();
  mask.stroke(maskStyle.strokeColor || 255);
  mask.strokeWeight(maskStyle.strokeWeight || 20);
  mask.noFill();

  switch (shapeType) {
    case SHAPE_TYPES.HORIZONTAL_LINE:
    case SHAPE_TYPES.VERTICAL_LINE:
      mask.line(params.x1, params.y1, params.x2, params.y2);
      break;

    case SHAPE_TYPES.CIRCLE:
    case SHAPE_TYPES.ELLIPSE:
      mask.ellipseMode(p5.CENTER);
      mask.push();
      mask.translate(params.cx, params.cy);
      if (params.angle !== undefined) {
        mask.rotate(p5.radians(params.angle));
      }
      if (shapeType === SHAPE_TYPES.CIRCLE) {
        mask.ellipse(0, 0, params.size, params.size);
      } else {
        mask.ellipse(0, 0, params.w, params.h);
      }
      mask.pop();
      break;

    case SHAPE_TYPES.SQUARE:
      mask.rectMode(p5.CENTER);
      mask.push();
      mask.translate(params.cx, params.cy);
      if (params.angle !== undefined) {
        mask.rotate(p5.radians(params.angle));
      }
      mask.rect(0, 0, params.size, params.size);
      mask.pop();
      break;

    case SHAPE_TYPES.TRIANGLE:
      const size = params.size;
      mask.push();
      mask.translate(params.cx, params.cy);
      if (params.angle !== undefined) {
        mask.rotate(p5.radians(params.angle));
      }
      
      if (params.type === TRIANGLE_TYPES.EQUILATERAL) {
        const h = size * Math.sqrt(3) / 2;
        mask.triangle(0, -h / 2, -size / 2, h / 2, size / 2, h / 2);
      } else if (params.type === TRIANGLE_TYPES.ISOSCELES) {
        const base = size;
        const h = size * (params.baseRatio || 0.7);
        mask.triangle(0, -h / 2, -base / 2, h / 2, base / 2, h / 2);
      } else {
        const a = size * 0.6;
        const c = size * 0.8;
        mask.triangle(0, -c / 2, -a / 2, c / 2, a / 2, c / 2);
      }
      mask.pop();
      break;
  }

  return mask;
}

/**
 * Obtient les formes disponibles à partir des paramètres
 */
export function getAvailableShapes(settings) {
  const availableShapes = Object.keys(settings).filter(shape => settings[shape]);
  if (availableShapes.length === 0) {
    return [
      SHAPE_TYPES.CIRCLE,
      SHAPE_TYPES.SQUARE,
      SHAPE_TYPES.TRIANGLE,
      SHAPE_TYPES.HORIZONTAL_LINE,
      SHAPE_TYPES.VERTICAL_LINE
    ];
  }
  return availableShapes;
}
