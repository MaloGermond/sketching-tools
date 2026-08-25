import { WarmupOrchestrator } from '../modules/warmup/warmupOrchestrator.js';
import { warmupState } from '../modules/warmup/warmupState.js';
import { drawingState } from '../modules/drawing/drawingState.js';
import { DEFAULT_SHAPE_SETTINGS } from '../modules/shapes/shapeTypes.js';

export default function(p) {
  let orchestrator;

  p.setup = function() {
    window.shapeSettings = { ...DEFAULT_SHAPE_SETTINGS };
    orchestrator = new WarmupOrchestrator(p);
    orchestrator.setup();

    document.addEventListener('shapeSettingsUpdated', (event) => {
      if (!event.detail?.settings) return;
      const newSettings = event.detail.settings;
      const changed = JSON.stringify(warmupState.shapeSettings) !== JSON.stringify(newSettings);
      if (changed) {
        warmupState.shapeSettings = newSettings;
        drawingState.drawing = false;
        warmupState.currentShape = null;
        p.redraw();
      }
    });

    document.addEventListener('levelChanged', (event) => {
      if (event.detail?.level && orchestrator) {
        orchestrator.setLevel(event.detail.level);
      }
    });
  };

  p.draw = function() { orchestrator?.draw(); };
  p.windowResized = function() { orchestrator?.windowResized(); };
  p.mousePressed = function() { orchestrator?.mousePressed(); };
  p.mouseReleased = function() { orchestrator?.mouseReleased(); };
}
