const config = {
  numPoints: 50,
  gradientStart: "#659dcf",
  gradientBetween: "#4d4ea1",
  gradientEnd: "#6e49a6",
  maxVelocity: 0.2,
  strokeStyle: "#453a7d",
  strokeWidth: 0.5,
  framerate: 45,
};

class VoronoiPoint {
  constructor(dx, dy, k) {
    this.dx = dx;
    this.dy = dy;
    this.colour = VoronoiPoint.colourRamp(k);
  }
}


// VoronoiPoint.colourRamp = d3.interpolateLab(
//   config.gradientStart,
//   config.gradientEnd,
// );
VoronoiPoint.colourRamp = d3.piecewise(
  d3.interpolateRgb.gamma(1.6),
  [config.gradientStart, config.gradientBetween, config.gradientEnd]
);


const main = document.getElementById("main-voronoi");
main.width = document.documentElement.clientWidth;
main.height = window.innerHeight;

const mid = document.getElementById("mid-voronoi");
mid.width = document.documentElement.clientWidth;
mid.height = document.getElementById("register").getBoundingClientRect().height;

const footer = document.getElementById("footer-voronoi");
footer.width = document.documentElement.clientWidth;
footer.height = document.getElementById("footer").getBoundingClientRect().height;

const canvases = [main, mid, footer];
const redraws = canvases.map(canvas => {
  const ctx = canvas.getContext("2d");

  const points = Array(config.numPoints)
    .fill()
    .map(() => new VoronoiPoint(
      Math.random()*config.maxVelocity*2 - config.maxVelocity,
      Math.random()*config.maxVelocity*2 - config.maxVelocity,
      Math.random(),
    ));

  const delaunay = d3.Delaunay.from(
    Array(config.numPoints)
      .fill()
      .map(() => [
        Math.random() * canvas.width,
        Math.random() * canvas.height,
      ]),
  );
  const voronoi = delaunay.voronoi(
    [0, 0, canvas.width, canvas.height],
  );

  ctx.strokeStyle = config.strokeStyle;
  ctx.lineWidth = config.strokeWidth;

  const redraw = () => {
    voronoi.update();

    for (const cell of voronoi.cellPolygons()) {
      let point = points[cell.index];

      ctx.fillStyle = point.colour;
      ctx.beginPath();
      voronoi.renderCell(cell.index, ctx);
      ctx.fill();
      ctx.stroke();

      let i = cell.index*2;
      delaunay.points[i] += point.dx;
      delaunay.points[i] = delaunay.points[i]%canvas.width;
      delaunay.points[i+1] += point.dy;
      delaunay.points[i+1] = delaunay.points[i+1]%canvas.height;
    }
  }
  return redraw;
});

window.setInterval(() => redraws.forEach(redraw => redraw()), 1000/config.framerate);
