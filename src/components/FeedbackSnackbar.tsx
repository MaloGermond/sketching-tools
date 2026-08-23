import { useState, useEffect, useRef } from 'preact/hooks';
import { trackEvent } from '../lib/analytics';

// ===== TYPES =====

type FeedbackChoice = 'sum-up' | 'sum-down';

interface Props {
  actionThreshold?: number;
}

// ===== CONSTANTS =====

const DEFAULT_ACTION_THRESHOLD = 10;
const ACTION_EVENT_NAME = 'scoreUpdated';
const ACTION_COUNT_KEY = 'feedbackActionCount';
const SUBMITTED_KEY = 'feedbackSubmitted';
const THANK_YOU_DURATION = 1500;

// ===== PURE FUNCTIONS =====

/** @pure */
const shouldShowFeedback = (count: number, threshold: number, alreadySubmitted: boolean): boolean => {
  if (alreadySubmitted) return false;
  return count >= threshold;
};

/** @pure */
const getNextActionCount = (currentCount: number): number => currentCount + 1;

// ===== IMPURE FUNCTIONS =====

/** @impure — side effect: lit le compteur d'actions depuis localStorage */
const readActionCount = (): number => {
  const raw = localStorage.getItem(ACTION_COUNT_KEY);
  const parsed = raw ? parseInt(raw, 10) : 0;
  return Number.isNaN(parsed) ? 0 : parsed;
};

/** @impure — side effect: écrit le compteur d'actions dans localStorage */
const writeActionCount = (count: number): void => {
  localStorage.setItem(ACTION_COUNT_KEY, String(count));
};

/** @impure — side effect: lit le flag "déjà répondu" depuis localStorage */
const readSubmitted = (): boolean => localStorage.getItem(SUBMITTED_KEY) === 'true';

/** @impure — side effect: marque le feedback comme déjà répondu dans localStorage */
const writeSubmitted = (): void => {
  localStorage.setItem(SUBMITTED_KEY, 'true');
};

// ===== COMPONENT =====

export default function FeedbackSnackbar({ actionThreshold = DEFAULT_ACTION_THRESHOLD }: Props) {
  const [visible, setVisible] = useState(false);
  const [thanked, setThanked] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  /** @impure — side effect: incrémente le compteur, affiche la snackbar si le seuil est atteint */
  const handleAction = () => {
    const alreadySubmitted = readSubmitted();
    if (alreadySubmitted) return;

    const nextCount = getNextActionCount(readActionCount());
    writeActionCount(nextCount);

    if (shouldShowFeedback(nextCount, actionThreshold, alreadySubmitted)) {
      setVisible(true);
    }
  };

  useEffect(() => {
    document.addEventListener(ACTION_EVENT_NAME, handleAction);
    return () => document.removeEventListener(ACTION_EVENT_NAME, handleAction);
  }, [actionThreshold]);

  /** @impure — side effect: envoie l'événement Umami, persiste la réponse, ferme la snackbar */
  const handleChoice = (choice: FeedbackChoice) => {
    trackEvent('feedback', { type: choice });
    writeSubmitted();
    setThanked(true);

    setTimeout(() => {
      if (!mountedRef.current) return;
      setVisible(false);
    }, THANK_YOU_DURATION);
  };

  /** @impure — side effect: ferme la snackbar sans envoyer d'événement */
  const handleDismiss = () => setVisible(false);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Formulaire de feedback"
      style={{
        position: 'fixed',
        right: '1rem',
        bottom: '1.5rem',
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 12px',
        background: 'white',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: '#e4e7eb',
        borderRadius: '14px',
        boxShadow: '0 4px 16px rgb(0 0 0 / 0.10), 0 1px 4px rgb(0 0 0 / 0.06)',
      }}
    >
      {thanked ? (
        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#111827', padding: '2px 4px' }}>
          Merci pour votre retour !
        </span>
      ) : (
        <>
          <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#111827', whiteSpace: 'nowrap' }}>
            Do you like it?
          </span>
          <button
            type="button"
            onClick={() => handleChoice('sum-up')}
            aria-label="Sum Up"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 10px',
              background: '#f0fdf4',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: '#bbf7d0',
              borderRadius: '9999px',
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: '#16a34a',
              cursor: 'pointer',
            }}
          >
            👍 Sum Up
          </button>
          <button
            type="button"
            onClick={() => handleChoice('sum-down')}
            aria-label="Sum Down"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 10px',
              background: '#fef2f2',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: '#fecaca',
              borderRadius: '9999px',
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: '#dc2626',
              cursor: 'pointer',
            }}
          >
            👎 Sum Down
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Fermer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '20px',
              height: '20px',
              background: 'transparent',
              border: 'none',
              color: '#9ca3af',
              fontSize: '0.875rem',
              lineHeight: 1,
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </>
      )}
    </div>
  );
}
