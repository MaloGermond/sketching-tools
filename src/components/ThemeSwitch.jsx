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

  const baseOptionClasses = "appearance-none border-none cursor-pointer py-2 px-3.5 rounded-md font-sans text-sm [transition:background-color_150ms_ease,color_150ms_ease,box-shadow_150ms_ease]";
  const activeOptionClasses = `${baseOptionClasses} bg-[var(--surface-raised)] text-[var(--text-default)] font-semibold shadow-[0_1px_3px_rgb(0_0_0_/_0.12)]`;
  const inactiveOptionClasses = `${baseOptionClasses} font-normal text-[var(--text-subdue)] bg-transparent hover:text-[var(--text-default)]`;

  return (
    <div
      class="inline-flex items-center gap-1 p-1 bg-[var(--surface-default)] rounded-[10px]"
      role="radiogroup"
      aria-label="Thème de l'application"
    >
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={selected === opt.value}
          class={selected === opt.value ? activeOptionClasses : inactiveOptionClasses}
          onClick={() => handleSelect(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
