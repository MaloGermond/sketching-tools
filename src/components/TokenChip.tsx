// ===== TYPES =====

type TokenKind = 'background' | 'border' | 'label' | 'radius';

interface TokenChipProps {
  kind: TokenKind;
  value: string;
  name: string;
  refToken: string;
}

// ===== CONSTANTS =====
// Valeurs exactes copiées du dev mode Penpot (ticket #61, page
// "61 - Visualisation standardisée des tokens de style").
// Le cadre (Frame 1) est toujours sombre et fixe, indépendant du thème actif
// de la page, pour que les tokens restent comparables entre eux.

const CHIP_SIZE = '56px';
const CHIP_RADIUS = '12px';
const CHIP_BACKGROUND = '#191919';
const CHIP_BORDER = '1px solid #2A2A2A';
const INNER_SIZE = '32px';
const INNER_RADIUS = '4px';
const DROP_SHADOW = '0px 4px 12px rgba(0, 0, 0, 0.6)';
const RADIUS_BORDER_NEUTRAL = '1px solid #6E6E6E';
const RADIUS_BORDER_ACCENT = '1px solid var(--color-accent)';
// Carré offset pour amener son coin haut-droit (celui qui porte le
// border-radius) au centre du cadre général.
const RADIUS_SQUARE_OFFSET: Record<string, string | number> = {
  position: 'absolute',
  boxSizing: 'border-box',
  width: CHIP_SIZE,
  height: CHIP_SIZE,
  left: `calc(50% - ${CHIP_SIZE})`,
  top: '50%',
  background: CHIP_BACKGROUND,
};
// Masque : ne laisse visible que la zone du coin haut-droit (là où le
// border-radius du carré accent est réellement dessiné).
const RADIUS_MASK_SIZE = '24px';

const wrapperStyle: Record<string, string | number> = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.5rem',
};

const frameStyle: Record<string, string | number> = {
  boxSizing: 'border-box',
  position: 'relative',
  width: CHIP_SIZE,
  height: CHIP_SIZE,
  background: CHIP_BACKGROUND,
  border: CHIP_BORDER,
  borderRadius: CHIP_RADIUS,
  overflow: 'hidden',
  flexShrink: 0,
};

const centeredInnerStyle: Record<string, string | number> = {
  position: 'absolute',
  width: INNER_SIZE,
  height: INNER_SIZE,
  left: `calc(50% - ${INNER_SIZE}/2)`,
  top: `calc(50% - ${INNER_SIZE}/2)`,
};

const pillStyle: Record<string, string | number> = {
  fontFamily: "'SF Mono', Monaco, monospace",
  fontSize: '0.6875rem',
  color: 'var(--text-default)',
  background: 'var(--surface-subdue)',
  borderRadius: '7.5px',
  padding: '0.25rem 0.625rem',
  whiteSpace: 'nowrap',
};

const refStyle: Record<string, string | number> = {
  fontFamily: "'SF Mono', Monaco, monospace",
  fontSize: '0.625rem',
  color: 'var(--text-subdue)',
};

// ===== PURE FUNCTIONS =====

/**
 * @pure - Contenu isolant une seule propriété par nature de token, aux
 * valeurs exactes du dev mode Penpot pour chaque kind.
 */
function renderInner(kind: TokenKind, value: string) {
  if (kind === 'background') {
    return (
      <div style={{ ...centeredInnerStyle, background: value, boxShadow: DROP_SHADOW, borderRadius: INNER_RADIUS }} />
    );
  }

  if (kind === 'border') {
    return (
      <div
        style={{
          ...centeredInnerStyle,
          boxSizing: 'border-box',
          border: `1px solid ${value}`,
          filter: `drop-shadow(${DROP_SHADOW})`,
          borderRadius: INNER_RADIUS,
        }}
      />
    );
  }

  if (kind === 'label') {
    return (
      <span
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          fontFamily: 'Georgia, serif',
          fontWeight: 700,
          fontSize: '1.375rem',
          lineHeight: 1,
          color: value,
          filter: `drop-shadow(${DROP_SHADOW})`,
        }}
      >
        T
      </span>
    );
  }

  if (kind === 'radius') {
    return (
      <>
        {/* Repère neutre : le carré complet, pour situer le coin dans le cadre */}
        <div
          style={{
            ...RADIUS_SQUARE_OFFSET,
            border: RADIUS_BORDER_NEUTRAL,
            borderRadius: value,
            boxShadow: DROP_SHADOW,
          }}
        />
        {/* Même carré, mais masqué pour n'afficher que le coin haut-droit
            (celui qui porte réellement le border-radius) en accent */}
        <div
          style={{
            ...RADIUS_SQUARE_OFFSET,
            border: RADIUS_BORDER_ACCENT,
            borderRadius: value,
            clipPath: `inset(0 0 calc(100% - ${RADIUS_MASK_SIZE}) calc(100% - ${RADIUS_MASK_SIZE}))`,
          }}
        />
      </>
    );
  }

  return null;
}

// ===== COMPONENT =====

/**
 * Cadre de 56x56px illustrant un seul token de style à la fois : fond seul
 * (background), bordure seule (border/stroke), couleur de texte seule (label)
 * ou border-radius appliqué à un second cadre décalé et surligné en accent
 * (radius) — reproduction exacte de la maquette Penpot du ticket #61.
 */
export default function TokenChip({ kind, value, name, refToken }: TokenChipProps) {
  if (!kind || !value || !name) return null;

  return (
    <div style={wrapperStyle}>
      <div style={frameStyle}>{renderInner(kind, value)}</div>
      <span style={pillStyle}>{name}</span>
      <span style={refStyle}>{refToken}</span>
    </div>
  );
}
