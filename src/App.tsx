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
// - Creating another mesh when one is full.

import React from "react";
import * as THREE from "three";

type Point = number[];

const scale = ([x, y]: Point, factor: number): Point => {
  const norm = Math.sqrt(x * x + y * y);
  return [(x / norm) * factor, (y / norm) * factor];
};

const add = (p1: Point, p2: Point): Point => [p1[0] + p2[0], p1[1] + p2[1]];

const normal = (points: Array<Point>, width: number) => {
  width /= 2;
  const triangles = [];
  for (let i = 0; i < points.length - 1; i++) {
    const dx = points[i + 1][0] - points[i][0];
    const dy = points[i + 1][1] - points[i][1];
    const n1 = scale([dy, -dx], width);
    const n2 = scale([-dy, dx], width);

    triangles.push(
      ...add(points[i + 1], n2),
      0,
      ...add(points[i], n1),
      0,
      ...add(points[i], n2),
      0,
      ...add(points[i], n1),
      0,
      ...add(points[i + 1], n2),
      0,
      ...add(points[i + 1], n1),
      0
    );
  }
  return triangles;
};

const MAX_POINTS = 10000;

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth * 2, window.innerHeight * 2);
renderer.domElement.setAttribute(
  "style",
  `width: ${(window.innerWidth * 2) / 2}px; height: ${
    (window.innerHeight * 2) / 2
  }px`
);
renderer.setClearColor(0xffffff, 1);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.OrthographicCamera(
  0,
  window.innerWidth * 2,
  0,
  window.innerHeight * 2,
  0,
  1
);
camera.position.set(0, 0, 1);

const meshMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
const meshGeometry = new THREE.BufferGeometry();
const meshPositions = new Float32Array(MAX_POINTS * 3);

meshGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(meshPositions, 3)
);
const mesh = new THREE.Mesh(meshGeometry, meshMaterial);
mesh.frustumCulled = false;

scene.add(mesh);

let index = 0;

function render() {
  renderer.render(scene, camera);
}

function animate() {
  requestAnimationFrame(animate);

  render();
}

const updateRangeAndRedraw = () => {
  mesh.geometry.setDrawRange(0, index / 3);
  mesh.geometry.attributes.position.needsUpdate = true;
  render();
};

let penDown = false;
let holdingSpace = false;

let previous: number[] | null = null;
let mousePosition: { x: number; y: number } | null = null;
let offset: { x: number; y: number } = { x: 0, y: 0 };

let history: number[] = [];
let historyIndex = -1;

let shapes: number[][][] = [];
let accumulatingShape: number[][] = [];

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
    const current = [x, y];

    // Skip new point if it is closer than 2 pixels in euclidean metric.
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

    if ((index / 3) % MAX_POINTS === 0) {
      index = 0;
    }
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

  console.log({ mostLeft, mostRight, mostTop, mostBottom });

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

  return `<svg width="${width}" height="${height}" fill="transparent" stroke="black">${paths}</svg>`;
};

window.addEventListener("mousemove", handleMouseMove, false);
renderer.domElement.addEventListener("mousedown", handleMouseDown, false);
renderer.domElement.addEventListener("mouseup", handleMouseUp, false);
window.addEventListener("keyup", handleKeyUp, false);
window.addEventListener("keydown", handleKeyDown, false);
window.addEventListener("resize", handleWindowResize, false);

animate();

const DownloadButton = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: 50,
        width: 50,
        cursor: "pointer",
        position: "absolute",
        top: 20,
        right: 20,
        userSelect: "none",
      }}
      onClick={() => {
        const element = document.createElement("a");
        const svg = getSvg();
        element.setAttribute(
          "href",
          `data:text/plain;charset=utf-8,${encodeURIComponent(svg)}`
        );
        element.setAttribute("download", "snapshot.svg");
        element.style.display = "none";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }}
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2 22C2 21.4477 1.55228 21 1 21C0.447715 21 0 21.4477 0 22H2ZM1 27H0C0 27.5523 0.447715 28 1 28L1 27ZM27 27V28C27.5523 28 28 27.5523 28 27H27ZM28 22C28 21.4477 27.5523 21 27 21C26.4477 21 26 21.4477 26 22H28ZM15 1C15 0.447715 14.5523 0 14 0C13.4477 0 13 0.447715 13 1H15ZM14 22L13.2929 22.7071C13.6834 23.0976 14.3166 23.0976 14.7071 22.7071L14 22ZM7.70711 14.2929C7.31658 13.9024 6.68342 13.9024 6.29289 14.2929C5.90237 14.6834 5.90237 15.3166 6.29289 15.7071L7.70711 14.2929ZM21.7071 15.7071C22.0976 15.3166 22.0976 14.6834 21.7071 14.2929C21.3166 13.9024 20.6834 13.9024 20.2929 14.2929L21.7071 15.7071ZM0 22V27H2V22H0ZM1 28H27V26H1V28ZM28 27V22H26V27H28ZM13 1V22H15V1H13ZM14.7071 21.2929L7.70711 14.2929L6.29289 15.7071L13.2929 22.7071L14.7071 21.2929ZM14.7071 22.7071L21.7071 15.7071L20.2929 14.2929L13.2929 21.2929L14.7071 22.7071Z"
          fill="black"
        />
      </svg>
      <span style={{ fontWeight: 600, fontSize: 12 }}>SVG</span>
    </div>
  );
};

const App = () => (
  <div>
    <DownloadButton />
    {/* <div
      style={{
        width: "100vw",
        height: 60,
        backgroundColor: "#E5E5E5",
        position: "absolute",
        top: 0,
        left: 0,
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
    </div> */}
    <button
      style={{
        position: "absolute",
        top: 16,
        left: 16,
        paddingLeft: 24,
        paddingRight: 24,
        height: 50,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#007AFF",
        borderRadius: 25,
        color: "#FFFFFF",
        border: "none",
        cursor: "pointer",
        fontSize: 20,
        fontWeight: 600,
      }}
      onClick={() => console.log(getSvg())}
    >
      Download SVG
    </button>
  </div>
);

export default App;
