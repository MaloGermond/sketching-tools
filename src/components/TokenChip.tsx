// ===== TYPES =====

type TokenKind = 'background' | 'border' | 'label' | 'radius';

interface TokenChipProps {
  kind: TokenKind;
  value: string;
  name: string;
  refToken: string;
}

// ===== CONSTANTS =====
// Carte de référence toujours sombre (comme --footer-background), pour que
// chaque token soit comparable indépendamment du thème actif de la page.

const CHIP_SIZE = '56px';
const CHIP_RADIUS = '12px';
const INNER_SIZE = '32px';
const INNER_RADIUS = '4px';
const FRAME_BORDER = '1px solid var(--color-gray-800)';
const FRAME_BORDER_HIGHLIGHT = '1px solid var(--color-accent)';

const wrapperStyle: Record<string, string | number> = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.5rem',
};

const baseChipStyle: Record<string, string | number> = {
  width: CHIP_SIZE,
  height: CHIP_SIZE,
  borderRadius: CHIP_RADIUS,
  background: 'var(--background-dark)',
  border: FRAME_BORDER,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const pillStyle: Record<string, string | number> = {
  fontFamily: "'SF Mono', Monaco, monospace",
  fontSize: '0.6875rem',
  color: 'var(--text-light)',
  background: 'var(--background-dark)',
  border: FRAME_BORDER,
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

/** @pure - Style du cadre : accent surligné pour isoler le border-radius, neutre sinon. */
function getChipStyle(kind: TokenKind, value: string): Record<string, string | number> {
  if (kind === 'radius') {
    return { ...baseChipStyle, borderRadius: value, border: FRAME_BORDER_HIGHLIGHT };
  }
  return baseChipStyle;
}

/** @pure - Contenu isolant une seule propriété par nature de token. */
function getInnerStyle(kind: TokenKind, value: string): Record<string, string | number> | null {
  if (kind === 'background') {
    return { width: INNER_SIZE, height: INNER_SIZE, borderRadius: INNER_RADIUS, background: value };
  }
  if (kind === 'border') {
    return { width: INNER_SIZE, height: INNER_SIZE, borderRadius: INNER_RADIUS, border: `1px solid ${value}` };
  }
  return null;
}

// ===== COMPONENT =====

/**
 * Icône de 56x56px illustrant un seul token de style à la fois : fond seul
 * (background), bordure seule (border/stroke), couleur de texte seule (label)
 * ou border-radius appliqué au cadre lui-même et surligné (radius).
 */
export default function TokenChip({ kind, value, name, refToken }: TokenChipProps) {
  if (!kind || !value || !name) return null;

  const innerStyle = getInnerStyle(kind, value);

  return (
    <div style={wrapperStyle}>
      <div style={getChipStyle(kind, value)}>
        {innerStyle && <div style={innerStyle} />}
        {kind === 'label' && (
          <span style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '1.25rem', color: value, lineHeight: 1 }}>
            T
          </span>
        )}
      </div>
      <span style={pillStyle}>{name}</span>
      <span style={refStyle}>{refToken}</span>
    </div>
  );
}
