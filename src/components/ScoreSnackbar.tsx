import { useState, useEffect, useRef } from 'preact/hooks';

// ===== TYPES =====

interface Entry {
  id: number;
  image: string;
  score: number;
}

interface ScoreState {
  traces: { image: string; score: number }[];
  average: number;
}

// ===== PURE FUNCTIONS =====

/** @pure */
const getScoreColor = (score: number): string => {
  if (score >= 80) return '#22C55E';
  if (score >= 50) return '#FACC15';
  return '#EF4444';
};

/** @pure */
const stackCardStyle = (index: number): Record<string, string | number> => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  width: '52px',
  height: '52px',
  borderRadius: '12px',
  overflow: 'hidden',
  background: 'white',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: '#e4e7eb',
  boxShadow: '0 2px 8px rgb(0 0 0 / 0.08)',
  transform: `translateY(${-index * 5}px) translateX(${index * 2}px) rotate(${index * -2}deg) scale(${1 - index * 0.04})`,
  transformOrigin: 'bottom center',
  opacity: 1 - index * 0.25,
  zIndex: 3 - index,
  transition: 'transform 350ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 300ms ease',
});

// ===== SUB-COMPONENTS =====

interface SnackbarCardProps {
  entry: Entry;
  index: number;
  total: number;
}

function SnackbarCard({ entry, index, total }: SnackbarCardProps) {
  const isLatest = index === 0;
  const age = total - 1 - index;
  const opacity = isLatest ? 1 : Math.max(0.5, 1 - age * 0.15);

  const cardStyle: Record<string, string | number> = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px',
    background: 'white',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#e4e7eb',
    borderRadius: '14px',
    boxShadow: '0 2px 8px rgb(0 0 0 / 0.06)',
    width: '196px',
    opacity,
    transition: 'opacity 300ms ease',
  };

  const thumbStyle: Record<string, string | number> = {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    overflow: 'hidden',
    background: '#f9fafb',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#f2f4f6',
    flexShrink: 0,
  };

  const dotStyle: Record<string, string | number> = {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: getScoreColor(entry.score),
    flexShrink: 0,
  };

  return (
    <div style={cardStyle}>
      <div style={thumbStyle}>
        <img src={entry.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
        <span style={{ fontSize: '0.625rem', fontWeight: 500, color: '#9ca3af', letterSpacing: '0.02em' }}>
          Ressemblance
        </span>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111827', lineHeight: 1 }}>
            {entry.score}%
          </span>
          <div style={dotStyle} />
        </div>
      </div>
    </div>
  );
}

// ===== COMPONENT =====

declare global {
  interface Window { scoreState?: ScoreState; }
}

export default function ScoreSnackbar() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const collapseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idCounter = useRef(0);

  const isExpanded = entries.length > 0 && (!isCollapsed || isHovered);

  /** @impure — side effect: reset le timer de collapse */
  const resetCollapseTimer = () => {
    if (collapseTimer.current) clearTimeout(collapseTimer.current);
    setIsCollapsed(false);
    collapseTimer.current = setTimeout(() => setIsCollapsed(true), 10_000);
  };

  useEffect(() => {
    /** @impure — side effect: lit window.scoreState, met à jour les entries */
    const handleScoreUpdated = () => {
      const traces = window.scoreState?.traces?.slice(0, 5) ?? [];
      if (!traces.length) return;

      setEntries(traces.map((t, i) => ({
        id: idCounter.current * 10 + i,
        image: t.image,
        score: Math.floor(t.score),
      })));

      idCounter.current += 1;
      resetCollapseTimer();
    };

    document.addEventListener('scoreUpdated', handleScoreUpdated);
    return () => document.removeEventListener('scoreUpdated', handleScoreUpdated);
  }, []);

  if (entries.length === 0) return null;

  const wrapperStyle: Record<string, string | number> = {
    position: 'fixed',
    left: '1rem',
    bottom: '1.5rem',
    zIndex: 10,
  };

  // ── Collapsed: stack de cartes ──
  const stackVisible = entries.length > 0 && !isExpanded;
  const listVisible = isExpanded;

  return (
    <div
      style={wrapperStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Stack collapsed */}
      <div style={{
        position: 'relative',
        width: '52px',
        height: '52px',
        opacity: stackVisible ? 1 : 0,
        pointerEvents: stackVisible ? 'auto' : 'none',
        transform: stackVisible ? 'scale(1)' : 'scale(0.85)',
        transition: 'opacity 250ms ease, transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        cursor: 'pointer',
      }}>
        {entries.slice(0, 3).reverse().map((entry, i) => (
          <div key={entry.id} style={stackCardStyle(2 - i)}>
            <img src={entry.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
        ))}
      </div>

      {/* List expanded */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        display: 'flex',
        flexDirection: 'column-reverse',
        gap: '6px',
        opacity: listVisible ? 1 : 0,
        pointerEvents: listVisible ? 'auto' : 'none',
        transform: listVisible ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 250ms ease, transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
        {entries.map((entry, i) => (
          <SnackbarCard key={entry.id} entry={entry} index={i} total={entries.length} />
        ))}
      </div>
    </div>
  );
}
