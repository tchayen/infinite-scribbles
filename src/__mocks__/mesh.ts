import {
  LINES_IN_BUFFER,
  POINTS_IN_TRIANGLE,
  TRIANGLES_IN_LINE,
  VALUES_IN_POINT,
} from "../consts";

type FakeMesh = {
  object: {
    points: number[];
    range: number;
  };
};

const create = () => {
  return {
    points: [],
    range: 0,
  };
};

const update = (mesh: FakeMesh, index: number) => {
  mesh.object.range = index % LINES_IN_BUFFER;
};

const appendValues = (mesh: FakeMesh, index: number, values: number[]) => {
  for (let i = 0; i < values.length; i++) {
    mesh.object.points[
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
