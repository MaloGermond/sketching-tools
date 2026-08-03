import React, { useEffect, useRef, useState } from 'react';
import p5 from 'p5';

interface CanvasP5Props {
  width?: number;
  height?: number;
  sketchPath: string;
  modulePaths?: string[];
  className?: string;
}

// Type pour la fonction sketch p5
interface P5SketchFunction {
  (p: p5): void;
}

// Type étendu pour window avec nos modules
interface WindowWithModules extends Window {
  [key: string]: any;
}

const CanvasP5: React.FC<CanvasP5Props> = ({
  width = 800,
  height = 600,
  sketchPath,
  modulePaths = [],
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sketchRef = useRef<p5 | null>(null);

  useEffect(() => {
    const loadModulesAndSketch = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Charger les modules d'abord
        const loadedModules: Promise<void>[] = [];
        
        for (const modulePath of modulePaths) {
          const modulePromise = import(/* @vite-ignore */ modulePath)
            .then((module) => {
              // Copier les exports du module dans window pour que le sketch y ait accès
              for (const [key, value] of Object.entries(module)) {
                (window as WindowWithModules)[key] = value;
              }
            })
            .catch((err) => {
              console.error(`Failed to load module ${modulePath}:`, err);
              throw err;
            });
          loadedModules.push(modulePromise);
        }

        // Attendre que tous les modules soient chargés
        await Promise.all(loadedModules);

        // Charger le sketch principal
        const sketchModule = await import(/* @vite-ignore */ sketchPath);
        
        // Le sketch peut être exporté comme default ou comme une fonction nommée
        let sketchFn: P5SketchFunction | undefined;
        
        if (sketchModule.default) {
          sketchFn = sketchModule.default;
        } else {
          // Chercher une fonction qui pourrait être le sketch
          for (const [key, value] of Object.entries(sketchModule)) {
            if (typeof value === 'function') {
              sketchFn = value as P5SketchFunction;
              break;
            }
          }
        }

        if (!sketchFn) {
          throw new Error(`No sketch function found in ${sketchPath}`);
        }

        // Créer l'instance p5
        if (containerRef.current) {
          // Nettoyer l'ancien sketch si nécessaire
          if (sketchRef.current) {
            sketchRef.current.remove();
          }

          const p5Instance = new p5(sketchFn, containerRef.current);
          sketchRef.current = p5Instance;
          
          // Redimensionner le canvas si des dimensions sont spécifiées
          if (width && height) {
            p5Instance.resizeCanvas(width, height);
          }
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error loading sketch:', err);
        setError(`Failed to load sketch: ${err instanceof Error ? err.message : String(err)}`);
        setIsLoading(false);
      }
    };

    loadModulesAndSketch();

    // Cleanup
    return () => {
      if (sketchRef.current) {
        sketchRef.current.remove();
        sketchRef.current = null;
      }
    };
  }, [sketchPath, modulePaths, width, height]);

  // Re-render si les dimensions changent
  useEffect(() => {
    if (sketchRef.current && width && height) {
      sketchRef.current.resizeCanvas(width, height);
    }
  }, [width, height]);

  if (isLoading) {
    return (
      <div className={`p5-container ${className}`} style={{ width, height, position: 'relative' }}>
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          color: '#666' 
        }}>
          Chargement du sketch...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p5-container ${className}`} style={{ width, height, position: 'relative' }}>
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          color: '#ff4444',
          background: '#ffeeee',
          padding: '1rem',
          borderRadius: '4px'
        }}>
          Erreur: {error}
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`p5-container ${className}`}
      style={{ width, height, position: 'relative' }}
    />
  );
};

export default CanvasP5;
