export type Point = [number, number];

export const scale = ([x, y]: Point, factor: number): Point => {
  const norm = Math.sqrt(x * x + y * y);
  return [(x / norm) * factor, (y / norm) * factor];
};

export const add = (p1: Point, p2: Point): Point => [
  p1[0] + p2[0],
  p1[1] + p2[1],
];

// export const normal = (points: Array<Point>, width: number) => {
//   width /= 2;
//   const triangles = [];
//   for (let i = 0; i < points.length - 1; i++) {
//     const dx = points[i + 1][0] - points[i][0];
//     const dy = points[i + 1][1] - points[i][1];
//     const n1 = scale([dy, -dx], width);
//     const n2 = scale([-dy, dx], width);

//     triangles.push(
//       ...add(points[i + 1], n2),
//       0,
//       ...add(points[i], n1),
//       0,
//       ...add(points[i], n2),
//       0,
//       ...add(points[i], n1),
//       0,
//       ...add(points[i + 1], n2),
//       0,
//       ...add(points[i + 1], n1),
//       0
//     );
//   }
//   return triangles;
// };

export const getLine = (a: Point, b: Point, width: number) => {
  width /= 2;

  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const n1 = scale([dy, -dx], width);
  const n2 = scale([-dy, dx], width);

  return [
    ...add(b, n2),
    0,
    ...add(a, n1),
    0,
    ...add(a, n2),
    0,
    ...add(a, n1),
    0,
    ...add(b, n2),
    0,
    ...add(b, n1),
    0,
  ];
};

// https://stackoverflow.com/a/24392281
export const lineIntersection = (a: Point, b: Point, c: Point, d: Point) => {
  let det, gamma, lambda;
  det = (b[0] - a[0]) * (d[1] - c[1]) - (d[0] - c[0]) * (b[1] - a[1]);
  if (det === 0) {
    return false;
  } else {
    lambda =
      ((d[1] - c[1]) * (d[0] - a[0]) + (c[0] - d[0]) * (d[1] - a[1])) / det;
    gamma =
      ((a[1] - b[1]) * (d[0] - a[0]) + (b[0] - a[0]) * (d[1] - a[1])) / det;
    return 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1;
  }
};
