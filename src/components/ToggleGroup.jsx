import { useState, useEffect } from 'preact/hooks';
import Toggle from './Toggle.jsx';

export default function ToggleGroup({
  icons = [],
  selectedIcon: initialSelectedIcon = '',
  groupId = 'toggle-group',
  onSelect
}) {
  const [selected, setSelected] = useState(initialSelectedIcon);

  useEffect(() => {
    const handleShapeSelected = (event) => {
      if (event.detail?.shape) setSelected(event.detail.shape);
    };
    // Garde le groupe synchronisé quand la sélection vient d'ailleurs
    // (ex: menu Ellipsis) plutôt que d'un clic direct sur ce groupe.
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
    setSelected(initialSelectedIcon);
  }, [initialSelectedIcon]);

  const handleToggleClick = (icon) => {
    const newSelected = selected === icon ? null : icon;
    setSelected(newSelected);
    if (onSelect) onSelect(newSelected);
    document.dispatchEvent(new CustomEvent('toggleGroupSelected', {
      detail: { icon: newSelected }
    }));
  };

  return (
    <div id={groupId} style={{ display: 'flex', gap: '0.25rem' }}>
      {icons.map((icon) => (
        <Toggle
          key={icon}
          icon={icon}
          selected={selected === icon}
          onClick={() => handleToggleClick(icon)}
        />
      ))}
    </div>
  );
}
