/**
 * Mixe deux couleurs hexadécimales
 * @param {string} color1 - Première couleur au format hex (#RRGGBB ou RRGGBB)
 * @param {string} color2 - Deuxième couleur au format hex (#RRGGBB ou RRGGBB)
 * @param {number} ratio - Ratio de mixage (0 = 100% color1, 1 = 100% color2, 0.5 = 50/50)
 * @returns {string} Couleur résultante au format hex (#RRGGBB)
 */
export function mixColors(color1, color2, ratio = 0.5) {
  // Nettoyer les couleurs (enlever le # si présent)
  const cleanColor1 = color1.startsWith('#') ? color1.slice(1) : color1;
  const cleanColor2 = color2.startsWith('#') ? color2.slice(1) : color2;

  // Convertir hex en RGB
  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return { r, g, b };
  };

  const rgb1 = hexToRgb(cleanColor1);
  const rgb2 = hexToRgb(cleanColor2);

  // Mixer les composantes
  const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * ratio);
  const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * ratio);
  const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * ratio);

  // Convertir RGB en hex
  const rgbToHex = (r, g, b) => {
    const toHex = (c) => {
      const hex = c.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  return rgbToHex(r, g, b);
}

/**
 * Génère une couleur aléatoire au format hex
 * @returns {string} Couleur aléatoire (#RRGGBB)
 */
export function randomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Convertit une couleur hex en objet RGB
 * @param {string} hex - Couleur au format hex
 * @returns {Object} Objet avec propriétés r, g, b
 */
export function hexToRgb(hex) {
  const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
  return {
    r: parseInt(cleanHex.slice(0, 2), 16),
    g: parseInt(cleanHex.slice(2, 4), 16),
    b: parseInt(cleanHex.slice(4, 6), 16)
  };
}
