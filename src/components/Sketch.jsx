import { useEffect, useRef } from 'preact/compat';
import p5 from 'p5';

export default function Sketch({ size = 400 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Nettoyer les instances précédentes de p5
    const existingCanvas = containerRef.current.querySelector('canvas');
    if (existingCanvas) {
      existingCanvas.remove();
    }

    // Créer une nouvelle instance de p5
    new p5((p) => {
      p.setup = () => {
        p.createCanvas(size, size);
      };

      p.draw = () => {
        p.background(220);
        p.fill(0);
        p.ellipse(p.mouseX, p.mouseY, 20, 20);
      };
    }, containerRef.current);

    // Nettoyage à la désactivation du composant
    return () => {
      const canvas = containerRef.current?.querySelector('canvas');
      if (canvas) {
        canvas.remove();
      }
    };
  }, [size]);

  return <div ref={containerRef} style={{ width: size, height: size }} />;
}
