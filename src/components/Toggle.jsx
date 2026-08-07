/**
 * Composant Toggle - Bouton bascule avec icône (Preact)
 * 
 * @description
 * Un bouton carré avec icône seule.
 * 
 * @props
 * @prop {string} icon - Nom de l'icône SVG à afficher
 * @prop {boolean} selected - État sélectionné
 * @prop {function} onClick - Callback au clic
 * @prop {number} size - Taille du bouton (défaut: 48)
 */

import { useState } from 'preact/hooks';

export default function Toggle({ 
  icon, 
  selected = false, 
  onClick,
  size = 48
}) {
  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type="button"
      className="toggle-button"
      data-selected={selected ? 'true' : 'false'}
      data-icon={icon}
      onClick={handleClick}
      style={{
        '--toggle-size': `${size}px`,
        width: 'var(--toggle-size)',
        height: 'var(--toggle-size)',
        padding: '0',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <img 
        src={`/icons/${icon}.svg`}
        alt={icon}
        width={size * 0.5}
        height={size * 0.5}
        style="display: inline-block; vertical-align: middle;"
      />
    </button>
  );
}
