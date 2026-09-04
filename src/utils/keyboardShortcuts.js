// Utilitaire générique de gestion des raccourcis clavier.
// Permet de lier des combinaisons de touches (avec modificateurs) à des
// handlers, en bloquant le comportement par défaut du navigateur.
//
// Un raccourci : { key, mod?, shift?, alt?, handler, preventDefault?, allowInEditable? }
// - key : touche cible, ex. 'z' (comparaison insensible à la casse)
// - mod : true si Ctrl (Windows/Linux) ou Cmd (Mac) doit être enfoncée
// - shift / alt : true si la touche doit être enfoncée
// - preventDefault : false pour ne pas bloquer le comportement natif (défaut : true)
// - allowInEditable : true pour rester actif dans un champ éditable (défaut : false)

function isEditableTarget(target) {
  if (!target) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable;
}

function matchesShortcut(event, shortcut) {
  if (event.key.toLowerCase() !== shortcut.key.toLowerCase()) return false;
  const hasMod = event.ctrlKey || event.metaKey;
  if (!!shortcut.mod !== hasMod) return false;
  if (!!shortcut.shift !== event.shiftKey) return false;
  if (!!shortcut.alt !== event.altKey) return false;
  return true;
}

// Enregistre une liste de raccourcis sur `target` et retourne une fonction
// de nettoyage (à appeler dans un cleanup useEffect par exemple).
export function bindKeyboardShortcuts(shortcuts, target = document) {
  function handleKeyDown(event) {
    const editable = isEditableTarget(event.target);
    const shortcut = shortcuts.find(
      (s) => (!editable || s.allowInEditable) && matchesShortcut(event, s)
    );
    if (!shortcut) return;

    if (shortcut.preventDefault !== false) event.preventDefault();
    shortcut.handler(event);
  }

  target.addEventListener('keydown', handleKeyDown);
  return () => target.removeEventListener('keydown', handleKeyDown);
}
