import { useState, useEffect, useRef } from 'preact/hooks';

// ===== TYPES =====

interface ShapeProgress {
  level: number;
  recentScores: number[];
}

type ProgressState = Record<string, ShapeProgress>;

// ===== CONSTANTS =====

const STREAK_LENGTH = 10;
const SUCCESS_THRESHOLD = 80;
const FAILURE_THRESHOLD = 50;
const STORAGE_KEY = 'warmup-progress';

const SHAPE_CONFIG: Record<string, { label: string; levels: string[] }> = {
  circle: {
    label: 'Cercle',
    levels: [
      'Centre, taille fixe',
      'Position variable',
      'Taille variable',
      'Rotation aléatoire',
    ],
  },
  ellipse: {
    label: 'Ellipse',
    levels: [
      'Centre, ratio fixe',
      'Position variable',
      'Ratio variable',
      'Rotation aléatoire',
    ],
  },
  square: {
    label: 'Carré',
    levels: [
      'Centre, taille fixe',
      'Position variable',
      'Taille variable',
      'Rotation aléatoire',
    ],
  },
  triangle: {
    label: 'Triangle',
    levels: [
      'Centre, taille fixe',
      'Position variable',
      'Taille variable',
      'Rotation aléatoire',
    ],
  },
  'horizontal-line': {
    label: 'Ligne horiz.',
    levels: [
      'Centre, longueur fixe',
      'Position variable',
      'Longueur variable',
      'Angle variable',
    ],
  },
  'vertical-line': {
    label: 'Ligne vert.',
    levels: [
      'Centre, longueur fixe',
      'Position variable',
      'Longueur variable',
      'Angle variable',
    ],
  },
};

// ===== PURE FUNCTIONS =====

/** @pure */
const loadProgress = (): ProgressState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

/** @pure */
const getShapeProgress = (state: ProgressState, shape: string): ShapeProgress =>
  state[shape] ?? { level: 1, recentScores: [] };

/** @pure */
const countConsecutive = (scores: number[], predicate: (s: number) => boolean): number => {
  let count = 0;
  for (let i = scores.length - 1; i >= 0; i--) {
    if (!predicate(scores[i])) break;
    count++;
  }
  return count;
};

/** @pure */
const getScoreColor = (score: number): string => {
  if (score >= SUCCESS_THRESHOLD) return 'var(--text-success)';
  if (score >= FAILURE_THRESHOLD) return 'var(--text-warning)';
  return 'var(--text-error)';
};

/** @pure */
const getProgressToNext = (scores: number[]): { count: number; direction: 'up' | 'down' | null } => {
  const successStreak = countConsecutive(scores, s => s >= SUCCESS_THRESHOLD);
  const failureStreak = countConsecutive(scores, s => s < FAILURE_THRESHOLD);
  if (successStreak > 0) return { count: successStreak, direction: 'up' };
  if (failureStreak > 0) return { count: failureStreak, direction: 'down' };
  return { count: 0, direction: null };
};

// ===== IMPURE FUNCTIONS =====

/** @impure — side effect: écrit dans localStorage */
const saveProgress = (state: ProgressState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
};

/** @impure — side effect: dispatche levelChanged */
const notifyLevelChange = (level: number): void => {
  document.dispatchEvent(new CustomEvent('levelChanged', { detail: { level } }));
  document.dispatchEvent(new CustomEvent('showToast', { detail: { score: level * 20 } }));
};

// ===== SUB-COMPONENTS =====

interface StreakDotsProps {
  scores: number[];
}

function StreakDots({ scores }: StreakDotsProps) {
  const dots = Array.from({ length: STREAK_LENGTH }, (_, i) => {
    const score = scores[scores.length - STREAK_LENGTH + i];
    return score === undefined ? null : score;
  });

  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      {dots.map((score, i) => (
        <div key={i} style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: score === null
            ? 'var(--border-subdue)'
            : getScoreColor(score),
          flexShrink: 0,
          transition: 'background 200ms ease',
        }} />
      ))}
    </div>
  );
}

interface ShapeRowProps {
  shape: string;
  progress: ShapeProgress;
  isCurrent: boolean;
  appearDelay: number;
}

function ShapeRow({ shape, progress, isCurrent, appearDelay }: ShapeRowProps) {
  const [hovered, setHovered] = useState(false);
  const config = SHAPE_CONFIG[shape];
  if (!config) return null;

  const maxLevel = config.levels.length;
  const levelName = config.levels[progress.level - 1] ?? config.levels[0];
  const { count, direction } = getProgressToNext(progress.recentScores);

  const handleClick = () => {
    if (isCurrent) return;
    document.dispatchEvent(new CustomEvent('toggleGroupSelected', { detail: { icon: shape } }));
  };

  return (
    <div
      class="shape-row-appear"
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: isCurrent ? '10px' : '8px 10px',
        background: isCurrent ? 'var(--surface-raised)' : hovered ? 'var(--surface-subdue)' : 'transparent',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: isCurrent ? 'var(--border-subdue)' : 'transparent',
        borderRadius: '12px',
        transition: 'all 250ms ease',
        cursor: isCurrent ? 'default' : 'pointer',
        animationDelay: `${appearDelay}s`,
      }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isCurrent ? '6px' : '2px' }}>
        <span style={{
          fontSize: isCurrent ? 'var(--text-sm)' : 'var(--text-xs)',
          fontWeight: 600,
          color: isCurrent ? 'var(--text-default)' : 'var(--text-subdue)',
        }}>
          {config.label}
        </span>
        <span style={{
          fontSize: '0.6875rem',
          fontWeight: 500,
          color: isCurrent ? 'var(--text-subdue)' : 'var(--border-default)',
        }}>
          N{progress.level}/{maxLevel}
        </span>
      </div>

      {isCurrent && (
        <>
          <p style={{ fontSize: '0.6875rem', color: 'var(--text-subdue)', marginBottom: '8px', lineHeight: 1.3 }}>
            {levelName}
          </p>
          <StreakDots scores={progress.recentScores} />
          {direction && (
            <p style={{ fontSize: '0.625rem', color: direction === 'up' ? 'var(--text-success)' : 'var(--text-error)', marginTop: '6px' }}>
              {count}/{STREAK_LENGTH} pour {direction === 'up' ? 'monter' : 'descendre'}
            </p>
          )}
        </>
      )}
    </div>
  );
}

// ===== MAIN COMPONENT =====

export default function LevelsPanel() {
  const [progress, setProgress] = useState<ProgressState>({});
  const [currentShape, setCurrentShape] = useState<string>('circle');
  const [hasLoaded, setHasLoaded] = useState(false);
  const progressRef = useRef<ProgressState>({});
  const currentShapeRef = useRef<string>('circle');
  const initialAppearDoneRef = useRef(false);

  useEffect(() => {
    const loaded = loadProgress();
    setProgress(loaded);
    progressRef.current = loaded;
    setHasLoaded(true);
  }, []);

  // Passé true juste après le premier rendu qui affiche les VRAIES cartes
  // (une fois loadProgress() résolu) : seules celles-ci ont le délai décalé
  // (stagger), pas celles qui apparaissent plus tard suite à un changement
  // de forme.
  useEffect(() => {
    if (hasLoaded) initialAppearDoneRef.current = true;
  }, [hasLoaded]);

  useEffect(() => {
    /** @impure — side effect: écoute shapeSettingsUpdated (toolbar click uniquement), synchronise le niveau dans warmup.js */
    const handleShapeSettingsUpdated = (e: Event) => {
      const settings = (e as CustomEvent).detail?.settings;
      if (!settings) return;
      const activeShape = Object.keys(settings).find(k => settings[k]);
      if (!activeShape || !SHAPE_CONFIG[activeShape]) return;

      currentShapeRef.current = activeShape;
      setCurrentShape(activeShape);

      const savedLevel = getShapeProgress(progressRef.current, activeShape).level;
      document.dispatchEvent(new CustomEvent('levelChanged', { detail: { level: savedLevel } }));
    };

    /** @impure — side effect: traite le score après un vrai dessin (showToast = seul event déclenché par processCompletedDrawing) */
    const handleScoreUpdated = (e: Event) => {
      const lastScore = (e as CustomEvent).detail?.score;
      if (lastScore === undefined) return;
      const shape = currentShapeRef.current;
      const state = progressRef.current;
      const shapeProgress = getShapeProgress(state, shape);
      const maxLevel = SHAPE_CONFIG[shape]?.levels.length ?? 4;

      const newScores = [...shapeProgress.recentScores, lastScore].slice(-STREAK_LENGTH);
      const successStreak = countConsecutive(newScores, s => s >= SUCCESS_THRESHOLD);
      const failureStreak = countConsecutive(newScores, s => s < FAILURE_THRESHOLD);

      let newLevel = shapeProgress.level;

      if (successStreak >= STREAK_LENGTH && newLevel < maxLevel) {
        newLevel = newLevel + 1;
        notifyLevelChange(newLevel);
        window.umami?.track('warmup_level_change', { shape, level: newLevel, direction: 'up', streak: successStreak });
      } else if (failureStreak >= STREAK_LENGTH && newLevel > 1) {
        newLevel = newLevel - 1;
        notifyLevelChange(newLevel);
        window.umami?.track('warmup_level_change', { shape, level: newLevel, direction: 'down', streak: failureStreak });
      }

      const newProgress: ShapeProgress = { level: newLevel, recentScores: newLevel !== shapeProgress.level ? [] : newScores };
      const newState = { ...state, [shape]: newProgress };

      progressRef.current = newState;
      setProgress(newState);
      saveProgress(newState);
    };

    document.addEventListener('shapeSettingsUpdated', handleShapeSettingsUpdated);
    document.addEventListener('showToast', handleScoreUpdated);

    return () => {
      document.removeEventListener('shapeSettingsUpdated', handleShapeSettingsUpdated);
      document.removeEventListener('showToast', handleScoreUpdated);
    };
  }, []);

  if (!hasLoaded) return null;

  const activeShapes = Object.keys(SHAPE_CONFIG).filter(
    s => s === currentShape || getShapeProgress(progress, s).level > 1
  );

  if (activeShapes.length === 0) return null;

  // Décalées pour apparaître une par une après la toolbar (délai 0.3s + durée 0.22s, cf. Toolbar.astro)
  let visibleIndex = 0;

  return (
    <div style={{
      position: 'fixed',
      right: '1.25rem',
      top: '50%',
      transform: 'translateY(-50%)',
      zIndex: 10,
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      width: '9rem',
    }}>
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .shape-row-appear {
            animation: shape-row-appear 0.22s ease-out both;
          }
        }
        @keyframes shape-row-appear {
          from { opacity: 0; transform: translateX(10px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
      {Object.keys(SHAPE_CONFIG).map(shape => {
        const shapeProgress = getShapeProgress(progress, shape);
        const isCurrent = shape === currentShape;
        if (!isCurrent && shapeProgress.level === 1 && shapeProgress.recentScores.length === 0) return null;
        const appearDelay = initialAppearDoneRef.current ? 0 : 0.55 + visibleIndex * 0.06;
        visibleIndex++;
        return (
          <ShapeRow
            key={shape}
            shape={shape}
            progress={shapeProgress}
            isCurrent={isCurrent}
            appearDelay={appearDelay}
          />
        );
      })}
    </div>
  );
}
