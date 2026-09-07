// ============================================
// Module: Drawing State
// Gère l'état du dessin (position, points, historique)
// ============================================

import { computeMovingAveragePoint } from './drawingBuffer.js';

/**
 * Taille par défaut de la fenêtre de moyenne mobile (lissage phase 2)
 */
export const DEFAULT_SMOOTHING_WINDOW = 3;

/**
 * État du dessin
 */
export class DrawingState {
  constructor(smoothingWindow = DEFAULT_SMOOTHING_WINDOW) {
    this.drawing = false;
    this.prevX = null;
    this.prevY = null;
    this.currentPathPoints = [];
    this.smoothedPoints = [];
    this.smoothingWindow = smoothingWindow;
    this.traceHistory = [];
    this.maxHistorySize = 20;
  }

  /**
   * Démarre un nouveau tracé
   */
  startDrawing(x, y) {
    this.drawing = true;
    this.prevX = x;
    this.prevY = y;
    this.currentPathPoints = [{ x, y }];
    this.smoothedPoints = [{ x, y }];
  }

  /**
   * Arrête le tracé en cours
   */
  stopDrawing() {
    this.drawing = false;
  }

  /**
   * Ajoute un point au tracé actuel et calcule le point lissé correspondant
   * (moyenne mobile sur les `smoothingWindow` derniers points bruts)
   */
  addPoint(x, y) {
    this.currentPathPoints.push({ x, y });
    this.smoothedPoints.push(
      computeMovingAveragePoint(this.currentPathPoints, this.smoothingWindow)
    );
    this.prevX = x;
    this.prevY = y;
  }

  /**
   * Calcule la longueur du tracé actuel
   */
  calculateTraceLength() {
    if (this.currentPathPoints.length < 2) return 0;
    
    let totalLength = 0;
    for (let i = 1; i < this.currentPathPoints.length; i++) {
      const pt1 = this.currentPathPoints[i - 1];
      const pt2 = this.currentPathPoints[i];
      totalLength += Math.sqrt(
        Math.pow(pt2.x - pt1.x, 2) + Math.pow(pt2.y - pt1.y, 2)
      );
    }
    return totalLength;
  }

  /**
   * Ajoute un tracé à l'historique
   */
  addToHistory(imageDataUrl, score) {
    this.traceHistory.unshift({ image: imageDataUrl, score });
    if (this.traceHistory.length > this.maxHistorySize) {
      this.traceHistory.pop();
    }
  }

  /**
   * Efface l'historique
   */
  clearHistory() {
    this.traceHistory = [];
  }

  /**
   * Réinitialise l'état
   */
  reset() {
    this.drawing = false;
    this.prevX = null;
    this.prevY = null;
    this.currentPathPoints = [];
    this.smoothedPoints = [];
  }
}

/**
 * Instance globale de l'état du dessin
 */
export const drawingState = new DrawingState();
