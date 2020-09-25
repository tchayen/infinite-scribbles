// TODO:
// + Aliasing of some kind (done for now, maybe
//   https://blog.mapbox.com/drawing-antialiased-lines-with-opengl-8766f34192dc
//   in the future).
// + Panning when space is pressed.
// + Resizing with the screen.
// + Undo (⌘+Z) and redo (⇧+⌘+Z).
// + Optimize mesh (at least skip overlapping points).
// + Ability to download the whole canvas as an image (find out a bounding box
//   rectangle and preferably generate PNG out of that
//   https://stackoverflow.com/questions/42932645/creating-and-saving-to-file-new-png-image-in-javascript).
// + Prevent window from reloading.
// - Creating another mesh when one is full.
// - If distance to previous point is huge, sample several points from a bezier curve.
// - Custom cursor for pen and eraser and moving.
// - Eraser.
// - Ability to place point in place with no moving.

import React from "react";
import * as THREE from "three";
import DownloadButton from "./components/DownloadButton";
import Popup from "./components/Popup";
import { normal, Point } from "./vectors";
import { MAX_POINTS } from "./consts";
import { renderer, scene, camera, material } from "./three";

document.body.appendChild(renderer.domElement);

const meshGeometry = new THREE.BufferGeometry();
const meshPositions = new Float32Array(MAX_POINTS * 3);

meshGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(meshPositions, 3)
);
const mesh = new THREE.Mesh(meshGeometry, material);
mesh.frustumCulled = false;

scene.add(mesh);

let index = 0;

function render() {
  renderer.render(scene, camera);
}

const updateRangeAndRedraw = () => {
  mesh.geometry.setDrawRange(0, index / 3);
  mesh.geometry.attributes.position.needsUpdate = true;
  render();

  if ((index / 3) % MAX_POINTS === 0) {
    index = 0;
  }
};

let penDown = false;
let holdingSpace = false;

let previous: Point | null = null;
let mousePosition: { x: number; y: number } | null = null;
let offset: { x: number; y: number } = { x: 0, y: 0 };

let history: number[] = [];
let historyIndex = -1;

let shapes: Point[][] = [];
let accumulatingShape: Point[] = [];

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === " ") {
    holdingSpace = true;
    document.body.style.cursor = "move";
  } else if (event.key === "z" && (event.ctrlKey || event.metaKey)) {
    if (event.shiftKey) {
      // There's some history to redo.
      if (historyIndex !== history.length - 1) {
        historyIndex += 1;
        index = history[historyIndex];
        updateRangeAndRedraw();
      }
    } else {
      if (historyIndex >= 0) {
        historyIndex -= 1;
        index = history[historyIndex] || 0;
        updateRangeAndRedraw();
      }
    }
  }
};

const handleKeyUp = (event: KeyboardEvent) => {
  if (event.key === " ") {
    holdingSpace = false;
    mousePosition = null;
    document.body.style.cursor = "default";
  }
};

const handleMouseUp = () => {
  penDown = false;
  previous = null;

  if (accumulatingShape.length === 0) {
    return;
  }

  history = [...history.slice(0, historyIndex + 1), index];
  historyIndex += 1;

  if (!window.onbeforeunload) {
    window.onbeforeunload = (event: BeforeUnloadEvent) => {
      if (shapes.length > 0) {
        // Prevent unload only if there is some user-created content.
        event.returnValue = "Test";
      }
    };
  }

  shapes = [...shapes.slice(0, historyIndex + 1), accumulatingShape];
  accumulatingShape = [];

  mousePosition = null;
};

const handleMouseDown = (event: MouseEvent) => {
  penDown = true;

  if (holdingSpace) {
    mousePosition = { x: event.offsetX, y: event.offsetY };
  }
};

const handleMouseMove = (event: MouseEvent) => {
  if (holdingSpace && penDown && mousePosition !== null) {
    const deltaX = mousePosition.x - event.offsetX;
    const deltaY = mousePosition.y - event.offsetY;

    camera.translateX(deltaX);
    camera.translateY(deltaY);

    offset.x += deltaX;
    offset.y += deltaY;

    mousePosition = {
      x: mousePosition.x - deltaX,
      y: mousePosition.y - deltaY,
    };

    render();

    return;
  }

  if (!penDown) {
    return;
  }

  const x = event.offsetX * 2 + offset.x;
  const y = event.offsetY * 2 + offset.y;

  if (previous === null) {
    previous = [x, y];
  } else {
    const positions = mesh.geometry.attributes.position.array as number[];
    const current: Point = [x, y];

    // Skip new point if it is closer than 2 pixels in euclidean metric.
    // TODO: implement some more effective filters here.
    if ((current[0] - previous[0]) ** 2 + (current[1] - previous[1]) ** 2 < 4) {
      return;
    }

    accumulatingShape.push(current);

    const line = normal([previous, current], 4);
    previous = current;
    for (let i = 0; i < line.length; i++) {
      positions[index] = line[i] || 0;
      index += 1;
    }

    updateRangeAndRedraw();
  }
};

const handleWindowResize = () => {
  camera.right = window.innerWidth * 2;
  camera.bottom = window.innerHeight * 2;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth * 2, window.innerHeight * 2);
  renderer.domElement.setAttribute(
    "style",
    `width: ${window.innerWidth}px; height: ${window.innerHeight}px`
  );
};

const getSvg = () => {
  let mostLeft = Infinity;
  let mostRight = -Infinity;
  let mostTop = Infinity;
  let mostBottom = -Infinity;

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

  const ZOOM = 2;

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

window.addEventListener("mousemove", handleMouseMove, false);
renderer.domElement.addEventListener("mousedown", handleMouseDown, false);
renderer.domElement.addEventListener("mouseup", handleMouseUp, false);
window.addEventListener("keyup", handleKeyUp, false);
window.addEventListener("keydown", handleKeyDown, false);
window.addEventListener("resize", handleWindowResize, false);

render();

const App = () => (
  <div>
    <DownloadButton getSvg={getSvg} />
    <Popup />
  </div>
);

export default App;
