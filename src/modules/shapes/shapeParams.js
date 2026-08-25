// ============================================
// Module: Shape Parameters
// Génération des paramètres pour chaque type de forme
// ============================================

import { SHAPE_TYPES, TRIANGLE_TYPES } from './shapeTypes.js';

/**
 * Calcule la taille de base en fonction des dimensions
 */
export function calculateBaseSize(width, height) {
  return Math.min(width, height) * 0.6;
}

/**
 * Calcule une taille sûre en tenant compte de la rotation
 */
export function calculateSafeSize(width, height, angle) {
  const maxDimension = Math.min(width, height) * 0.8;
  const rotationFactor = Math.abs(Math.cos(radians(angle))) + Math.abs(Math.sin(radians(angle)));
  return maxDimension / rotationFactor;
}

/**
 * Limite une valeur entre min et max
 */
export function clamp(value, minVal, maxVal) {
  return Math.max(minVal, Math.min(maxVal, value));
}

/**
 * Calcule la plage de position sûre pour une forme
 */
export function getSafePositionRange(width, height, size, angle) {
  const rotationFactor = Math.abs(Math.cos(radians(angle))) + Math.abs(Math.sin(radians(angle)));
  const margin = size * rotationFactor / 2;
  return {
    minX: margin,
    maxX: width - margin,
    minY: margin,
    maxY: height - margin
  };
}

/**
 * Convertit les degrés en radians
 */
export function radians(degrees) {
  return degrees * Math.PI / 180;
}

/**
 * Génère les paramètres pour une ligne horizontale
 */
export function getHorizontalLineParams(level, width, height) {
  if (level === 1) {
    return { 
      type: SHAPE_TYPES.HORIZONTAL_LINE, 
      x1: width * 0.2, 
      y1: height / 2, 
      x2: width * 0.8, 
      y2: height / 2, 
      angle: 0 
    };
  }
  if (level === 2) {
    return { 
      type: SHAPE_TYPES.HORIZONTAL_LINE, 
      x1: width * 0.2, 
      y1: clamp(random(height * 0.2, height * 0.8), 0, height),
      x2: width * 0.8, 
      y2: clamp(random(height * 0.2, height * 0.8), 0, height),
      angle: 0
    };
  }
  if (level === 3) {
    return { 
      type: SHAPE_TYPES.HORIZONTAL_LINE, 
      x1: clamp(random(width * 0.2, width * 0.8), 0, width),
      y1: clamp(random(height * 0.2, height * 0.8), 0, height),
      x2: clamp(random(width * 0.2, width * 0.8), 0, width),
      y2: clamp(random(height * 0.2, height * 0.8), 0, height),
      angle: 0
    };
  }
  
  const angle = random(0, 180);
  const length = random(0.4, 0.8) * Math.min(width, height);
  const cx = random(width * 0.2, width * 0.8);
  const cy = random(height * 0.2, height * 0.8);
  const x1 = cx - length * Math.cos(radians(angle)) / 2;
  const y1 = cy - length * Math.sin(radians(angle)) / 2;
  const x2 = cx + length * Math.cos(radians(angle)) / 2;
  const y2 = cy + length * Math.sin(radians(angle)) / 2;
  
  return { 
    type: SHAPE_TYPES.HORIZONTAL_LINE, 
    x1: clamp(x1, 0, width), 
    y1: clamp(y1, 0, height), 
    x2: clamp(x2, 0, width), 
    y2: clamp(y2, 0, height), 
    angle: angle 
  };
}

/**
 * Génère les paramètres pour une ligne verticale
 */
export function getVerticalLineParams(level, width, height) {
  if (level === 1) {
    return { 
      type: SHAPE_TYPES.VERTICAL_LINE, 
      x1: width / 2, 
      y1: height * 0.2, 
      x2: width / 2, 
      y2: height * 0.8, 
      angle: 0 
    };
  }
  if (level === 2) {
    return { 
      type: SHAPE_TYPES.VERTICAL_LINE, 
      x1: clamp(random(width * 0.2, width * 0.8), 0, width),
      y1: height * 0.2, 
      x2: clamp(random(width * 0.2, width * 0.8), 0, width),
      y2: height * 0.8,
      angle: 0
    };
  }
  if (level === 3) {
    return { 
      type: SHAPE_TYPES.VERTICAL_LINE, 
      x1: clamp(random(width * 0.2, width * 0.8), 0, width),
      y1: clamp(random(height * 0.2, height * 0.8), 0, height),
      x2: clamp(random(width * 0.2, width * 0.8), 0, width),
      y2: clamp(random(height * 0.2, height * 0.8), 0, height),
      angle: 0
    };
  }
  
  const angle = random(0, 180);
  const length = random(0.4, 0.8) * Math.min(width, height);
  const cx = random(width * 0.2, width * 0.8);
  const cy = random(height * 0.2, height * 0.8);
  const x1 = cx - length * Math.cos(radians(angle)) / 2;
  const y1 = cy - length * Math.sin(radians(angle)) / 2;
  const x2 = cx + length * Math.cos(radians(angle)) / 2;
  const y2 = cy + length * Math.sin(radians(angle)) / 2;
  
  return { 
    type: SHAPE_TYPES.VERTICAL_LINE, 
    x1: clamp(x1, 0, width), 
    y1: clamp(y1, 0, height), 
    x2: clamp(x2, 0, width), 
    y2: clamp(y2, 0, height), 
    angle: angle 
  };
}

/**
 * Génère les paramètres pour un cercle
 */
export function getCircleParams(level, width, height) {
  const MARGIN = 10;
  const baseSize = calculateBaseSize(width, height);
  
  if (level === 1) {
    return { type: SHAPE_TYPES.CIRCLE, cx: width / 2, cy: height / 2, size: baseSize, angle: 0 };
  }
  if (level === 2) {
    const size = baseSize;
    const minPos = size / 2 + MARGIN;
    const maxPosX = width - size / 2 - MARGIN;
    const maxPosY = height - size / 2 - MARGIN;
    return { 
      type: SHAPE_TYPES.CIRCLE, 
      cx: random(minPos, maxPosX), 
      cy: random(minPos, maxPosY), 
      size: size, 
      angle: 0 
    };
  }
  if (level === 3) {
    const size = random(0.4, 0.8) * baseSize;
    const minPos = size / 2 + MARGIN;
    const maxPosX = width - size / 2 - MARGIN;
    const maxPosY = height - size / 2 - MARGIN;
    return { 
      type: SHAPE_TYPES.CIRCLE, 
      cx: random(minPos, maxPosX), 
      cy: random(minPos, maxPosY), 
      size: size, 
      angle: 0 
    };
  }
  
  const angle = random(0, 180);
  const safeSize = calculateSafeSize(width, height, angle);
  const range = getSafePositionRange(width, height, safeSize, angle);
  return { 
    type: SHAPE_TYPES.CIRCLE, 
    cx: random(range.minX, range.maxX), 
    cy: random(range.minY, range.maxY), 
    size: safeSize, 
    angle: angle 
  };
}

/**
 * Génère les paramètres pour un carré
 */
export function getSquareParams(level, width, height) {
  const MARGIN = 10;
  const baseSize = calculateBaseSize(width, height);
  
  if (level === 1) {
    return { type: SHAPE_TYPES.SQUARE, cx: width / 2, cy: height / 2, size: baseSize, angle: 0 };
  }
  if (level === 2) {
    const size = baseSize;
    const halfSize = size / 2;
    const minPos = halfSize + MARGIN;
    const maxPosX = width - halfSize - MARGIN;
    const maxPosY = height - halfSize - MARGIN;
    return { 
      type: SHAPE_TYPES.SQUARE, 
      cx: random(minPos, maxPosX), 
      cy: random(minPos, maxPosY), 
      size: size, 
      angle: 0 
    };
  }
  if (level === 3) {
    const size = random(0.4, 0.8) * baseSize;
    const halfSize = size / 2;
    const minPos = halfSize + MARGIN;
    const maxPosX = width - halfSize - MARGIN;
    const maxPosY = height - halfSize - MARGIN;
    return { 
      type: SHAPE_TYPES.SQUARE, 
      cx: random(minPos, maxPosX), 
      cy: random(minPos, maxPosY), 
      size: size, 
      angle: 0 
    };
  }
  
  const angle = random(0, 180);
  const safeSize = calculateSafeSize(width, height, angle);
  const range = getSafePositionRange(width, height, safeSize, angle);
  return { 
    type: SHAPE_TYPES.SQUARE, 
    cx: random(range.minX, range.maxX), 
    cy: random(range.minY, range.maxY), 
    size: safeSize, 
    angle: angle 
  };
}

/**
 * Génère les paramètres pour un triangle
 */
export function getTriangleParams(level, width, height) {
  const MARGIN = 10;
  const baseSize = calculateBaseSize(width, height);
  
  if (level === 1) {
    return { type: TRIANGLE_TYPES.EQUILATERAL, cx: width / 2, cy: height / 2, size: baseSize, angle: 0 };
  }
  if (level === 2) {
    const size = baseSize;
    const triangleHeight = size * Math.sqrt(3) / 2;
    const minPosX = size / 2 + MARGIN;
    const maxPosX = width - size / 2 - MARGIN;
    const minPosY = triangleHeight / 2 + MARGIN;
    const maxPosY = height - triangleHeight / 2 - MARGIN;
    return { 
      type: TRIANGLE_TYPES.EQUILATERAL, 
      cx: random(minPosX, maxPosX), 
      cy: random(minPosY, maxPosY), 
      size: size, 
      angle: 0 
    };
  }
  if (level === 3) {
    const size = random(0.4, 0.8) * baseSize;
    const triangleHeight = size * Math.sqrt(3) / 2;
    const minPosX = size / 2 + MARGIN;
    const maxPosX = width - size / 2 - MARGIN;
    const minPosY = triangleHeight / 2 + MARGIN;
    const maxPosY = height - triangleHeight / 2 - MARGIN;
    return { 
      type: TRIANGLE_TYPES.EQUILATERAL, 
      cx: random(minPosX, maxPosX), 
      cy: random(minPosY, maxPosY), 
      size: size, 
      angle: 0 
    };
  }
  
  const angle = random(0, 180);
  const safeSize = calculateSafeSize(width, height, angle) * 0.8;
  const range = getSafePositionRange(width, height, safeSize, angle);
  return { 
    type: TRIANGLE_TYPES.EQUILATERAL, 
    cx: random(range.minX, range.maxX), 
    cy: random(range.minY, range.maxY), 
    size: safeSize, 
    angle: angle 
  };
}

/**
 * Génère les paramètres pour une ellipse
 */
export function getEllipseParams(level, width, height) {
  const MARGIN = 10;
  const baseSize = calculateBaseSize(width, height);
  
  if (level === 1) {
    return { 
      type: SHAPE_TYPES.ELLIPSE, 
      cx: width / 2, 
      cy: height / 2, 
      w: baseSize, 
      h: baseSize * 0.6, 
      angle: 0 
    };
  }
  if (level === 2) {
    const ellipseW = baseSize;
    const ellipseH = baseSize * 0.6;
    const minPosX = ellipseW / 2 + MARGIN;
    const maxPosX = width - ellipseW / 2 - MARGIN;
    const minPosY = ellipseH / 2 + MARGIN;
    const maxPosY = height - ellipseH / 2 - MARGIN;
    return { 
      type: SHAPE_TYPES.ELLIPSE, 
      cx: random(minPosX, maxPosX), 
      cy: random(minPosY, maxPosY), 
      w: ellipseW, 
      h: ellipseH, 
      angle: 0 
    };
  }
  if (level === 3) {
    const ellipseW = random(0.4, 0.8) * baseSize;
    const ellipseH = random(0.4, 0.8) * baseSize * 0.6;
    const minPosX = ellipseW / 2 + MARGIN;
    const maxPosX = width - ellipseW / 2 - MARGIN;
    const minPosY = ellipseH / 2 + MARGIN;
    const maxPosY = height - ellipseH / 2 - MARGIN;
    return { 
      type: SHAPE_TYPES.ELLIPSE, 
      cx: random(minPosX, maxPosX), 
      cy: random(minPosY, maxPosY), 
      w: ellipseW, 
      h: ellipseH, 
      angle: 0 
    };
  }
  
  const angle = random(0, 180);
  const safeSize = calculateSafeSize(width, height, angle);
  const range = getSafePositionRange(width, height, safeSize, angle);
  return { 
    type: SHAPE_TYPES.ELLIPSE, 
    cx: random(range.minX, range.maxX), 
    cy: random(range.minY, range.maxY), 
    w: safeSize, 
    h: safeSize * 0.6, 
    angle: angle 
  };
}

/**
 * Génère les paramètres pour une forme donnée
 */
export function getShapeParams(shapeType, level, width, height) {
  switch (shapeType) {
    case SHAPE_TYPES.HORIZONTAL_LINE:
      return getHorizontalLineParams(level, width, height);
    case SHAPE_TYPES.VERTICAL_LINE:
      return getVerticalLineParams(level, width, height);
    case SHAPE_TYPES.CIRCLE:
      return getCircleParams(level, width, height);
    case SHAPE_TYPES.ELLIPSE:
      return getEllipseParams(level, width, height);
    case SHAPE_TYPES.SQUARE:
      return getSquareParams(level, width, height);
    case SHAPE_TYPES.TRIANGLE:
      return getTriangleParams(level, width, height);
    default:
      return getCircleParams(1, width, height);
  }
}

/**
 * Génère une valeur aléatoire entre min et max
 */
export function random(min, max) {
  return Math.random() * (max - min) + min;
}
