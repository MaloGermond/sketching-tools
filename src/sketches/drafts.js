import { computeMovingAveragePoint, getSmoothSegment } from '../modules/drawing/drawingBuffer.js';
import { DEFAULT_SMOOTHING_WINDOW } from '../modules/drawing/drawingState.js';

const STROKE_WEIGHT = 4;
const CURSOR_RING_SIZE = 20;
const CURSOR_DOT_SIZE = 3;
const CURSOR_INK = [17, 24, 39]; // #111827

export default function (p) {
  let buffer;
  let strokes = [];
  let redoStack = [];
  let currentRawPoints = null;
  let currentSmoothedPoints = null;

  function configureBuffer() {
    buffer.background(255);
    buffer.stroke(0);
    buffer.strokeWeight(STROKE_WEIGHT);
    buffer.strokeCap(p.ROUND);
    buffer.strokeJoin(p.ROUND);
  }

  // Trace un segment (droit ou courbe quadratique par midpoints) sur le buffer,
  // même logique de lissage que le warm-up (drawingBuffer.js).
  function drawSegmentOnBuffer(segment) {
    const ctx = buffer.drawingContext;
    ctx.beginPath();
    ctx.moveTo(segment.from.x, segment.from.y);
    if (segment.type === 'quadratic') {
      ctx.quadraticCurveTo(segment.control.x, segment.control.y, segment.to.x, segment.to.y);
    } else {
      ctx.lineTo(segment.to.x, segment.to.y);
    }
    ctx.stroke();
  }

  // Rejoue un tracé (déjà lissé) point par point, ex. après undo/redo.
  function drawStrokeOnBuffer(stroke) {
    if (stroke.length === 1) {
      buffer.point(stroke[0].x, stroke[0].y);
      return;
    }
    for (let i = 2; i < stroke.length; i++) {
      drawSegmentOnBuffer(getSmoothSegment([stroke[i - 2], stroke[i - 1], stroke[i]]));
    }
    if (stroke.length === 2) {
      drawSegmentOnBuffer({ type: 'line', from: stroke[0], to: stroke[1] });
    }
  }

  function redrawBuffer() {
    configureBuffer();
    strokes.forEach(drawStrokeOnBuffer);
  }

  function emitHistoryChanged() {
    document.dispatchEvent(new CustomEvent('sketch:historyChanged', {
      detail: { canUndo: strokes.length > 0, canRedo: redoStack.length > 0 },
    }));
  }

  function undo() {
    if (!strokes.length) return;
    redoStack.push(strokes.pop());
    redrawBuffer();
    emitHistoryChanged();
  }

  function redo() {
    if (!redoStack.length) return;
    strokes.push(redoStack.pop());
    redrawBuffer();
    emitHistoryChanged();
  }

  function startNewDrawing() {
    strokes = [];
    redoStack = [];
    redrawBuffer();
    emitHistoryChanged();
  }

  function download() {
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    p.saveCanvas(buffer.elt, `croquis-${stamp}.png`);
  }

  function isInCanvas() {
    return p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height;
  }

  // Le canvas p5 recouvre toute la page ; ignore les clics reçus par des
  // éléments superposés (ex. la toolbar) même s'ils tombent dans ses bornes.
  function isCanvasEvent(event) {
    return !event || event.target === p.canvas;
  }

  p.setup = function () {
    buffer = p.createGraphics(p.width, p.height);
    configureBuffer();
    p.noCursor();

    document.addEventListener('sketch:undo', undo);
    document.addEventListener('sketch:redo', redo);
    document.addEventListener('sketch:new', startNewDrawing);
    document.addEventListener('sketch:download', download);

    emitHistoryChanged();
  };

  function startStroke(event) {
    if (!isCanvasEvent(event) || !isInCanvas()) return;
    currentRawPoints = [{ x: p.mouseX, y: p.mouseY }];
    currentSmoothedPoints = [{ x: p.mouseX, y: p.mouseY }];
    buffer.point(p.mouseX, p.mouseY);
    if (redoStack.length) {
      redoStack = [];
      emitHistoryChanged();
    }
  }

  function continueStroke() {
    if (!currentRawPoints || !isInCanvas()) return;
    const last = currentRawPoints[currentRawPoints.length - 1];
    if (p.mouseX === last.x && p.mouseY === last.y) return;

    currentRawPoints.push({ x: p.mouseX, y: p.mouseY });
    currentSmoothedPoints.push(
      computeMovingAveragePoint(currentRawPoints, DEFAULT_SMOOTHING_WINDOW)
    );

    const segment = getSmoothSegment(currentSmoothedPoints);
    if (segment) drawSegmentOnBuffer(segment);
  }

  function endStroke() {
    if (currentSmoothedPoints) {
      strokes.push(currentSmoothedPoints);
      currentRawPoints = null;
      currentSmoothedPoints = null;
      emitHistoryChanged();
    }
  }

  p.mousePressed = startStroke;
  p.mouseDragged = continueStroke;
  p.mouseReleased = endStroke;

  // Gestionnaires tactiles dédiés : sur mobile, la simulation souris de p5
  // à partir des évènements touch peut perdre le mouseReleased (ex. iOS
  // Safari), laissant le tracé actif — le trait suivant se retrouvait
  // alors relié au point précédent malgré le doigt relevé entre-temps.
  p.touchStarted = function (event) {
    startStroke(event);
    return false;
  };

  p.touchMoved = function () {
    continueStroke();
    return false;
  };

  p.touchEnded = function () {
    endStroke();
    return false;
  };

  // Curseur : anneau à triple contour (sombre/blanc/sombre) pour rester
  // visible sur fond blanc comme sur un trait noir, plus un point central.
  function drawCursor() {
    const [r, g, b] = CURSOR_INK;
    p.noFill();
    p.stroke(r, g, b, 0.7 * 255);
    p.strokeWeight(1.5);
    p.circle(p.mouseX, p.mouseY, CURSOR_RING_SIZE);
    p.stroke(255, 255, 255, 0.9 * 255);
    p.strokeWeight(3);
    p.circle(p.mouseX, p.mouseY, CURSOR_RING_SIZE);
    p.stroke(r, g, b, 0.7 * 255);
    p.strokeWeight(1.5);
    p.circle(p.mouseX, p.mouseY, CURSOR_RING_SIZE);
    p.noStroke();
    p.fill(r, g, b);
    p.circle(p.mouseX, p.mouseY, CURSOR_DOT_SIZE);
  }

  p.draw = function () {
    p.image(buffer, 0, 0);

    if (isInCanvas()) {
      drawCursor();
    }
  };
}
