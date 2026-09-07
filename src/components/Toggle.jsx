export default function Toggle({
  icon,
  selected = false,
  onClick,
  size = 36
}) {
  return (
    <button
      type="button"
      className="inline-flex items-center justify-center border-none rounded-[10px] cursor-pointer p-0 bg-transparent [transition:background-color_150ms_ease] shrink-0 not-data-[selected=true]:hover:bg-[var(--surface-subdue)] data-[selected=true]:bg-[var(--color-accent)]"
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
        style={selected ? 'filter: brightness(0) invert(1)' : 'opacity: 0.7; filter: var(--icon-filter)'}
      />
    </button>
  );
}
