import { useState, useEffect, useRef } from 'preact/hooks';

interface Props {
  toastId: string;
}

// ===== PURE FUNCTIONS =====

/** @pure */
const getScoreColor = (score: number): string => {
  const style = getComputedStyle(document.documentElement);
  if (score >= 80) return style.getPropertyValue('--text-success').trim();
  if (score >= 50) return style.getPropertyValue('--text-warning').trim();
  return style.getPropertyValue('--text-error').trim();
};

/** @pure */
const getWrapperStyle = (visible: boolean): Record<string, string | number> => ({
  position: 'fixed',
  top: '1rem',
  left: '50%',
  zIndex: 50,
  pointerEvents: 'none',
  transform: visible
    ? 'translateX(-50%) translateY(0)'
    : 'translateX(-50%) translateY(calc(-100% - 2rem))',
  opacity: visible ? 1 : 0,
  transition: visible
    ? 'transform 380ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 250ms ease-out'
    : 'transform 200ms ease-in, opacity 200ms ease-in',
});

const chipStyle: Record<string, string | number> = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '6px 12px',
  background: 'var(--surface-raised)',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'var(--border-default)',
  borderRadius: '9999px',
  boxShadow: '0 4px 16px rgb(0 0 0 / 0.10), 0 1px 4px rgb(0 0 0 / 0.06)',
  whiteSpace: 'nowrap',
};

const textRowStyle: Record<string, string | number> = {
  display: 'flex',
  flexDirection: 'row',
  gap: '1px',
  alignItems: 'baseline',
};

const valueStyle: Record<string, string | number> = {
  fontSize: '1.125rem',
  fontWeight: 500,
  color: 'var(--text-default)',
  lineHeight: 1,
  margin: 0,
};

const unitStyle: Record<string, string | number> = {
  fontSize: '1.125rem',
  fontWeight: 400,
  color: 'var(--text-subdue)',
  lineHeight: 1,
  margin: 0,
};

// ===== COMPONENT =====

export default function Toast({ toastId }: Props) {
  const [visible, setVisible] = useState(false);
  const [score, setScore] = useState(0);
  const [dotColor, setDotColor] = useState('#22C55E');
  const isVisibleRef = useRef(false);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** @impure — side effect: met à jour le score et la couleur du dot */
  const updateContent = (newScore: number) => {
    setScore(Math.floor(newScore));
    setDotColor(getScoreColor(newScore));
  };

  /** @impure — side effect: cache le toast */
  const hide = () => {
    setVisible(false);
    isVisibleRef.current = false;
  };

  /** @impure — side effect: affiche le toast, schedule un timeout */
  const show = (newScore: number) => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current);

    const doShow = () => {
      updateContent(newScore);
      setVisible(true);
      isVisibleRef.current = true;
      hideTimeout.current = setTimeout(hide, 1800);
    };

    if (isVisibleRef.current) {
      hide();
      setTimeout(doShow, 220);
      return;
    }

    doShow();
  };

  useEffect(() => {
    /** @impure — side effect: écoute les events DOM */
    const handleShowToast = (event: Event) => {
      const score = (event as CustomEvent).detail?.score;
      if (score !== undefined) show(score);
    };

    document.addEventListener('showToast', handleShowToast);
    return () => document.removeEventListener('showToast', handleShowToast);
  }, []);

  const dotStyle: Record<string, string | number> = {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    background: dotColor,
    flexShrink: 0,
    transition: 'background 200ms ease',
  };

  return (
    <div id={toastId} style={getWrapperStyle(visible)}>
      <div style={chipStyle}>
        <span style={dotStyle} />
        <div style={textRowStyle}>
          <p style={valueStyle}>{score}</p>
          <p style={unitStyle}>%</p>
        </div>
      </div>
    </div>
  );
}
