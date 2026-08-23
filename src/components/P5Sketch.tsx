import { useEffect, useRef } from 'preact/hooks';
import type p5Type from 'p5';

interface Props {
  src: string;
  width?: number;
  height?: number;
}

const sketches = import.meta.glob('../sketches/*.js');

export default function P5Sketch({ src, width, height }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    let instance: p5Type;

    const w = width ?? ref.current.offsetWidth;
    const h = height ?? ref.current.offsetHeight;

    const key = `../sketches/${src}`;
    const loader = sketches[key];
    if (!loader) {
      console.warn(`[P5Sketch] sketch not found: ${key}`);
      return;
    }

    Promise.all([import('p5'), loader()]).then(([{ default: p5 }, mod]) => {
      if (!ref.current) return;
      instance = new p5((p: p5Type) => {
        mod.default(p);
        const userSetup = p.setup?.bind(p);
        p.setup = function () {
          p.createCanvas(w, h);
          userSetup?.();
        };
      }, ref.current);
    });

    return () => instance?.remove();
  }, [src, width, height]);

  return (
    <div
      ref={ref}
      style={{
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : '100%',
        maxWidth: '100%',
        borderRadius: '12px',
        overflow: 'hidden',
        display: 'block',
      }}
    />
  );
}
