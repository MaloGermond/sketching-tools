export default function(p) {

      p.draw = function () {
        p.background(220);
        p.fill(0);
        p.stroke(255)
        p.ellipse(p.mouseX, p.mouseY, 100, 100);
        p.noCursor();
      };
};