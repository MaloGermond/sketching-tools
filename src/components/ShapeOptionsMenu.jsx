import { useEffect, useRef, useState } from 'preact/hooks';

const SHAPE_LABELS = {
  circle: 'Cercle',
  square: 'Carré',
  triangle: 'Triangle',
  ellipse: 'Ovale',
  'horizontal-line': 'Ligne horizontale',
  'vertical-line': 'Ligne verticale',
};

const iconUrl = (icon) => `${import.meta.env.BASE_URL.replace(/\/$/, '')}/icons/${icon}.svg`;

// Menu "..." donnant accès à toutes les options d'entraînement du Warm-Up,
// y compris celles masquées par la barre selon la taille d'écran.
export default function ShapeOptionsMenu({ icons = [], selectedIcon = null, groupId = 'shape-options-menu' }) {
  const [selected, setSelected] = useState(selectedIcon);
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleShapeSelected = (event) => {
      if (event.detail?.shape) setSelected(event.detail.shape);
    };
    // Reste synchronisé quand la sélection vient de la barre d'outils
    // plutôt que de ce menu.
    const handleToggleGroupSelected = (event) => {
      if (event.detail?.icon) setSelected(event.detail.icon);
    };
    document.addEventListener('shapeSelected', handleShapeSelected);
    document.addEventListener('toggleGroupSelected', handleToggleGroupSelected);
    return () => {
      document.removeEventListener('shapeSelected', handleShapeSelected);
      document.removeEventListener('toggleGroupSelected', handleToggleGroupSelected);
    };
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

  const handleSelect = (icon) => {
    setMenuOpen(false);
    document.dispatchEvent(new CustomEvent('toggleGroupSelected', { detail: { icon } }));
  };

  return (
    <div id={groupId} class="shape-options-menu" ref={wrapperRef}>
      <style>{`
        .shape-options-menu {
          position: relative;
        }
        .shape-options-menu-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border: none;
          border-radius: 10px;
          background: transparent;
          color: var(--text-default);
          font-size: 1rem;
          line-height: 1;
          cursor: pointer;
          padding: 0;
          transition: background-color 150ms ease;
        }
        .shape-options-menu-btn:hover {
          background: var(--surface-subdue);
        }
        .shape-options-overlay {
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
        .shape-options-item {
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
        .shape-options-item:hover {
          background: var(--surface-subdue);
        }
        .shape-options-item[data-selected="true"] {
          background: var(--color-accent);
          color: var(--color-white);
        }
        .shape-options-item img {
          opacity: 0.75;
          filter: var(--icon-filter);
        }
        .shape-options-item[data-selected="true"] img {
          opacity: 1;
          filter: brightness(0) invert(1);
        }
      `}</style>
      <button
        type="button"
        class="shape-options-menu-btn"
        title="Toutes les options d'entraînement"
        aria-label="Toutes les options d'entraînement"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        •••
      </button>
      {menuOpen && (
        <div class="shape-options-overlay">
          {icons.map((icon) => (
            <button
              key={icon}
              type="button"
              class="shape-options-item"
              data-selected={selected === icon ? 'true' : 'false'}
              onClick={() => handleSelect(icon)}
            >
              <img src={iconUrl(icon)} alt="" width={16} height={16} />
              {SHAPE_LABELS[icon] || icon}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
