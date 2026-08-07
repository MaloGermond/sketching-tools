/**
 * Composant ToggleGroup - Groupe de boutons toggle avec sélection unique
 * 
 * @description
 * Un conteneur pour des boutons Toggle qui gère la sélection unique.
 * Utilise Preact pour la gestion d'état réactive.
 * 
 * @props
 * @prop {string[]} icons - Liste des noms d'icônes à afficher
 * @prop {string} [selectedIcon] - Icône actuellement sélectionnée
 * @prop {string} [groupId] - ID du groupe pour l'élément DOM (défaut: 'toggle-group')
 * @prop {function} [onSelect] - Callback appelé quand une icône est sélectionnée/désélectionnée
 */

import { useState, useEffect } from 'preact/hooks';
import Toggle from './Toggle.jsx';

export default function ToggleGroup({ 
  icons = [], 
  selectedIcon: initialSelectedIcon = '', 
  groupId = 'toggle-group',
  onSelect
}) {
  const [selected, setSelected] = useState(initialSelectedIcon);

  // Synchroniser avec les changements externes (ex: shapeSelected de p5.js)
  useEffect(() => {
    const handleShapeSelected = (event) => {
      if (event.detail?.shape) {
        setSelected(event.detail.shape);
      }
    };

    document.addEventListener('shapeSelected', handleShapeSelected);
    
    return () => {
      document.removeEventListener('shapeSelected', handleShapeSelected);
    };
  }, []);

  // Mettre à jour selected si la prop change
  useEffect(() => {
    setSelected(initialSelectedIcon);
  }, [initialSelectedIcon]);

  const handleToggleClick = (icon) => {
    // Si on clique sur l'icône déjà sélectionnée, la désélectionner
    // Sinon, la sélectionner
    const newSelected = selected === icon ? null : icon;
    setSelected(newSelected);
    
    // Appeler le callback si fourni
    if (onSelect) {
      onSelect(newSelected);
    }
    
    // Dispatcher l'événement pour la compatibilité
    document.dispatchEvent(new CustomEvent('toggleGroupSelected', {
      detail: { icon: newSelected }
    }));
  };

  return (
    <>
      <style>
        {`
          .toggle-button {
            --toggle-bg-enable: transparent;
            --toggle-bg-hover: var(--color-gray-300);
            --toggle-bg-selected: var(--color-accent);
            
            background: var(--toggle-bg-enable);
            transition: background 400ms ease;
          }
          
          .toggle-button:hover:not([data-selected="true"]) {
            background: var(--toggle-bg-hover);
          }
          
          .toggle-button[data-selected="true"] {
            background: var(--toggle-bg-selected);
          }
        `}
      </style>
      
      <div id={groupId} class="flex gap-2">
        {icons.map((icon) => (
          <Toggle
            key={icon}
            icon={icon}
            selected={selected === icon}
            onClick={() => handleToggleClick(icon)}
          />
        ))}
      </div>
    </>
  );
}
