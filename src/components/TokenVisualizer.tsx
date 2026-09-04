// ===== TYPES =====

type TokenType = 'border-radius' | 'background' | 'stroke' | 'box-shadow';

interface TokenVisualizerProps {
  tokenType: TokenType;
  value: string;
  label: string;
}

// ===== CONSTANTS =====

const SQUARE_SIZE = '100px';
const HIGHLIGHT_COLOR = 'var(--color-accent)';
const NEUTRAL_FILL = 'var(--surface-subdue)';

const baseSquareStyle: Record<string, string | number> = {
  width: SQUARE_SIZE,
  height: SQUARE_SIZE,
  flexShrink: 0,
};

const wrapperStyle: Record<string, string | number> = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.5rem',
};

const labelStyle: Record<string, string | number> = {
  fontFamily: "'SF Mono', Monaco, monospace",
  fontSize: '0.6875rem',
  color: 'var(--text-subdue)',
  textAlign: 'center',
};

// ===== PURE FUNCTIONS =====

/**
 * @pure - Calcule le style du carré pour n'exposer qu'une seule propriété
 * visuelle à la fois (border-radius, background, stroke ou box-shadow).
 */
function getSquareStyle(tokenType: TokenType, value: string): Record<string, string | number> {
  if (tokenType === 'border-radius') {
    return {
      ...baseSquareStyle,
      background: NEUTRAL_FILL,
      borderTopLeftRadius: value,
      borderTop: `2px solid ${HIGHLIGHT_COLOR}`,
      borderLeft: `2px solid ${HIGHLIGHT_COLOR}`,
    };
  }

  if (tokenType === 'background') {
    return { ...baseSquareStyle, background: value };
  }

  if (tokenType === 'stroke') {
    return { ...baseSquareStyle, border: value };
  }

  return { ...baseSquareStyle, boxShadow: value };
}

// ===== COMPONENT =====

/**
 * Carré de taille fixe illustrant un seul token de style à la fois, pour
 * comparer visuellement border-radius, background, stroke et box-shadow
 * sans distraction (une seule propriété appliquée par carré).
 */
export default function TokenVisualizer({ tokenType, value, label }: TokenVisualizerProps) {
  if (!tokenType || !value) return null;

  return (
    <div style={wrapperStyle}>
      <div style={getSquareStyle(tokenType, value)} />
      <p style={labelStyle}>{label}</p>
    </div>
  );
}
