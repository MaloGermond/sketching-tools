// ============================================
// Module: Scoring
// Calcule le score de ressemblance entre le tracé utilisateur et la forme guide
// ============================================

/**
 * Calcule le score à partir d'un buffer de dessin et d'un masque
 * @param {object} drawingBuffer - Buffer de dessin p5.Graphics
 * @param {object} guideMask - Masque de la forme guide p5.Graphics
 * @returns {object} { onShape: number, offShape: number }
 */
export function calculateScoreFromBuffer(drawingBuffer, guideMask) {
  if (!drawingBuffer || !guideMask) {
    return { onShape: 0, offShape: 0 };
  }

  drawingBuffer.loadPixels();
  guideMask.loadPixels();

  let onShape = 0;
  let offShape = 0;

  const width = drawingBuffer.width;
  const height = drawingBuffer.height;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      // Si le pixel a été dessiné (alpha > 128)
      if (drawingBuffer.pixels[idx + 3] > 128) {
        // Si le masque est blanc (sur la forme)
        if (guideMask.pixels[idx] > 128) {
          onShape++;
        } else {
          offShape++;
        }
      }
    }
  }

  return { onShape, offShape };
}

/**
 * Calcule le score final en pourcentage
 * @param {number} onShape - Nombre de pixels sur la forme
 * @param {number} offShape - Nombre de pixels hors de la forme
 * @returns {number} Score en pourcentage (0-100)
 */
export function calculateFinalScore(onShape, offShape) {
  const totalDrawn = onShape + offShape;
  if (totalDrawn === 0) return 0;
  return Math.floor((onShape / totalDrawn) * 100);
}

/**
 * Calcule la moyenne des scores
 * @param {Array<number>} scoreHistory - Historique des scores
 * @returns {number} Moyenne arrondie
 */
export function calculateAverageScore(scoreHistory) {
  if (scoreHistory.length === 0) return 0;
  const sum = scoreHistory.reduce((acc, score) => acc + score, 0);
  return Math.floor(sum / scoreHistory.length);
}

/**
 * Met à jour l'état global du score
 * @param {number} currentScore - Score actuel
 * @param {Array<number>} scoreHistory - Historique des scores
 * @param {Array<object>} traceHistory - Historique des tracés
 * @param {object} window - Objet window global
 */
export function updateScoreState(currentScore, scoreHistory, traceHistory, windowObj = window) {
  const average = calculateAverageScore(scoreHistory);

  if (typeof windowObj !== 'undefined') {
    windowObj.scoreState = {
      average: average,
      history: scoreHistory.map(s => Math.floor(s)),
      current: currentScore !== null ? Math.floor(currentScore) : null,
      traces: traceHistory
    };

    // Déclencher un événement pour que Scoreboard se mette à jour
    if (windowObj.document) {
      windowObj.document.dispatchEvent(new CustomEvent('scoreUpdated'));
    }
  }
}
