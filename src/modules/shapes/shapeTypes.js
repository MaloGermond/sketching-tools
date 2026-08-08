// ============================================
// Module: Shape Types
// Définition des types de formes et leurs paramètres
// ============================================

/**
 * Types de formes disponibles
 */
export const SHAPE_TYPES = {
  CIRCLE: 'circle',
  ELLIPSE: 'ellipse',
  SQUARE: 'square',
  TRIANGLE: 'triangle',
  HORIZONTAL_LINE: 'horizontal-line',
  VERTICAL_LINE: 'vertical-line'
};

/**
 * Types de triangles
 */
export const TRIANGLE_TYPES = {
  EQUILATERAL: 'equilateral',
  ISOSCELES: 'isosceles',
  DEFAULT: 'default'
};

/**
 * Configuration par défaut des formes disponibles
 */
export const DEFAULT_SHAPE_SETTINGS = {
  [SHAPE_TYPES.CIRCLE]: true,
  [SHAPE_TYPES.ELLIPSE]: false,
  [SHAPE_TYPES.SQUARE]: false,
  [SHAPE_TYPES.TRIANGLE]: false,
  [SHAPE_TYPES.HORIZONTAL_LINE]: false,
  [SHAPE_TYPES.VERTICAL_LINE]: false
};
