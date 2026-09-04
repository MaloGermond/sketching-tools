// ============================================
// Module: Drawing Buffer
// Gère le lissage et les segments de tracé
// Indépendant de p5.js - fonctions pures, aucun accès canvas ici
// ============================================

// ===== PURE FUNCTIONS =====

/**
 * Calcule la distance entre deux points
 * @pure
 */
export function dist(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * Interpolation linéaire
 * @pure
 */
export function lerp(start, end, t) {
  return start + (end - start) * t;
}

/**
 * Calcule le point milieu entre deux points
 * @pure
 */
export function midpoint(p1, p2) {
  return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
}

/**
 * Calcule un point lissé par moyenne mobile sur les N derniers points
 * (moyenne arrière uniquement : les points futurs ne sont pas encore connus
 * en tracé temps réel, ce qui garantit un lag minimal)
 * @param {Array<{x:number,y:number}>} points - Points bruts captés
 * @param {number} windowSize - Nombre de points pris en compte (3 à 5)
 * @returns {{x:number,y:number}|null} Point lissé, ou null si points vide
 * @pure
 */
export function computeMovingAveragePoint(points, windowSize = 3) {
  if (points.length === 0) return null;

  const window = points.slice(-windowSize);
  const sum = window.reduce(
    (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
    { x: 0, y: 0 }
  );

  return { x: sum.x / window.length, y: sum.y / window.length };
}

/**
 * Calcule le segment à tracer pour relier les derniers points lissés.
 * Avec 2 points : segment droit. Avec 3 points ou plus : courbe quadratique
 * passant par les midpoints (le tracé traverse tous les points, sans à-coups).
 * @param {Array<{x:number,y:number}>} points - Points lissés
 * @returns {{type:'line',from:object,to:object}|{type:'quadratic',from:object,control:object,to:object}|null}
 * @pure
 */
export function getSmoothSegment(points) {
  const n = points.length;
  if (n < 2) return null;

  if (n === 2) {
    return { type: 'line', from: points[0], to: points[1] };
  }

  const p1 = points[n - 3];
  const p2 = points[n - 2];
  const p3 = points[n - 1];

  return {
    type: 'quadratic',
    from: midpoint(p1, p2),
    control: p2,
    to: midpoint(p2, p3)
  };
}
