import * as THREE from "three";
import { Point } from "./vectors";

type Mesh = {
  points: THREE.Mesh;
  index: number;
};

const meshes: Mesh[] = [];

export const append = (points: Point[]) => {
  // const positions = mesh.geometry.attributes.position.array as number[];
  // for (let i = 0; i < points.length; i++) {
  //   positions[i] = points[i];
  // }
  // mesh.geometry.setDrawRange(0, index / 3);
  // mesh.geometry.attributes.position.needsUpdate = true;
};

export const __TEST_ONLY__ = { meshes };
