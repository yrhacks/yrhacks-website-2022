"use strict";

const config = {
  framerate: 45,
  gradient: ["#659dcf", "#4d4ea1", "#6e49a6"],
  strokeStyle: "#453a7d",
  strokeWidth: 0.5,
  velocity: 0.01,
};

class VoronoiPoint {
  constructor(theta, colour) {
    this._dx = config.velocity*Math.cos(theta);
    this._dy = config.velocity*Math.sin(theta);

    this.colour = VoronoiPoint.colourRamp(colour);
  }

  updateX(x, elapsedTime, maxX) {
    const newX = x + this._dx*elapsedTime;
    if (newX < 0 || newX > maxX) {
      this._dx *= -1;
    }

    return newX;
  }

  updateY(y, elapsedTime, maxY) {
    const newY = y + this._dy*elapsedTime;
    if (newY < 0 || newY > maxY) {
      this._dy *= -1;
    }

    return newY;
  }
}
VoronoiPoint.colourRamp = d3.piecewise(
  d3.interpolateLab,
  config.gradient,
);

class VoronoiCanvas {
  constructor(canvas, numPoints, parent) {
    this._canvas = canvas;
    this._ctx = this._canvas.getContext("2d");

    this.parent = parent;
    const dim = this.parent.getBoundingClientRect();
    this._maxX = dim.width;
    this._maxY = dim.height;

    this._delaunay = d3.Delaunay.from(Array.from(
      { length: numPoints },
      () => [
        Math.random()*this._maxX,
        Math.random()*this._maxY,
      ],
    ));

    this._points = Array.from(
      { length: numPoints },
      () => new VoronoiPoint(
        Math.random()*2*Math.PI,
        Math.random(),
      ),
    );

    this.resizeCanvas();
    window.requestAnimationFrame(this.redraw.bind(this));
  }

  resize(dim) {
    const xScale = dim.inlineSize/this._maxX;
    const yScale = dim.blockSize/this._maxY;
    this._maxX = dim.inlineSize;
    this._maxY = dim.blockSize;

    this.resizeCanvas();

    for (let i = 0; i < this._delaunay.points.length-1; i += 2) {
      this._delaunay.points[i] *= xScale;
      this._delaunay.points[i+1] *= yScale;
    }
  }

  redraw(timestamp) {
    if (this._lastFrameTime === undefined) {
      this._lastFrameTime = timestamp;
    }
    const elapsed = Math.min(timestamp-this._lastFrameTime, 100);
    this._lastFrameTime = timestamp;

    this._voronoi.update();

    for (const cell of this._voronoi.cellPolygons()) {
      const point = this._points[cell.index];

      this._ctx.fillStyle = point.colour;
      this._ctx.beginPath();
      this._voronoi.renderCell(cell.index, this._ctx);
      this._ctx.fill();
      this._ctx.stroke();

      const i = cell.index*2;
      this._delaunay.points[i] = point.updateX(
        this._delaunay.points[i],
        elapsed,
        this._maxX
      );
      this._delaunay.points[i+1] = point.updateY(
        this._delaunay.points[i+1],
        elapsed,
        this._maxY
      );
    }

    window.requestAnimationFrame(this.redraw.bind(this));
  }

  resizeCanvas() {
    this._canvas.width = this._maxX;
    this._canvas.height = this._maxY;

    this._ctx.strokeStyle = config.strokeStyle;
    this._ctx.lineWidth = config.strokeWidth;

    this._voronoi = this._delaunay.voronoi([
      0,
      0,
      this._maxX,
      this._maxY,
    ]);
  }
}

const voronoiCanvases = [
  new VoronoiCanvas(
    document.getElementById("main-voronoi"),
    50,
    document.getElementById("main")
  ),
  new VoronoiCanvas(
    document.getElementById("mid-voronoi"),
    35,
    document.getElementById("register")
  ),
  new VoronoiCanvas(
    document.getElementById("footer-voronoi"),
    30,
    document.getElementById("footer")
  ),
];

voronoiCanvases.forEach((canvas) => {
  const ro = new ResizeObserver((entries) => {
    for (const entry of entries) {
      canvas.resize(entry.borderBoxSize[0]);
    }
  });
  ro.observe(canvas.parent);
});
