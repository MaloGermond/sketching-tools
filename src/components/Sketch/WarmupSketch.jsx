/**
 * WarmupSketch - Composant Preact pour le sketch d'échauffement
 * 
 * Ce composant encapsule le warm-up avec les modules modularisés.
 * Il peut être utilisé n'importe où dans l'application.
 * 
 * @param {Object} props
 * @param {string} [props.containerId='warmup-sketch-container'] - ID du conteneur
 * @param {string} [props.className] - Classes CSS supplémentaires
 * @param {number} [props.width=800] - Largeur du canvas
 * @param {number} [props.height=600] - Hauteur du canvas
 * @param {Object} [props.initialSettings] - Paramètres initiaux des formes
 * @returns {JSX.Element}
 */
import { useEffect, useRef, useState } from 'preact/compat';
import SketchLoader from './SketchLoader.jsx';

export default function WarmupSketch({
  containerId = 'warmup-sketch-container',
  className = '',
  width = 800,
  height = 600,
  initialSettings = null
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [score, setScore] = useState(null);
  const [averageScore, setAverageScore] = useState(0);
  const [currentShape, setCurrentShape] = useState('circle');
  const containerRef = useRef(null);

  useEffect(() => {
    // Initialiser les paramètres globaux
    window.shapeSettings = initialSettings || {
      'circle': true,
      'square': false,
      'triangle': false,
      'horizontal-line': false,
      'vertical-line': false,
      'ellipse': false
    };

    // Écouter les événements de score
    const handleScoreUpdate = (event) => {
      if (event.detail && event.detail.score !== undefined) {
        setScore(event.detail.score);
      }
    };

    const handleShapeSelected = (event) => {
      if (event.detail && event.detail.shape) {
        setCurrentShape(event.detail.shape);
      }
    };

    document.addEventListener('showToast', handleScoreUpdate);
    document.addEventListener('shapeSelected', handleShapeSelected);

    // Mettre à jour la moyenne du score
    const interval = setInterval(() => {
      if (window.scoreState && window.scoreState.average !== undefined) {
        setAverageScore(window.scoreState.average);
      }
    }, 100);

    setIsLoaded(true);

    return () => {
      document.removeEventListener('showToast', handleScoreUpdate);
      document.removeEventListener('shapeSelected', handleShapeSelected);
      clearInterval(interval);
    };
  }, [initialSettings]);

  if (!isLoaded) {
    return (
      <div className={`warmup-sketch-loading ${className}`} style={{ width, height }}>
        Chargement du sketch...
      </div>
    );
  }

  return (
    <div 
      className={`warmup-sketch-wrapper ${className}`}
      style={{ width, height, position: 'relative' }}
      ref={containerRef}
    >
      {/* Conteneur pour le sketch */}
      <div 
        id={containerId} 
        style={{ width: '100%', height: '100%' }}
      />
      
      {/* Charger le script du sketch */}
      <SketchLoader 
        src="/scripts/sketches/warmup.js" 
        containerId={containerId}
      />

      {/* Afficher les infos de score */}
      <div 
        className="warmup-sketch-info" 
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '10px',
          borderRadius: '5px',
          fontFamily: 'sans-serif',
          fontSize: '14px'
        }}
      >
        <div><strong>Score:</strong> {score !== null ? `${score}%` : '---'}</div>
        <div><strong>Moyenne:</strong> {averageScore}%</div>
        <div><strong>Forme:</strong> {currentShape}</div>
      </div>
    </div>
  );
}
