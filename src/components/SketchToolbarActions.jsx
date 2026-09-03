import { useEffect, useRef, useState } from 'preact/hooks';

const iconUrl = (icon) => `${import.meta.env.BASE_URL.replace(/\/$/, '')}/icons/${icon}.svg`;

// Contenu (annuler/rétablir + menu télécharger/nouveau dessin) à placer dans un <Toolbar>.
export default function SketchToolbarActions() {
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleHistoryChanged = (event) => {
      setCanUndo(!!event.detail?.canUndo);
      setCanRedo(!!event.detail?.canRedo);
    };
    document.addEventListener('sketch:historyChanged', handleHistoryChanged);
    return () => document.removeEventListener('sketch:historyChanged', handleHistoryChanged);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const handlePointerDown = (event) => {
      if (!wrapperRef.current?.contains(event.target)) setMenuOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  const dispatch = (action) => document.dispatchEvent(new CustomEvent(`sketch:${action}`));

  const track = (name) => window.umami?.track(name);

  const handleUndo = () => { if (canUndo) { dispatch('undo'); track('sketch_undo'); } };
  const handleRedo = () => { if (canRedo) { dispatch('redo'); track('sketch_redo'); } };
  const handleNew = () => { dispatch('new'); track('sketch_new'); setMenuOpen(false); };
  const handleDownload = () => { dispatch('download'); track('sketch_download'); setMenuOpen(false); };

  return (
    <>
      <style>{`
        .sketch-toolbar-history {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .sketch-toolbar-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 8px;
          background: var(--surface-subdue);
          color: var(--text-default);
          font-size: 1.125rem;
          line-height: 1;
          cursor: pointer;
          padding: 0;
          transition: background-color 150ms ease, opacity 150ms ease;
        }
        .sketch-toolbar-btn:hover:not(:disabled) {
          background: var(--surface-default);
        }
        .sketch-toolbar-btn:disabled {
          opacity: 0.4;
          cursor: default;
        }
        .sketch-toolbar-divider {
          width: 1px;
          height: 32px;
          background: var(--border-subdue);
        }
        .sketch-toolbar-menu {
          position: relative;
        }
        .sketch-toolbar-menu-btn {
          background: var(--color-accent);
          color: var(--color-white);
          font-size: var(--text-xs);
          font-weight: 700;
          letter-spacing: 0.05em;
        }
        .sketch-toolbar-menu-btn:hover {
          background: var(--color-accent-hover);
        }
        .sketch-toolbar-overlay {
          position: absolute;
          bottom: calc(100% + 0.5rem);
          right: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 6px;
          min-width: 200px;
          background: var(--surface-raised);
          border: 1px solid var(--border-subdue);
          border-radius: 12px;
          box-shadow: 0 4px 16px rgb(0 0 0 / 0.16);
        }
        .sketch-toolbar-menu-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border: none;
          border-radius: 8px;
          background: transparent;
          color: var(--text-default);
          font-family: var(--font-sans);
          font-size: var(--text-sm);
          text-align: left;
          cursor: pointer;
        }
        .sketch-toolbar-menu-item:hover {
          background: var(--surface-subdue);
        }
        .sketch-toolbar-menu-item img {
          opacity: 0.75;
          filter: var(--icon-filter);
        }
      `}</style>
      <div class="sketch-toolbar-history">
        <button
          type="button"
          class="sketch-toolbar-btn"
          disabled={!canUndo}
          title="Annuler"
          aria-label="Annuler"
          onClick={handleUndo}
        >
          ‹
        </button>
        <button
          type="button"
          class="sketch-toolbar-btn"
          disabled={!canRedo}
          title="Rétablir"
          aria-label="Rétablir"
          onClick={handleRedo}
        >
          ›
        </button>
      </div>

      <div class="sketch-toolbar-divider" />

      <div class="sketch-toolbar-menu" ref={wrapperRef}>
        <button
          type="button"
          class="sketch-toolbar-btn sketch-toolbar-menu-btn"
          title="Options"
          aria-label="Options"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          •••
        </button>
        {menuOpen && (
          <div class="sketch-toolbar-overlay">
            <button type="button" class="sketch-toolbar-menu-item" onClick={handleDownload}>
              <img src={iconUrl('download')} alt="" width={14} height={14} />
              Télécharger
            </button>
            <button type="button" class="sketch-toolbar-menu-item" onClick={handleNew}>
              <img src={iconUrl('plus')} alt="" width={14} height={14} />
              Nouveau dessin
            </button>
          </div>
        )}
      </div>
    </>
  );
}
