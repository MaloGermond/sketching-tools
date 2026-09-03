import { useState, useEffect } from 'preact/hooks';

const OPTIONS = [
  { value: 'light', label: 'Clair' },
  { value: 'dark', label: 'Sombre' },
  { value: 'system', label: 'Système' },
];

function applyTheme(value) {
  if (value === 'light' || value === 'dark') {
    document.documentElement.dataset.theme = value;
  } else {
    delete document.documentElement.dataset.theme;
  }
}

export default function ThemeSwitch() {
  const [selected, setSelected] = useState('system');

  useEffect(() => {
    let stored;
    try {
      stored = localStorage.getItem('theme');
    } catch (e) {}
    setSelected(stored === 'light' || stored === 'dark' ? stored : 'system');
  }, []);

  const handleSelect = (value) => {
    setSelected(value);
    applyTheme(value);
    try {
      if (value === 'system') localStorage.removeItem('theme');
      else localStorage.setItem('theme', value);
    } catch (e) {}
    window.umami?.track('theme_change', { theme: value });
  };

  return (
    <>
      <style>{`
        .theme-switch {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px;
          background: var(--color-gray-200);
          border-radius: 10px;
        }
        .theme-switch-option {
          appearance: none;
          border: none;
          cursor: pointer;
          padding: 8px 14px;
          border-radius: 8px;
          font-family: var(--font-sans);
          font-size: 0.875rem;
          font-weight: 400;
          color: var(--color-gray-500);
          background: transparent;
          transition: background-color 150ms ease, color 150ms ease, box-shadow 150ms ease;
        }
        .theme-switch-option:hover:not(.is-active) {
          color: var(--color-gray-900);
        }
        .theme-switch-option.is-active {
          background: var(--color-gray-100);
          color: var(--color-gray-900);
          font-weight: 600;
          box-shadow: 0 1px 3px rgb(0 0 0 / 0.12);
        }
      `}</style>
      <div class="theme-switch" role="radiogroup" aria-label="Thème de l'application">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected === opt.value}
            class={`theme-switch-option ${selected === opt.value ? 'is-active' : ''}`}
            onClick={() => handleSelect(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </>
  );
}
