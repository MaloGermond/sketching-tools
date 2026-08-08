/**
 * SketchLoader - Composant Preact pour charger dynamiquement des sketches p5.js
 * 
 * @param {Object} props
 * @param {string} props.src - URL du script p5.js à charger
 * @param {string} [props.containerId='sketch-container'] - ID du conteneur
 * @param {string} [props.className] - Classes CSS supplémentaires
 * @param {Object} [props.p5Options] - Options à passer à p5.js
 * @returns {JSX.Element}
 */
import { useEffect, useRef } from 'preact/compat';

export default function SketchLoader({ src, containerId = 'sketch-container', className = '', p5Options = {} }) {
  const containerRef = useRef(null);
  const scriptRef = useRef(null);

  useEffect(() => {
    // Créer le conteneur
    if (!containerRef.current) return;

    // Nettoyer les anciens éléments
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }

    // Créer un nouveau conteneur pour le sketch
    const sketchContainer = document.createElement('div');
    sketchContainer.id = containerId;
    sketchContainer.className = `sketch-loader-container ${className}`;
    sketchContainer.style.width = '100%';
    sketchContainer.style.height = '100%';
    containerRef.current.appendChild(sketchContainer);

    // Charger le script p5.js si ce n'est pas déjà fait
    if (!window.p5) {
      const p5Script = document.createElement('script');
      p5Script.src = 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js';
      p5Script.onload = () => {
        loadSketchScript();
      };
      document.head.appendChild(p5Script);
    } else {
      loadSketchScript();
    }

    function loadSketchScript() {
      // Supprimer l'ancien script si il existe
      if (scriptRef.current && scriptRef.current.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current);
      }

      // Créer et charger le script du sketch
      const script = document.createElement('script');
      script.src = src;
      script.type = 'module';
      scriptRef.current = script;
      document.body.appendChild(script);

      // Nettoyer à la suppression du composant
      return () => {
        if (scriptRef.current && scriptRef.current.parentNode) {
          scriptRef.current.parentNode.removeChild(scriptRef.current);
        }
      };
    }

    return () => {
      // Nettoyage
      if (scriptRef.current && scriptRef.current.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current);
      }
    };
  }, [src, containerId, className]);

  return (
    <div 
      ref={containerRef} 
      style={{ width: '100%', height: '100%', minHeight: '400px' }}
    />
  );
}
