const config = {
  gradient: ["#659dcf", "#4d4ea1", "#6e49a6"],
  maxVelocity: 0.2,
  strokeStyle: "#453a7d",
  strokeWidth: 0.5,
  framerate: 45,
};

class VoronoiPoint {
  constructor(dx, dy, k, maxX, maxY) {
    this.x = Math.random()*maxX;
    this.y = Math.random()*maxY;
    this.dx = dx;
    this.dy = dy;
    this.colour = VoronoiPoint.colourRamp(k);
    this.pMaxX = maxX;
    this.pMaxY = maxY;
    this.maxX = maxX;
    this.maxY = maxY;
  }

  toArray = () => [this.x, this.y];

  setMaxY = (maxY) => {
    this.pMaxY = this.maxY;
    this.maxY = maxY;
  };

  setMaxX = (maxX) => {
    this.pMaxX = this.maxX;
    this.maxX = maxX;
  };

  rescale = () => {
    this.x *= this.maxX/this.pMaxX;
    this.y *= this.maxY/this.pMaxY;
  };
}

VoronoiPoint.colourRamp = d3.piecewise(
  d3.interpolateRgb.gamma(1.6),
  config.gradient
);

class VoronoiCanvas {
  constructor(canvas, numPoints, getDimension) {
    this.getDimension = getDimension;
    this.canvas = canvas;
    this.canvas.width = this.getDimension().width;
    this.canvas.height = this.getDimension().height;
    this.ctx = this.canvas.getContext('2d');
    this.numPoints = numPoints;
    this.points = Array(numPoints)
      .fill()
      .map(() => new VoronoiPoint(
        Math.random()*config.maxVelocity*2 - config.maxVelocity,
        Math.random()*config.maxVelocity*2 - config.maxVelocity,
        Math.random(),
        this.canvas.width,
        this.canvas.height
      ));
    this.delaunay = this.getDelaunay();
    this.voronoi = this.getVoronoi();
    this.redraw();
  }

  getDelaunay = () => {
    return d3.Delaunay.from(
      this.points.map(point => point.toArray())
    );
  };

  getVoronoi = () => {
    return this.delaunay.voronoi(
      [0, 0, this.canvas.width, this.canvas.height],
    );
  };

  resize = () => {
    this.canvas.width = this.getDimension().width;
    this.canvas.height = this.getDimension().height;
    this.ctx = this.canvas.getContext('2d');
    this.points.forEach(point => {
      point.setMaxX(this.canvas.width);
      point.setMaxY(this.canvas.height);
      point.rescale();
    });
    this.delaunay = this.getDelaunay();
    this.voronoi = this.getVoronoi();
  };

  redraw = () => {
    this.voronoi.update();
    this.ctx.strokeStyle = config.strokeStyle;
    this.ctx.lineWidth = config.strokeWidth;

    for (const cell of this.voronoi.cellPolygons()) {
      let point = this.points[cell.index];

      this.ctx.fillStyle = point.colour;
      this.ctx.beginPath();
      this.voronoi.renderCell(cell.index, this.ctx);
      this.ctx.fill();
      this.ctx.stroke();

      let i = cell.index*2;
      this.delaunay.points[i] += point.dx;
      this.delaunay.points[i] = Math.abs(this.delaunay.points[i]%this.canvas.width);
      this.delaunay.points[i+1] += point.dy;
      this.delaunay.points[i+1] = Math.abs(this.delaunay.points[i+1]%this.canvas.height);
    }
    window.requestAnimationFrame(this.redraw);
  }
}


const voronoiCanvases = [
  new VoronoiCanvas(
    document.getElementById("main-voronoi"),
    50,
    () => {
      return {
        width: document.documentElement.clientWidth,
        height: window.innerHeight,
      }
    },
  ),
  new VoronoiCanvas(
    document.getElementById("mid-voronoi"),
    40,
    () => {
      return {
        width: document.documentElement.clientWidth,
        height: document.getElementById("register").getBoundingClientRect().height,
      }
    },
  ),
  new VoronoiCanvas(
    document.getElementById("footer-voronoi"),
    30,
    () => {
      return {
        width: document.documentElement.clientWidth,
        height: document.getElementById("footer").getBoundingClientRect().height,
      }
    },
  ),
];

window.addEventListener('resize', () => voronoiCanvases.forEach(canvas => canvas.resize()));

