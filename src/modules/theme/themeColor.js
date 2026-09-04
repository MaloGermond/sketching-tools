// ============================================
// Module: Theme Color
// Lit les tokens de thème (custom properties CSS) pour les contextes qui ne
// peuvent pas utiliser var(...) directement (canvas p5.js/2D)
// ============================================

const cache = new Map();

/**
 * @pure
 */
function isBrowser() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * @impure — side effect: lit le style calculé du document
 */
function readColor(varName) {
  if (!isBrowser()) return '#000000';
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || '#000000';
}

/**
 * Couleur actuellement en cache pour un token (ou lue à la volée si pas encore mise en cache)
 */
export function getThemeColor(varName) {
  return cache.has(varName) ? cache.get(varName) : readColor(varName);
}

/**
 * @impure — side effect: observe le data-theme du document et la préférence
 * système, met à jour le cache et appelle onChange à chaque changement de thème
 * @returns {() => void} fonction pour arrêter l'observation
 */
export function watchThemeColors(varNames, onChange) {
  if (!isBrowser()) return () => {};

  const refresh = () => varNames.forEach((name) => cache.set(name, readColor(name)));
  refresh();

  const notify = () => { refresh(); onChange?.(); };

  const observer = new MutationObserver(notify);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  const media = window.matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', notify);

  return () => {
    observer.disconnect();
    media.removeEventListener('change', notify);
  };
}
