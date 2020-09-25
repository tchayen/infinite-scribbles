import * as THREE from "three";
import { ZOOM } from "./consts";

export let renderer: THREE.WebGLRenderer;
export let scene: THREE.Scene;
export let camera: THREE.OrthographicCamera;

export const render = () => {
  renderer.render(scene, camera);
};

export const setup = () => {
  renderer = new THREE.WebGLRenderer();
  scene = new THREE.Scene();

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth * ZOOM, window.innerHeight * ZOOM);
  renderer.domElement.setAttribute(
    "style",
    `width: ${window.innerWidth}px; height: ${window.innerHeight}px`
  );
  renderer.setClearColor(0xffffff, 1);
  document.body.appendChild(renderer.domElement);

  // Near and far were picked at random.
  camera = new THREE.OrthographicCamera(
    0,
    window.innerWidth * ZOOM,
    0,
    window.innerHeight * ZOOM,
    0,
    1
  );

  // Camera's Z position can be anything within the range of frustum as is
  // ortographic projection all objects have the same size.
  camera.position.set(0, 0, 1);
};

export const material = new THREE.MeshBasicMaterial({ color: 0x000000 });
