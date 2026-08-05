import { useEffect, useState } from 'react';

interface SnackBarProps {
  heading: string;
  body?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
  showProgress?: boolean;
  onDismiss?: () => void;
}

export function SnackBar({
  heading,
  body,
  action,
  duration = 5000,
  showProgress = true,
  onDismiss,
}: SnackBarProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <>
      <style>
        @keyframes snackbar-progress {
          to { width: 0%; }
        }
      </style>
      <div
        className="fixed bottom-4 left-4 max-w-xs w-full"
        role="alert"
        aria-live="polite"
      >
        <div className="flex flex-col gap-1 p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-sm shadow-sm">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-medium text-[var(--color-text)]">{heading}</h3>
            {body && <p className="text-xs text-[var(--color-text-secondary)]">{body}</p>}
          </div>
          
          <div className="flex items-center justify-end gap-2 mt-1">
            {action ? (
              <button
                className="text-xs text-[var(--color-text)] hover:underline"
                onClick={() => {
                  action.onClick();
                  handleDismiss();
                }}
              >
                {action.label}
              </button>
            ) : (
              <button
                className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                onClick={handleDismiss}
                aria-label="Fermer"
              >
                ×
              </button>
            )}
          </div>
          
          {showProgress && (
            <div
              className="h-px bg-[var(--color-text)] opacity-20 mt-2 overflow-hidden"
              style={{
                animation: 'snackbar-progress linear forwards ' + duration + 'ms',
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}