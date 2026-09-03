import { useState, useEffect, useRef } from 'preact/hooks';

// ===== TYPES =====

type EntryStatus = 'entering' | 'visible' | 'exiting';

interface ManagedEntry {
  id: number;
  image: string;
  score: number;
  status: EntryStatus;
}

interface ScoreState {
  traces: { image: string; score: number }[];
}

// ===== CONSTANTS =====

const EXIT_DURATION = 300;
const COLLAPSE_DELAY = 10_000;

// ===== PURE FUNCTIONS =====

/** @pure */
const getScoreColor = (score: number): string => {
  if (score >= 80) return 'var(--text-success)';
  if (score >= 50) return 'var(--text-warning)';
  return 'var(--text-error)';
};

/** @pure */
const getCardOpacity = (status: EntryStatus, mounted: boolean, index: number): number => {
  if (status === 'exiting' || (status === 'entering' && !mounted)) return 0;
  return Math.max(0.45, 1 - index * 0.18);
};

/** @pure */
const getCardTransform = (status: EntryStatus, mounted: boolean): string => {
  if (status === 'exiting') return 'translateY(-10px)';
  if (status === 'entering' && !mounted) return 'translateY(14px)';
  return 'translateY(0)';
};

// ===== SUB-COMPONENTS =====

interface SnackbarCardProps {
  entry: ManagedEntry;
  index: number;
}

function SnackbarCard({ entry, index }: SnackbarCardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const opacity = getCardOpacity(entry.status, mounted, index);
  const transform = getCardTransform(entry.status, mounted);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '8px',
      background: 'var(--surface-raised)',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'var(--border-subdue)',
      borderRadius: '14px',
      boxShadow: '0 2px 8px rgb(0 0 0 / 0.06)',
      width: '196px',
      opacity,
      transform,
      transition: 'opacity 300ms ease, transform 350ms cubic-bezier(0.34, 1.56, 0.64, 1)',
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '8px',
        overflow: 'hidden',
        background: 'var(--surface-subdue)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'var(--border-subdue)',
        flexShrink: 0,
      }}>
        <img src={entry.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
        <span style={{ fontSize: '0.625rem', fontWeight: 500, color: 'var(--text-subdue)', letterSpacing: '0.02em' }}>
          Ressemblance
        </span>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text-default)', lineHeight: 1 }}>
            {entry.score}%
          </span>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: getScoreColor(entry.score),
          }} />
        </div>
      </div>
    </div>
  );
}

// ===== STACK VISUAL =====

interface CollapsedStackProps {
  entries: ManagedEntry[];
  visible: boolean;
}

function CollapsedStack({ entries, visible }: CollapsedStackProps) {
  const visibleEntries = entries.filter(e => e.status !== 'exiting').slice(0, 3);

  return (
    <div style={{
      position: 'relative',
      width: '60px',
      height: '60px',
      opacity: visible ? 1 : 0,
      pointerEvents: visible ? 'auto' : 'none',
      transform: visible ? 'scale(1)' : 'scale(0.85)',
      transition: 'opacity 250ms ease, transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      cursor: 'pointer',
    }}>
      {/* Back cards (older entries) rendered first, behind */}
      {visibleEntries.slice(1).reverse().map((entry, i) => {
        const depth = visibleEntries.length - 1 - i;
        return (
          <div key={entry.id} style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '60px',
            height: '60px',
            borderRadius: '12px',
            overflow: 'hidden',
            background: 'var(--surface-raised)',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'var(--border-subdue)',
            transform: `translateY(${-depth * 5}px) translateX(${depth * 3}px) rotate(${depth * -2.5}deg)`,
            transformOrigin: 'bottom center',
            opacity: 1 - depth * 0.3,
            zIndex: 3 - depth,
            transition: 'transform 350ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}>
            <img src={entry.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
        );
      })}

      {/* Front card — most recent, on top */}
      {visibleEntries[0] && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '60px',
          height: '60px',
          borderRadius: '12px',
          overflow: 'hidden',
          background: 'var(--surface-raised)',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'var(--border-subdue)',
          boxShadow: '0 4px 12px rgb(0 0 0 / 0.12)',
          zIndex: 3,
          transition: 'transform 350ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}>
          <img src={visibleEntries[0].image} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
      )}
    </div>
  );
}

// ===== MAIN COMPONENT =====

declare global {
  interface Window { scoreState?: ScoreState; }
}

export default function ScoreSnackbar() {
  const [entries, setEntries] = useState<ManagedEntry[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const collapseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idCounter = useRef(0);

  const visibleEntries = entries.filter(e => e.status !== 'exiting');
  const isExpanded = visibleEntries.length > 0 && (!isCollapsed || isHovered);
  const stackVisible = visibleEntries.length > 0 && !isExpanded;

  /** @impure — side effect: reset le timer de collapse */
  const resetCollapseTimer = () => {
    if (collapseTimer.current) clearTimeout(collapseTimer.current);
    setIsCollapsed(false);
    collapseTimer.current = setTimeout(() => setIsCollapsed(true), COLLAPSE_DELAY);
  };

  // Remove exiting entries after animation completes
  useEffect(() => {
    const hasExiting = entries.some(e => e.status === 'exiting');
    if (!hasExiting) return;

    const timer = setTimeout(() => {
      setEntries(prev => prev.filter(e => e.status !== 'exiting'));
    }, EXIT_DURATION + 50);

    return () => clearTimeout(timer);
  }, [entries]);

  useEffect(() => {
    /** @impure — side effect: lit window.scoreState, met à jour les entries */
    const handleScoreUpdated = () => {
      const traces = window.scoreState?.traces?.slice(0, 5) ?? [];
      if (!traces.length) return;

      setEntries(prev => {
        const newEntry: ManagedEntry = {
          id: ++idCounter.current,
          image: traces[0].image,
          score: Math.floor(traces[0].score),
          status: 'entering',
        };

        // Keep up to 4 previous visible entries, shift them to visible
        const kept = prev
          .filter(e => e.status !== 'exiting')
          .slice(0, 4)
          .map(e => ({ ...e, status: 'visible' as EntryStatus }));

        // Drop the 5th+ as exiting
        const dropped = prev
          .filter(e => e.status !== 'exiting')
          .slice(4)
          .map(e => ({ ...e, status: 'exiting' as EntryStatus }));

        return [newEntry, ...kept, ...dropped];
      });

      resetCollapseTimer();
    };

    document.addEventListener('scoreUpdated', handleScoreUpdated);
    return () => document.removeEventListener('scoreUpdated', handleScoreUpdated);
  }, []);

  if (entries.length === 0) return null;

  return (
    <div
      style={{ position: 'fixed', left: '1rem', bottom: '1.5rem', zIndex: 10 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CollapsedStack entries={entries} visible={stackVisible} />

      {/* Expanded list */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        display: 'flex',
        flexDirection: 'column-reverse',
        gap: '6px',
        opacity: isExpanded ? 1 : 0,
        pointerEvents: isExpanded ? 'auto' : 'none',
        transition: 'opacity 200ms ease',
      }}>
        {entries.map((entry, i) => (
          <SnackbarCard key={entry.id} entry={entry} index={i} />
        ))}
      </div>
    </div>
  );
}
