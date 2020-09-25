import * as THREE from "three";

export const renderer = new THREE.WebGLRenderer();
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

export const scene = new THREE.Scene();

export const camera = new THREE.OrthographicCamera(
  0,
  window.innerWidth * 2,
  0,
  window.innerHeight * 2,
  0,
  1
);
camera.position.set(0, 0, 1);

export const material = new THREE.MeshBasicMaterial({ color: 0x000000 });
