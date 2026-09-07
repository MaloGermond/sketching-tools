import { useEffect, useRef, useState } from 'preact/hooks';

const CONSENT_KEY = 'cookie-consent';

// ===== PURE FUNCTIONS =====

/**
 * @pure
 */
function hasStoredConsent(value) {
  return value === 'accepted' || value === 'refused';
}

// ===== IMPURE FUNCTIONS =====

/**
 * @impure - Lit `localStorage`
 */
function getStoredConsent() {
  try {
    return localStorage.getItem(CONSENT_KEY);
  } catch (e) {
    return null;
  }
}

/**
 * @impure - Écrit dans `localStorage`, dispatch l'event DOM `cookie-consent-changed`
 */
function storeConsent(consent) {
  try {
    localStorage.setItem(CONSENT_KEY, consent);
  } catch (e) {}
  document.dispatchEvent(new CustomEvent('cookie-consent-changed', { detail: { consent } }));
}

// ===== COMPONENT =====

export default function CookieConsentModal() {
  const [visible, setVisible] = useState(false);
  const acceptButtonRef = useRef(null);

  useEffect(() => {
    setVisible(!hasStoredConsent(getStoredConsent()));
  }, []);

  useEffect(() => {
    if (visible) acceptButtonRef.current?.focus();
  }, [visible]);

  /** @impure - Stocke le choix et masque la modal */
  const handleChoice = (consent) => {
    storeConsent(consent);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div class="cookie-consent-overlay">
      <style>{`
        .cookie-consent-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding: 1rem;
          background: rgb(0 0 0 / 0.4);
        }

        .cookie-consent-modal {
          width: 100%;
          max-width: 26rem;
          background: var(--surface-raised);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-float);
          padding: 1.25rem;
        }

        @media (min-width: 640px) {
          .cookie-consent-overlay { align-items: center; }
        }

        @media (prefers-reduced-motion: no-preference) {
          .cookie-consent-modal { animation: cookie-consent-in 250ms ease-out both; }
        }

        @keyframes cookie-consent-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .cookie-consent-title {
          font-size: var(--text-lg);
          font-weight: var(--font-weight-emphasis);
          color: var(--text-default);
          margin: 0 0 0.5rem;
        }

        .cookie-consent-text {
          font-size: var(--text-sm);
          font-weight: var(--font-weight-subdue);
          color: var(--text-subdue);
          line-height: 1.5;
          margin: 0 0 1rem;
        }

        .cookie-consent-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
        }

        .cookie-consent-button {
          appearance: none;
          cursor: pointer;
          font-family: var(--font-sans);
          font-weight: 600;
          font-size: var(--text-sm);
          border-radius: var(--radius-sm);
          padding: 0.5rem 0.875rem;
          border: 1px solid transparent;
          transition: background-color 120ms ease, border-color 120ms ease, filter 120ms ease;
        }

        .cookie-consent-button:focus-visible {
          outline: 2px solid var(--color-accent);
          outline-offset: 2px;
        }

        .cookie-consent-button--ghost {
          background: var(--surface-raised);
          color: var(--text-default);
          border-color: var(--border-default);
        }

        .cookie-consent-button--ghost:hover { background: var(--surface-subdue); }

        .cookie-consent-button--primary {
          background: var(--color-accent);
          color: var(--color-white);
          border-color: var(--color-accent);
        }

        .cookie-consent-button--primary:hover { background: var(--color-accent-hover); border-color: var(--color-accent-hover); }
      `}</style>
      <div
        class="cookie-consent-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-consent-title"
        aria-describedby="cookie-consent-text"
      >
        <h2 id="cookie-consent-title" class="cookie-consent-title">Utilisation des cookies</h2>
        <p id="cookie-consent-text" class="cookie-consent-text">
          Nous utilisons Umami pour analyser l'audience du site. Acceptez-vous l'utilisation de cookies à cette fin ?
        </p>
        <div class="cookie-consent-actions">
          <button
            type="button"
            class="cookie-consent-button cookie-consent-button--ghost"
            onClick={() => handleChoice('refused')}
          >
            Refuser
          </button>
          <button
            ref={acceptButtonRef}
            type="button"
            class="cookie-consent-button cookie-consent-button--primary"
            onClick={() => handleChoice('accepted')}
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
