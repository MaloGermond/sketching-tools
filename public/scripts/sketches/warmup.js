// ============================================
// Warmup Sketch - Version Modulaire
// Utilise les modules: drawing, shapes, scoring, warmup
// ============================================

import { WarmupOrchestrator, DRAWING_STYLES } from '/src/modules/warmup/warmupOrchestrator.js';
import { warmupState } from '/src/modules/warmup/warmupState.js';
import { drawingState } from '/src/modules/drawing/drawingState.js';
import { SHAPE_TYPES, DEFAULT_SHAPE_SETTINGS } from '/src/modules/shapes/shapeTypes.js';

// Instance de l'orchestrateur
let orchestrator;

// ============================================
// INITIALISATION
// ============================================

function setup() {
  // Initialiser l'état global des formes (pour la compatibilité avec l'UI)
  window.shapeSettings = { ...DEFAULT_SHAPE_SETTINGS };
  
  // Créer l'orchestrateur
  orchestrator = new WarmupOrchestrator(window);
  orchestrator.setup();
}

function windowResized() {
  orchestrator.windowResized();
}

// ============================================
// MAIN LOOP
// ============================================

function draw() {
  orchestrator.draw();
}

function mousePressed() {
  orchestrator.mousePressed();
}

function mouseReleased() {
  orchestrator.mouseReleased();
}

// ============================================
// FONCTIONS PUBLIQUES (pour l'UI)
// ============================================

/**
 * Définit la forme sélectionnée
 */
function setShape(shape) {
  orchestrator.setShape(shape);
}

/**
 * Définit le niveau
 */
function setLevel(level) {
  orchestrator.setLevel(level);
}

/**
 * Définit les paramètres des formes
 */
function setShapeSettings(settings) {
  orchestrator.setShapeSettings(settings);
}

/**
 * Active/désactive une forme
 */
function toggleShape(shape) {
  orchestrator.toggleShape(shape);
}

/**
 * Initialise les checkboxes des formes
 */
function initShapeCheckboxes() {
  orchestrator.initShapeCheckboxes();
}

/**
 * Génère une nouvelle forme
 */
function generateNewShape(level, settings) {
  return warmupState.generateNewShape(level, settings);
}

// ============================================
// SYNCHRONISATION AVEC L'UI
// ============================================

// Écouter les événements de sélection de forme depuis l'UI
if (typeof document !== 'undefined') {
  document.addEventListener('selectShape', (event) => {
    if (event.detail && event.detail.shape) {
      toggleShape(event.detail.shape);
    }
  });

  // Synchronisation entre ToggleGroup et p5.js
  document.addEventListener('DOMContentLoaded', () => {
    // ToggleGroup → p5.js : quand une forme est sélectionnée
    document.addEventListener('toggleGroupSelected', (event) => {
      if (event.detail && event.detail.icon) {
        const selectedIcon = event.detail.icon;
        
        // Mettre à jour window.shapeSettings : tous à false sauf le sélectionné
        Object.keys(window.shapeSettings).forEach(key => {
          window.shapeSettings[key] = (key === selectedIcon);
        });

        // Notifier p5.js
        document.dispatchEvent(new CustomEvent('shapeSettingsUpdated', {
          detail: { settings: { ...window.shapeSettings } }
        }));
      }
    });

    // p5.js → ToggleGroup : quand le script sélectionne une forme
    document.addEventListener('shapeSelected', (event) => {
      if (event.detail && event.detail.shape) {
        const shape = event.detail.shape;
        window.shapeSettings[shape] = true;
      }
    });

    // Envoyer l'état initial à p5.js
    document.dispatchEvent(new CustomEvent('shapeSettingsUpdated', {
      detail: { settings: { ...window.shapeSettings } }
    }));
  });

  // Écouter les mises à jour de l'UI
  document.addEventListener('shapeSettingsUpdated', (event) => {
    if (event.detail && event.detail.settings) {
      const newSettings = event.detail.settings;
      const settingsChanged = JSON.stringify(warmupState.shapeSettings) !== JSON.stringify(newSettings);
      
      if (settingsChanged) {
        warmupState.shapeSettings = newSettings;
        
        // Forcer la génération d'une nouvelle forme
        drawingState.drawing = false;
        warmupState.currentShape = null;
        
        if (typeof redraw === 'function') {
          redraw();
        } else if (typeof draw === 'function') {
          draw();
        }
      }
    }
  });
}

// ============================================
// EXPORTS POUR LES MODULES
// ============================================

// Exporter les états pour les autres modules
window.drawingState = drawingState;
window.warmupState = warmupState;
