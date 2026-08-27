const STROKE_WEIGHT = 4;
const CURSOR_RING_SIZE = 20;
const CURSOR_DOT_SIZE = 3;
const CURSOR_INK = [17, 24, 39]; // #111827

export default function (p) {
  let buffer;
  let strokes = [];
  let redoStack = [];
  let currentStroke = null;

  function configureBuffer() {
    buffer.background(255);
    buffer.stroke(0);
    buffer.strokeWeight(STROKE_WEIGHT);
    buffer.strokeCap(p.ROUND);
    buffer.strokeJoin(p.ROUND);
  }

  function drawStrokeOnBuffer(stroke) {
    if (stroke.length === 1) {
      buffer.point(stroke[0].x, stroke[0].y);
      return;
    }
    for (let i = 1; i < stroke.length; i++) {
      buffer.line(stroke[i - 1].x, stroke[i - 1].y, stroke[i].x, stroke[i].y);
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

  p.mousePressed = function (event) {
    if (!isCanvasEvent(event) || !isInCanvas()) return;
    currentStroke = [{ x: p.mouseX, y: p.mouseY }];
    buffer.point(p.mouseX, p.mouseY);
    if (redoStack.length) {
      redoStack = [];
      emitHistoryChanged();
    }
  };

  p.mouseDragged = function () {
    if (!currentStroke || !isInCanvas()) return;
    const last = currentStroke[currentStroke.length - 1];
    if (p.mouseX === last.x && p.mouseY === last.y) return;
    currentStroke.push({ x: p.mouseX, y: p.mouseY });
    buffer.line(last.x, last.y, p.mouseX, p.mouseY);
  };

  p.mouseReleased = function () {
    if (currentStroke) {
      strokes.push(currentStroke);
      currentStroke = null;
      emitHistoryChanged();
    }
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
