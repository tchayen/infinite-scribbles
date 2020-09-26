import { renderer, render, camera } from "./three";
import { getLine, Point } from "./vectors";
import * as geometry from "./geometry";

let penDown = false;
let holdingSpace = false;

let previous: Point | null = null;
let mousePosition: { x: number; y: number } | null = null;
let offset: { x: number; y: number } = { x: 0, y: 0 };

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === " ") {
    holdingSpace = true;
    document.body.style.cursor = "move";
  } else if (event.key === "z" && (event.ctrlKey || event.metaKey)) {
    if (event.shiftKey) {
      geometry.redo();
    } else {
      geometry.undo();
    }
    render();
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

  geometry.mouseUp();

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

    render();
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
    const current: Point = [x, y];

    // Skip new point if it is closer than 2 pixels in euclidean metric.
    // TODO: implement some more effective filters here.
    if ((current[0] - previous[0]) ** 2 + (current[1] - previous[1]) ** 2 < 4) {
      return;
    }

    const line = getLine(previous, current, 4);
    previous = current;
    geometry.append(line, previous, current);
    render();
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

export const setup = () => {
  window.addEventListener("mousemove", handleMouseMove, false);
  renderer.domElement.addEventListener("mousedown", handleMouseDown, false);
  renderer.domElement.addEventListener("mouseup", handleMouseUp, false);
  window.addEventListener("keyup", handleKeyUp, false);
  window.addEventListener("keydown", handleKeyDown, false);
  window.addEventListener("resize", handleWindowResize, false);
};
