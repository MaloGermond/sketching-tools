new p5((p) => {
      p.setup = () => {
        p.createCanvas(size, size);
      };

      p.draw = () => {
        p.background(220);
        p.fill(0);
        p.stroke(255)
        p.ellipse(p.mouseX, p.mouseY, 100, 100);
      };
    }, containerRef.current);