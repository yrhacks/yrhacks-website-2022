
const canvas = d3.select("canvas").node();

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const context = canvas.getContext("2d");
const width = canvas.width;
const height = canvas.height;

const colours = [
  "#B6CEC7",
  "#D8E0BB",
  "#86A3C3",
  "#7268A6",
  "453A7D",
  "6B3074"
];

const sites = d3.range(200)
    .map(() => [Math.random() * width, Math.random() * height]);

const randomColours = d3.range(200)
    .map(() => colours[Math.floor(Math.random()*colours.length)]);


const velocity = d3.range(200).map(() => {
  return {
    x: Math.random()*1-0.5,
    y: Math.random()*1-0.5,
  };
});
const voronoi = d3.voronoi()
    .extent([[-1, -1], [width + 1, height + 1]]);


window.setInterval(() => {
  redraw();
}, 30);

function redraw() {
  const diagram = voronoi(sites);
  const polygons = diagram.polygons();
  move();

  context.clearRect(0, 0, width, height);

  for (var i = 0, n = polygons.length; i < n; ++i) {
    context.beginPath();
    drawCell(polygons[i]);
    context.fillStyle = randomColours[i];
    context.fill();
  }

}

const move = () => {
  sites.forEach((point, i) => {
    point[0] += velocity[i].x;
    point[0] = point[0] % width;
    point[1] += velocity[i].y;
    point[1] = point[1] % height;
  });
};

const drawCell = () => {
  if (!sites) return false;
  context.moveTo(sites[0][0], sites[0][1]);
  for (let j = 1, m = sites.length; j < m; ++j) {
    context.lineTo(sites[j][0], sites[j][1]);
  }
  context.closePath();
  return true;
}