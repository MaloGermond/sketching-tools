export default function Toggle({
  icon,
  selected = false,
  onClick,
  size = 36
}) {
  return (
    <>
      <style>{`
        .toggle-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          padding: 0;
          background: transparent;
          transition: background-color 150ms ease;
          flex-shrink: 0;
        }
        .toggle-btn:hover:not([data-selected="true"]) {
          background: var(--color-gray-100);
        }
        .toggle-btn[data-selected="true"] {
          background: #54adff;
        }
      `}</style>
      <button
        type="button"
        className="toggle-btn"
        data-selected={selected ? 'true' : 'false'}
        data-icon={icon}
        onClick={onClick}
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <img
          src={`${import.meta.env.BASE_URL.replace(/\/$/, '')}/icons/${icon}.svg`}
          alt={icon}
          width={size * 0.5}
          height={size * 0.5}
          style={selected ? 'filter: brightness(0) invert(1)' : 'opacity: 0.7'}
        />
      </button>
    </>
  );
}
