// ============================================
// Module: Warmup Orchestrator
// Orchestre les modules drawing, shapes et scoring
// ============================================

import { createDrawingBuffer, drawSmoothLine } from '../drawing/drawingBuffer.js';
import { BRUSH_CONFIG, MIN_TRACE_LENGTH } from '../drawing/index.js';
import { drawingState } from '../drawing/drawingState.js';
import { warmupState } from './warmupState.js';
import { drawShape, createShapeMask, GUIDE_DISPLAY_STYLE } from '../shapes/shapeRenderer.js';
import { calculateScoreFromBuffer, calculateFinalScore, updateScoreState } from '../scoring/scoring.js';

/**
 * Classe principale du warm-up qui orchestrer les modules
 */
export class WarmupOrchestrator {
  constructor(p5) {
    this.p5 = p5;
    this.drawingBuffer = null;
    this.guideMask = null;
    this.canvasElement = null;
    this.scoreTimeout = null;
  }

  /**
   * Initialisation
   */
  setup() {
    this.p5.pixelDensity(1);
    this.canvasElement = this.p5.createCanvas(this.p5.windowWidth, this.p5.windowHeight);

    this.drawingBuffer = this.p5.createGraphics(this.p5.width, this.p5.height);
    this.drawingBuffer.pixelDensity(1);
    this.drawingBuffer.noSmooth();

    this.p5.background(255);
    this.p5.stroke(0);
    this.p5.strokeWeight(3);
    this.p5.strokeCap(this.p5.ROUND);
    this.p5.strokeJoin(this.p5.ROUND);

    this.p5.frameRate(60);

    // Initialiser l'état
    warmupState.generateNewShape();
  }

  /**
   * Redimensionnement de la fenêtre
   */
  windowResized() {
    this.p5.resizeCanvas(this.p5.windowWidth, this.p5.windowHeight);
    this.drawingBuffer = this.p5.createGraphics(this.p5.width, this.p5.height);
    this.drawingBuffer.pixelDensity(1);
    this.drawingBuffer.noSmooth();
    
    if (warmupState.currentShape !== null) {
      warmupState.shapeParams = warmupState.getShapeParams();
      this.p5.redraw();
    }
  }

  /**
   * Boucle principale de dessin
   */
  draw() {
    this.p5.background(255);

    this.ensureActiveShape();

    if (drawingState.drawing) {
      this.handleUserDrawing();
    }

    this.drawGuideShape();
    this.p5.image(this.drawingBuffer, 0, 0);
  }

  /**
   * Gère le dessin de l'utilisateur
   */
  handleUserDrawing() {
    const d = this.p5.dist(this.p5.mouseX, this.p5.mouseY, drawingState.prevX, drawingState.prevY);

    if (d >= BRUSH_CONFIG.SPACING) {
      const steps = Math.floor(d / BRUSH_CONFIG.SPACING);
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = this.p5.lerp(drawingState.prevX, this.p5.mouseX, t);
        const y = this.p5.lerp(drawingState.prevY, this.p5.mouseY, t);
        this.drawingBuffer.noStroke();
        this.drawingBuffer.fill(0);
        this.drawingBuffer.ellipse(x, y, BRUSH_CONFIG.SIZE, BRUSH_CONFIG.SIZE);
        drawingState.addPoint(x, y);
      }
      drawingState.prevX = this.p5.mouseX;
      drawingState.prevY = this.p5.mouseY;
    }
  }

  /**
   * Assure qu'une forme est active
   */
  ensureActiveShape() {
    if (warmupState.currentShape == null) {
      warmupState.generateNewShape();
    }
  }

  /**
   * Dessine la forme guide
   */
  drawGuideShape() {
    if (warmupState.currentShape === null) return;

    const params = warmupState.shapeParams;
    drawShape(this.p5, params, warmupState.selectedShape, GUIDE_DISPLAY_STYLE);
  }

  /**
   * Traite le tracé terminé
   */
  processCompletedDrawing() {
    if (drawingState.drawing) {
      drawingState.stopDrawing();

      // Vérifier la longueur minimale du tracé
      const traceLength = drawingState.calculateTraceLength();

      if (traceLength < MIN_TRACE_LENGTH) {
        // Tracé trop court, ignorer la validation
        this.drawingBuffer.clear();
        warmupState.generateNewShape();
        this.p5.redraw();
        drawingState.reset();
        return;
      }

      const { onShape, offShape } = this.calculateScore();
      const score = calculateFinalScore(onShape, offShape);

      warmupState.addScore(score);

      // Capturer l'image du buffer et ajouter à l'historique
      if (this.drawingBuffer && this.drawingBuffer.canvas) {
        const imageDataUrl = this.drawingBuffer.canvas.toDataURL('image/png');
        drawingState.addToHistory(imageDataUrl, score);
        
        // Rendre l'historique disponible globalement
        if (typeof window !== 'undefined') {
          window.traceHistory = drawingState.traceHistory;
        }
      }

      updateScoreState(
        warmupState.currentScore,
        warmupState.scoreHistory,
        drawingState.traceHistory
      );

      // Déclencher l'événement pour le toast
      if (typeof document !== 'undefined') {
        document.dispatchEvent(new CustomEvent('showToast', {
          detail: { score: warmupState.currentScore }
        }));
      }

      // Réinitialiser pour une nouvelle forme
      this.p5.setTimeout(() => {
        this.drawingBuffer.clear();
        warmupState.generateNewShape();
        this.p5.redraw();
        drawingState.reset();
      }, 100);
    }
  }

  /**
   * Calcule le score
   */
  calculateScore() {
    this.guideMask = createShapeMask(
      this.p5,
      warmupState.shapeParams,
      warmupState.selectedShape
    );

    return calculateScoreFromBuffer(this.drawingBuffer, this.guideMask);
  }

  /**
   * Gestion des événements souris
   */
  mousePressed() {
    // Vérifier que le clic est bien sur le canvas
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    const event = window.event;
    if (event && event.target) {
      const isOverCanvas = canvas === event.target || canvas.contains(event.target);
      if (!isOverCanvas) return;
    }

    // Clic valide sur le canvas
    this.drawingBuffer.clear();
    drawingState.startDrawing(this.p5.mouseX, this.p5.mouseY);
  }

  mouseReleased() {
    if (drawingState.drawing) {
      this.processCompletedDrawing();
    }
  }

  /**
   * Définit la forme sélectionnée
   */
  setShape(shape) {
    warmupState.setShape(shape);
    this.drawingBuffer.clear();
    warmupState.currentScore = null;
    warmupState.scoreHistory = [];
    this.p5.redraw();
    this.notifyShapeSelection();
  }

  /**
   * Définit le niveau
   */
  setLevel(level) {
    warmupState.setLevel(level);
    this.drawingBuffer.clear();
    warmupState.currentScore = null;
    warmupState.scoreHistory = [];
    this.p5.redraw();
  }

  /**
   * Définit les paramètres des formes
   */
  setShapeSettings(settings) {
    warmupState.setShapeSettings(settings);
  }

  /**
   * Active/désactive une forme
   */
  toggleShape(shape) {
    warmupState.toggleShape(shape);
    this.drawingBuffer.clear();
    warmupState.currentScore = null;
    warmupState.scoreHistory = [];
    this.p5.redraw();
  }

  /**
   * Notifie la sélection de forme
   */
  notifyShapeSelection() {
    if (typeof document !== 'undefined' && warmupState.currentShape) {
      document.dispatchEvent(new CustomEvent('shapeSelected', {
        detail: { shape: warmupState.currentShape }
      }));
    }
  }

  /**
   * Initialise les checkboxes des formes
   */
  initShapeCheckboxes() {
    const shapes = [
      SHAPE_TYPES.CIRCLE,
      SHAPE_TYPES.ELLIPSE,
      SHAPE_TYPES.SQUARE,
      SHAPE_TYPES.TRIANGLE,
      SHAPE_TYPES.HORIZONTAL_LINE,
      SHAPE_TYPES.VERTICAL_LINE
    ];
    
    shapes.forEach(shape => {
      const checkbox = document.getElementById(`shape-${shape}`);
      if (checkbox) {
        checkbox.checked = warmupState.shapeSettings[shape] || false;
      }
    });
  }
}

/**
 * Styles de dessin par défaut
 */
export const DRAWING_STYLES = {
  background: 255,
  strokeColor: 0,
  strokeWeight: 3,
  strokeCap: 'ROUND',
  strokeJoin: 'ROUND'
};
