export default function(p) {
  var t = 0;
  var points = [];

  p.setup = function() {
    p.strokeWeight(1.5);
    p.noFill();
  };

  p.draw = function() {
    p.background(242, 244, 246, 30);
    t += 0.016;

    var n = Math.floor((t % 8) / 8 * 300);
    if (n === 0) points = [];

    var cx = p.width / 2;
    var cy = p.height / 2;
    var rx = p.width * 0.35;
    var ry = p.height * 0.35;

    for (var i = points.length; i <= n; i++) {
      var a = (i / 300) * p.TWO_PI;
      points.push({
        x: cx + rx * p.sin(3 * a + t * 0.1),
        y: cy + ry * p.sin(2 * a),
      });
    }

    for (var j = 1; j < points.length; j++) {
      var alpha = p.map(j, 0, points.length, 0, 200);
      p.stroke(68, 102, 136, alpha);
      p.line(points[j - 1].x, points[j - 1].y, points[j].x, points[j].y);
    }
  };
}
