// ============================================
// Module: Drawing
// Module principal pour gérer le tracé
// Exporte toutes les fonctionnalités de dessin
// ============================================

export * from './drawingBuffer.js';
export * from './drawingState.js';

export const BRUSH_CONFIG = {
  SIZE: 6,
  SPACING: 2,
};

export const MIN_TRACE_LENGTH = 20;
