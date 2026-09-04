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

  const btnClasses = "inline-flex items-center justify-center w-8 h-8 border-none rounded-md bg-[var(--surface-subdue)] text-[var(--text-default)] text-lg leading-none cursor-pointer p-0 [transition:background-color_150ms_ease,opacity_150ms_ease] not-disabled:hover:bg-[var(--surface-default)] disabled:opacity-40 disabled:cursor-default";
  const menuBtnClasses = `${btnClasses} bg-[var(--color-accent)] text-white text-xs font-bold tracking-[0.05em] hover:bg-[var(--color-accent-hover)]`;
  const menuItemClasses = "flex items-center gap-2.5 py-2 px-2.5 border-none rounded-md bg-transparent text-[var(--text-default)] font-sans text-sm text-left cursor-pointer hover:bg-[var(--surface-subdue)]";

  return (
    <>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class={btnClasses}
          disabled={!canUndo}
          title="Annuler"
          aria-label="Annuler"
          onClick={handleUndo}
        >
          ‹
        </button>
        <button
          type="button"
          class={btnClasses}
          disabled={!canRedo}
          title="Rétablir"
          aria-label="Rétablir"
          onClick={handleRedo}
        >
          ›
        </button>
      </div>

      <div class="w-px h-8 bg-[var(--border-subdue)]" />

      <div class="relative" ref={wrapperRef}>
        <button
          type="button"
          class={menuBtnClasses}
          title="Options"
          aria-label="Options"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          •••
        </button>
        {menuOpen && (
          <div class="absolute bottom-[calc(100%+0.5rem)] right-0 flex flex-col gap-0.5 p-1.5 min-w-[200px] bg-[var(--surface-raised)] border border-[var(--border-subdue)] rounded-lg shadow-[0_4px_16px_rgb(0_0_0_/_0.16)]">
            <button type="button" class={menuItemClasses} onClick={handleDownload}>
              <img src={iconUrl('download')} alt="" width={14} height={14} class="opacity-75 [filter:var(--icon-filter)]" />
              Télécharger
            </button>
            <button type="button" class={menuItemClasses} onClick={handleNew}>
              <img src={iconUrl('plus')} alt="" width={14} height={14} class="opacity-75 [filter:var(--icon-filter)]" />
              Nouveau dessin
            </button>
          </div>
        )}
      </div>
    </>
  );
}
