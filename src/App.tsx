// TODO:
// + Aliasing of some kind (done for now, maybe
//   https://blog.mapbox.com/drawing-antialiased-lines-with-opengl-8766f34192dc
//   in the future).
// + Panning when space is pressed.
// - Resizing with the screen.
// - Undo (⌘+Z) and redo (⇧+⌘+Z).
// - Optimize mesh (at least skip overlapping points).
// - Ability to download the whole canvas as an image (find out a bounding box
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

const WIDTH = window.innerWidth * 2;
const HEIGHT = window.innerHeight * 2;

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(WIDTH, HEIGHT);
renderer.domElement.setAttribute(
  "style",
  `width: ${WIDTH / 2}px; height: ${HEIGHT / 2}px`
);
renderer.setClearColor(0xffffff, 1);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.OrthographicCamera(0, WIDTH, 0, HEIGHT, 0, 1);
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

let penDown = false;
let previous: number[] | null = null;
let holdingSpace = false;
let mousePosition: { x: number; y: number } | null = null;
let offset: { x: number; y: number } = { x: 0, y: 0 };

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === " ") {
    holdingSpace = true;
    document.body.style.cursor = "move";
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
};

const handleMouseDown = () => {
  penDown = true;
};

const handleMouseMove = (event: MouseEvent) => {
  if (holdingSpace && penDown) {
    if (mousePosition === null) {
      mousePosition = { x: event.offsetX, y: event.offsetY };
    }
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

    console.log(offset, mousePosition, { deltaX, deltaY });

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
    const line = normal([previous, current], 1.5);
    previous = current;
    for (let i = 0; i < line.length; i++) {
      positions[index] = line[i] || 0;
      index += 1;
    }

    mesh.geometry.setDrawRange(0, index / 3);
    mesh.geometry.attributes.position.needsUpdate = true;
    render();

    if ((index / 3) % MAX_POINTS === 0) {
      index = 0;
    }
  }
};

window.addEventListener("mousemove", handleMouseMove, false);
renderer.domElement.addEventListener("mousedown", handleMouseDown, false);
renderer.domElement.addEventListener("mouseup", handleMouseUp, false);
window.addEventListener("keyup", handleKeyUp, false);
window.addEventListener("keydown", handleKeyDown, false);

animate();

const App = () => <div></div>;

export default App;
