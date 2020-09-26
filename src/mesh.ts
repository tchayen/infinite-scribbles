import * as THREE from "three";
import {
  LINES_IN_BUFFER,
  POINTS_IN_TRIANGLE,
  TRIANGLES_IN_LINE,
  VALUES_IN_POINT,
} from "./consts";
import { material, scene } from "./three";

export type Mesh = {
  object: THREE.Mesh<THREE.BufferGeometry>;
};

const create = () => {
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

  scene.add(mesh);

  return mesh;
};

const update = (mesh: Mesh, index: number) => {
  mesh.object.geometry.setDrawRange(
    0,
    index * POINTS_IN_TRIANGLE * TRIANGLES_IN_LINE
  );

  mesh.object.geometry.attributes.position.needsUpdate = true;
};

const appendValues = (mesh: Mesh, index: number, values: number[]) => {
  const positions = mesh.object.geometry.attributes.position.array as number[];

  for (let i = 0; i < values.length; i++) {
    positions[
      (index % LINES_IN_BUFFER) *
        VALUES_IN_POINT *
        POINTS_IN_TRIANGLE *
        TRIANGLES_IN_LINE +
        i
    ] = values[i];
  }
};

const mesh = {
  create,
  update,
  appendValues,
};

export default mesh;
