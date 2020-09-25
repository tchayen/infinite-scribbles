import * as THREE from "three";
import {
  DEV,
  LINES_IN_BUFFER,
  POINTS_IN_TRIANGLE,
  TRIANGLES_IN_LINE,
  VALUES_IN_POINT,
  ZOOM,
} from "./consts";
import { material, scene } from "./three";
import { Point } from "./vectors";

// TODO:
// - Play with the code to extract THREE parts so that they can be mocked and
//   unit tests can be done.
// - Write unit tests for appending lines.
// - Maybe it will help with 2.
// - Move on to unit tests for undo & redo.
// - At this stage 1. should be gone.

// BUGS:
// 1. CMD+Z doesn't cross buffers right now.
// 2. There is one line missing in a shape spanning two (or more) buffers.

let index = 0; // At which index the next line can be added.
let history: number[] = [];
let historyIndex = -1;
let meshes: THREE.Mesh<THREE.BufferGeometry>[] = [];
let shapes: Point[][] = [];
let accumulatingShape: Point[] = [];

const updateRange = (targetIndex: number, meshIndex: number) => {
  meshes[meshIndex].geometry.setDrawRange(
    0,
    targetIndex * POINTS_IN_TRIANGLE * TRIANGLES_IN_LINE
  );

  meshes[meshIndex].geometry.attributes.position.needsUpdate = true;
};

const addMesh = () => {
  const positions = new Float32Array(
    LINES_IN_BUFFER * TRIANGLES_IN_LINE * POINTS_IN_TRIANGLE * VALUES_IN_POINT
  );
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, VALUES_IN_POINT)
  );
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;

  meshes.push(mesh);
  scene.add(mesh);
};

export const undo = () => {
  if (historyIndex >= 0) {
    historyIndex -= 1;
    const previous = Math.floor(index / LINES_IN_BUFFER);
    index = history[historyIndex] || 0;
    const current = Math.floor(index / LINES_IN_BUFFER);
    for (let i = previous; i > current; i--) {
      updateRange(0, i);
    }
    updateRange(index, current);
  }
};

export const redo = () => {
  if (historyIndex !== history.length - 1) {
    historyIndex += 1;
    const current = Math.floor(index / LINES_IN_BUFFER);
    index = history[historyIndex];
    const next = Math.floor(index / LINES_IN_BUFFER);
    for (let i = current; i < next; i++) {
      updateRange(LINES_IN_BUFFER - 1, i);
    }
    updateRange(index, next);
  }
};

export const mouseUp = () => {
  if (accumulatingShape.length === 0) {
    return;
  }

  history = [...history.slice(0, historyIndex + 1), index];
  historyIndex += 1;

  if (!DEV && !window.onbeforeunload) {
    window.onbeforeunload = (event: BeforeUnloadEvent) => {
      if (shapes.length > 0) {
        // Prevent unload only if there is some user-created content.
        event.returnValue =
          "This value apparently can be anything that casts to true";
      }
    };
  }

  shapes = [...shapes.slice(0, historyIndex + 1), accumulatingShape];
  accumulatingShape = [];
};

export const append = (numbers: number[], a: Point, b: Point) => {
  // If user draws a new thing, reset all diverged history by dropping buffers.
  const current = Math.floor(index / LINES_IN_BUFFER);
  if (current < meshes.length) {
    meshes.splice(current + 1, meshes.length - current);
  }

  accumulatingShape.push(b);

  const positions = meshes[current].geometry.attributes.position
    .array as number[];

  for (let i = 0; i < numbers.length; i++) {
    positions[
      (index % LINES_IN_BUFFER) *
        VALUES_IN_POINT *
        POINTS_IN_TRIANGLE *
        TRIANGLES_IN_LINE +
        i
    ] = numbers[i];
  }

  if (index % LINES_IN_BUFFER === LINES_IN_BUFFER - 1) {
    addMesh();
  }
  updateRange(index, current);
  index += 1;
};

export const getSvg = () => {
  let mostLeft = Infinity;
  let mostRight = -Infinity;
  let mostTop = Infinity;
  let mostBottom = -Infinity;

  shapes = [...shapes.slice(0, historyIndex + 1)];

  for (const shape of shapes) {
    for (const point of shape) {
      if (point[0] < mostLeft) {
        mostLeft = point[0];
      }
      if (point[0] > mostRight) {
        mostRight = point[0];
      }
      if (point[1] < mostTop) {
        mostTop = point[1];
      }
      if (point[1] > mostBottom) {
        mostBottom = point[1];
      }
    }
  }

  const paths = shapes
    .map((shape) => {
      const start = `M ${(shape[0][0] - mostLeft) / ZOOM} ${
        (shape[0][1] - mostTop) / ZOOM
      }`;
      const rest = shape
        .slice(1, shape.length)
        .map(
          (point) =>
            `L ${(point[0] - mostLeft) / ZOOM} ${(point[1] - mostTop) / ZOOM}`
        )
        .join(" ");

      const path = `${start} ${rest}`;
      return `<path d="${path}" />`;
    })
    .join(" ");

  const width = (mostRight - mostLeft) / ZOOM;
  const height = (mostBottom - mostTop) / ZOOM;

  return `
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="${width}"
  height="${height}"
  fill="transparent"
  stroke="black"
  stroke-width="2">
    ${paths}
</svg>`;
};

export const setup = () => {
  addMesh();
};

export const __TEST_ONLY__ = {
  meshes,
  index,
  history,
  historyIndex,
  shapes,
  accumulatingShape,
};
