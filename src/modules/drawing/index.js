// ============================================
// Module: Drawing
// Module principal pour gérer le tracé
// Exporte toutes les fonctionnalités de dessin
// ============================================

export * from './drawingBuffer.js';
export * from './drawingState.js';

/**
 * Configuration par défaut du module drawing
 */
export const DEFAULT_CONFIG = {
  brushSize: 6,
  brushSpacing: 2,
  minTraceLength: 20
};
