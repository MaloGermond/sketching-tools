import { useEffect } from 'preact/hooks';
import { bindKeyboardShortcuts } from '../utils/keyboardShortcuts';

const dispatchSketch = (action) => document.dispatchEvent(new CustomEvent(`sketch:${action}`));

// Raccourcis clavier globaux de l'outil draft (annuler / rétablir).
// Composant sans rendu, à monter une fois sur la page ; nouvelle entrée du
// tableau pour ajouter d'autres raccourcis.
export default function KeyboardShortcuts() {
  useEffect(() => bindKeyboardShortcuts([
    { key: 'z', mod: true, handler: () => dispatchSketch('undo') },
    { key: 'z', mod: true, shift: true, handler: () => dispatchSketch('redo') },
  ]), []);

  return null;
}
