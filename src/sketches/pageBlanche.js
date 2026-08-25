const STROKE_WEIGHT = 4;

export default function (p) {
  p.setup = function () {
    p.background(255);
    p.stroke(0);
    p.strokeWeight(STROKE_WEIGHT);
    p.strokeCap(p.ROUND);
    p.strokeJoin(p.ROUND);
  };

  p.draw = function () {
    if (!p.mouseIsPressed) return;

    const inCanvas =
      p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height;
    if (!inCanvas) return;

    if (p.mouseX === p.pmouseX && p.mouseY === p.pmouseY) {
      p.point(p.mouseX, p.mouseY);
    } else {
      p.line(p.pmouseX, p.pmouseY, p.mouseX, p.mouseY);
    }
  };
}
