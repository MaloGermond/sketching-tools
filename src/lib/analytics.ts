// ===== TYPES =====

interface UmamiClient {
  track: (eventName: string, data?: Record<string, unknown>) => void;
}

declare global {
  interface Window { umami?: UmamiClient; }
}

// ===== IMPURE FUNCTIONS =====

/**
 * @impure — side effect: appelle window.umami.track si le script Umami est chargé
 * @param {string} eventName - Nom de l'événement à envoyer
 * @param {Record<string, unknown>} [data] - Données additionnelles de l'événement
 */
export function trackEvent(eventName: string, data?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  if (!window.umami?.track) return;
  window.umami.track(eventName, data);
}
