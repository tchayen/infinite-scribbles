// TODO:
// - Aliasing of some kind.
// - Panning when space is pressed.
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

const size = 600;

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(size, size);
renderer.setClearColor(0xffffff, 1);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.OrthographicCamera(0, size, 0, size, -1, 10000);
camera.position.set(0, 0, 1000);

const meshMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
const meshGeometry = new THREE.BufferGeometry();
const meshPositions = new Float32Array(MAX_POINTS * 3);

meshGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(meshPositions, 3)
);
const mesh = new THREE.Mesh(meshGeometry, meshMaterial);

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

const handleMouseUp = () => {
  penDown = false;
  previous = null;
};

const handleMouseDown = () => {
  penDown = true;
};

const handleMouseMove = (event: MouseEvent) => {
  if (!penDown) {
    return;
  }

  const x = event.offsetX;
  const y = event.offsetY;

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

    mesh.geometry.setDrawRange(0, (index / 3) % MAX_POINTS);
    mesh.geometry.attributes.position.needsUpdate = true;
    render();
  }
};

renderer.domElement.addEventListener("mousemove", handleMouseMove, false);
renderer.domElement.addEventListener("mousedown", handleMouseDown, false);
renderer.domElement.addEventListener("mouseup", handleMouseUp, false);

animate();

const App = () => <div>hej</div>;

export default App;
