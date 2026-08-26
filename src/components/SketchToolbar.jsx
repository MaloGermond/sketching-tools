import { useEffect, useState } from 'preact/hooks';

const ACTIONS = [
  { action: 'undo', icon: 'undo', label: 'Annuler' },
  { action: 'redo', icon: 'redo', label: 'Rétablir' },
  { action: 'new', icon: 'plus', label: 'Nouveau dessin' },
  { action: 'download', icon: 'download', label: 'Télécharger' },
];

export default function SketchToolbar() {
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  useEffect(() => {
    const handleHistoryChanged = (event) => {
      setCanUndo(!!event.detail?.canUndo);
      setCanRedo(!!event.detail?.canRedo);
    };
    document.addEventListener('sketch:historyChanged', handleHistoryChanged);
    return () => document.removeEventListener('sketch:historyChanged', handleHistoryChanged);
  }, []);

  const isDisabled = (action) => {
    if (action === 'undo') return !canUndo;
    if (action === 'redo') return !canRedo;
    return false;
  };

  const handleClick = (action) => {
    if (isDisabled(action)) return;
    document.dispatchEvent(new CustomEvent(`sketch:${action}`));
  };

  return (
    <>
      <style>{`
        .sketch-toolbar {
          position: fixed;
          bottom: 1.5rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          background: #ffffff;
          border-radius: 9999px;
          padding: 0.5rem;
          box-shadow: 0 4px 16px rgb(0 0 0 / 0.08), 0 1px 4px rgb(0 0 0 / 0.04);
          border: 1px solid var(--color-gray-200);
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        .sketch-toolbar-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          padding: 0;
          background: transparent;
          transition: background-color 150ms ease, opacity 150ms ease;
        }
        .sketch-toolbar-btn:hover:not(:disabled) {
          background: var(--color-gray-100);
        }
        .sketch-toolbar-btn:disabled {
          opacity: 0.35;
          cursor: default;
        }
        .sketch-toolbar-divider {
          width: 1px;
          height: 24px;
          background: var(--color-gray-200);
          margin: 0 0.25rem;
        }
      `}</style>
      <div class="sketch-toolbar">
        {ACTIONS.map((item, index) => (
          <>
            {index === 2 && <div class="sketch-toolbar-divider" key="divider" />}
            <button
              key={item.action}
              type="button"
              class="sketch-toolbar-btn"
              disabled={isDisabled(item.action)}
              title={item.label}
              aria-label={item.label}
              onClick={() => handleClick(item.action)}
            >
              <img
                src={`${import.meta.env.BASE_URL.replace(/\/$/, '')}/icons/${item.icon}.svg`}
                alt=""
                width={20}
                height={20}
                style={{ opacity: isDisabled(item.action) ? 0.4 : 0.75 }}
              />
            </button>
          </>
        ))}
      </div>
    </>
  );
}
