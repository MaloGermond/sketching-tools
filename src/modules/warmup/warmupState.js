// ============================================
// Module: Warmup State
// Gère l'état global du warm-up (niveau, forme actuelle, historique)
// ============================================

import { SHAPE_TYPES, DEFAULT_SHAPE_SETTINGS } from '../shapes/shapeTypes.js';
import { getAvailableShapes } from '../shapes/shapeRenderer.js';
import { getShapeParams } from '../shapes/shapeParams.js';

/**
 * État global du warm-up
 */
export class WarmupState {
  constructor() {
    this.currentShape = null;
    this.selectedShape = SHAPE_TYPES.CIRCLE;
    this.currentLevel = 1;
    this.scoreHistory = [];
    this.shapeParams = {};
    this.currentScore = null;
    this.shapeSettings = { ...DEFAULT_SHAPE_SETTINGS };
    this.maxHistorySize = 20;
  }

  /**
   * Obtient une nouvelle forme aléatoire
   */
  generateNewShape(level = this.currentLevel, settings = this.shapeSettings) {
    const availableShapes = getAvailableShapes(settings);
    if (availableShapes.length === 0) {
      availableShapes.push(
        SHAPE_TYPES.CIRCLE,
        SHAPE_TYPES.SQUARE,
        SHAPE_TYPES.TRIANGLE,
        SHAPE_TYPES.HORIZONTAL_LINE,
        SHAPE_TYPES.VERTICAL_LINE
      );
    }
    
    this.selectedShape = availableShapes[Math.floor(Math.random() * availableShapes.length)];
    this.currentLevel = level;
    this.shapeParams = this.getShapeParams();
    this.currentShape = this.selectedShape;
    
    return this.selectedShape;
  }

  /**
   * Obtient les paramètres de la forme actuelle
   */
  getShapeParams() {
    return getShapeParams(this.selectedShape, this.currentLevel, window.innerWidth, window.innerHeight);
  }

  /**
   * Définit la forme sélectionnée
   */
  setShape(shape) {
    this.selectedShape = shape;
    this.currentShape = shape;
    this.currentScore = null;
    this.scoreHistory = [];
    this.shapeParams = this.getShapeParams();
  }

  /**
   * Définit le niveau
   */
  setLevel(level) {
    this.currentLevel = parseInt(level);
    this.currentScore = null;
    this.scoreHistory = [];
    this.currentShape = this.generateNewShape();
  }

  /**
   * Définit les paramètres des formes
   */
  setShapeSettings(settings) {
    this.shapeSettings = { ...this.shapeSettings, ...settings };
  }

  /**
   * Active/désactive une forme
   */
  toggleShape(shape) {
    this.shapeSettings[shape] = !this.shapeSettings[shape];
    this.currentShape = this.generateNewShape();
  }

  /**
   * Ajoute un score à l'historique
   */
  addScore(score) {
    this.currentScore = score;
    this.scoreHistory.push(score);
    if (this.scoreHistory.length > this.maxHistorySize) {
      this.scoreHistory.shift();
    }
  }

  /**
   * Réinitialise l'état
   */
  reset() {
    this.currentShape = null;
    this.currentScore = null;
    this.scoreHistory = [];
  }
}

/**
 * Instance globale de l'état du warm-up
 */
export const warmupState = new WarmupState();
