import React, { useEffect, useRef } from "react";

const PIXEL_RATIO = window.devicePixelRatio;
const size = 600;

type Point = number[];

const scale = ([x, y]: Point, factor: number): Point => {
  const norm = Math.sqrt(x * x + y * y);
  return [(x / norm) * factor, (y / norm) * factor];
};

const add = (p1: Point, p2: Point): Point => [p1[0] + p2[0], p1[1] + p2[1]];

export const normal = (points: Array<Point>, width: number) => {
  width /= 2;
  const triangles = [];
  for (let i = 0; i < points.length - 1; i++) {
    const dx = points[i + 1][0] - points[i][0];
    const dy = points[i + 1][1] - points[i][1];
    const n1 = scale([dy, -dx], width);
    const n2 = scale([-dy, dx], width);

    triangles.push(
      ...add(points[i + 1], n2),
      ...add(points[i], n2),
      ...add(points[i], n1),
      ...add(points[i], n1),
      ...add(points[i + 1], n1),
      ...add(points[i + 1], n2)
    );
  }
  return triangles;
};

const vertex = `
  attribute vec2 a_position;
  uniform mat3 u_matrix;

  void main() {
    gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);
  }
`;

const fragment = `
  precision mediump float;

  void main() {
    gl_FragColor = vec4(1, 0, 1, 1);
  }
`;

const vertices = new Float32Array([0.0, 0.0, 0.0, 300.0, 200.0, 300.0]);

const setUpCanvas = () => {
  const canvas = document.createElement("canvas");
  canvas.width = size * PIXEL_RATIO;
  canvas.height = size * PIXEL_RATIO;
  canvas.setAttribute("style", `width: ${size}px; height: ${size}px`);
  document.body.appendChild(canvas);
  return canvas;
};

const createShader = (
  gl: WebGLRenderingContext,
  type: number,
  source: string
) => {
  const shader = gl.createShader(type);

  if (shader === null) {
    throw new Error();
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

  if (success) {
    return shader;
  }

  const error = gl.getShaderInfoLog(shader) || "Error";
  gl.deleteShader(shader);

  throw new Error(error);
};

const createProgram = (
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
) => {
  const program = gl.createProgram();

  if (program === null) {
    // TODO: print error?
    throw new Error();
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);

  if (success) {
    return program;
  }

  const error = gl.getProgramInfoLog(program) || "Error";
  gl.deleteProgram(program);

  throw new Error(error);
};

const setup = (
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  vertices: Float32Array
) => {
  // Clearing with color rgba(0, 0, 0, 0) makes the background transparent. Cool.
  gl.clearColor(1, 1, 1, 1);

  const positionLocation = gl.getAttribLocation(program, "a_position");
  const positionBuffer = gl.createBuffer();

  if (positionBuffer === null) {
    throw new Error();
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  const matrixLocation = gl.getUniformLocation(program, "u_matrix");

  if (matrixLocation === null) {
    throw new Error();
  }

  return {
    positionLocation,
    positionBuffer,
    matrixLocation,
  };
};

const draw = (
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  positionBuffer: WebGLBuffer,
  positionLocation: number,
  matrixLocation: WebGLUniformLocation
) => {
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.useProgram(program);

  gl.enableVertexAttribArray(positionLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  const projection = [
    2 / gl.drawingBufferWidth,
    0,
    0,
    0,
    -2 / gl.drawingBufferHeight,
    0,
    -1,
    1,
    1,
  ];
  gl.uniformMatrix3fv(matrixLocation, false, projection);

  gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2);
};

const webgl = () => {
  const canvas = setUpCanvas();
  const gl = canvas.getContext("webgl");

  if (gl === null) {
    return;
  }
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertex);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragment);

  const program = createProgram(gl, vertexShader, fragmentShader);
  const { positionLocation, positionBuffer, matrixLocation } = setup(
    gl,
    program,
    vertices
  );

  // This little trick uses closure to allow our render to be called from
  // window resize event.
  const render = () =>
    draw(gl, program, positionBuffer, positionLocation, matrixLocation);

  render();
};

const App = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const moving = useRef<boolean>(false);
  const accumulated = useRef<number[]>();
  const penDown = useRef<boolean>(false);

  const handleMouseUp = () => {
    penDown.current = false;
    moving.current = false;
    console.log(accumulated.current);
    accumulated.current = [];
  };

  const handleMouseDown = () => {
    penDown.current = true;
    accumulated.current = [];
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!penDown.current) {
      return;
    }

    const canvas: HTMLCanvasElement = ref.current!;
    const context = canvas.getContext("2d");

    if (context === null) {
      return;
    }

    const x = event.offsetX;
    const y = event.offsetY;

    if (!moving.current) {
      context.beginPath();
      context.moveTo(x, y);
      moving.current = true;
    } else {
      context.lineTo(x, y);
      context.stroke();
      accumulated.current!.push(x, y);
    }
  };

  useEffect(() => {
    if (ref.current === null) {
      return;
    }

    ref.current.addEventListener("mousemove", handleMouseMove, false);
    ref.current.addEventListener("mousedown", handleMouseDown, false);
    ref.current.addEventListener("mouseup", handleMouseUp, false);

    webgl();
  }, []);

  return (
    <div style={{}}>
      test
      <canvas
        ref={ref}
        style={{
          margin: 50,
          backgroundColor: "#fff",
          width: size,
          height: size,
        }}
        width={size * PIXEL_RATIO}
        height={size * PIXEL_RATIO}
      />
    </div>
  );
};

export default App;
