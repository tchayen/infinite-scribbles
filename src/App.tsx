import React from "react";
import * as THREE from "three";

// three.js animataed line using BufferGeometry

const MAX_POINTS = 500;
let drawCount = 0;

const info = document.createElement("div");
info.style.position = "absolute";
info.style.top = "30px";
info.style.width = "100%";
info.style.textAlign = "center";
info.style.color = "#fff";
info.style.fontWeight = "bold";
info.style.backgroundColor = "transparent";
info.style.zIndex = "1";
info.style.fontFamily = "Monospace";
info.innerHTML = "three.js animataed line using BufferGeometry";
document.body.appendChild(info);

const size = 600;

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(size, size);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.OrthographicCamera(0, size, 0, size, 1, 10000);
camera.position.set(0, 0, 1000);

const geometry = new THREE.BufferGeometry();

const positions = new Float32Array(MAX_POINTS * 3); // 3 vertices per point
geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

// drawcalls
drawCount = 2; // draw the first 2 points, only
geometry.setDrawRange(0, drawCount);

const material = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 2 });

const line = new THREE.Line(geometry, material);
scene.add(line);

let x = 0,
  y = 0,
  z = 0,
  index = 0;

// // update positions
// updatePositions();

// function updatePositions() {
//   const positions = line.geometry.attributes.position.array as number[];

//   for (var i = 0, l = MAX_POINTS; i < l; i++) {
//     positions[index++] = x;
//     positions[index++] = y;
//     positions[index++] = z;

//     x += (Math.random() - 0.5) * 30;
//     y += (Math.random() - 0.5) * 30;
//     z += (Math.random() - 0.5) * 30;
//   }
// }

// render
function render() {
  renderer.render(scene, camera);
}

// animate
function animate() {
  requestAnimationFrame(animate);

  render();
}

let penDown = false;
let moving = false;

const handleMouseUp = () => {
  penDown = false;
  moving = false;
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

  if (index === 0) {
    line.geometry.attributes.position.needsUpdate = true;
  }

  if (!moving) {
    moving = true;
  } else {
    const positions = line.geometry.attributes.position.array as number[];

    positions[index] = x;
    positions[index + 1] = y;
    positions[index + 2] = 0;
    index += 3;
    line.geometry.setDrawRange(0, (index / 3) % MAX_POINTS);
    line.geometry.attributes.position.needsUpdate = true;
    render();
  }
};

renderer.domElement.addEventListener("mousemove", handleMouseMove, false);
renderer.domElement.addEventListener("mousedown", handleMouseDown, false);
renderer.domElement.addEventListener("mouseup", handleMouseUp, false);

animate();

const App = () => <div>hej</div>;

export default App;
