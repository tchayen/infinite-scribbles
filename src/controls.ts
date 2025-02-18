import { renderer, render, camera } from "./three";
import { getLine, Point } from "./vectors";
import * as geometry from "./geometry";
import { LINE_WIDTH, ZOOM } from "./consts";

document.body.style.cursor = "default";

type Mode = "drawing" | "panning";
let mode: Mode = "drawing";

let penDown = false;

let previous: Point | null = null;
let mousePosition: { x: number; y: number } | null = null;
let offset: { x: number; y: number } = { x: 0, y: 0 };

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === " ") {
    mode = "panning";
    document.body.style.cursor = "grabbing";
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
    mode = "drawing";
    mousePosition = null;
    document.body.style.cursor = "default";
  } else if (event.key === "d") {
    mode = "drawing";
    document.body.style.cursor = "default";
  } else if (event.key === "m") {
    mode = "panning";
    document.body.style.cursor = "grab";
  }
};

const handleMouseUp = () => {
  penDown = false;
  previous = null;
  mousePosition = null;

  if (mode === "drawing") {
    geometry.flush();
  } else if (mode === "panning") {
    document.body.style.cursor = "grab";
  }
};

const handleMouseDown = (event: MouseEvent) => {
  penDown = true;

  if (mode === "panning") {
    document.body.style.cursor = "grabbing";
    mousePosition = { x: event.offsetX, y: event.offsetY };
  }
};

const handleMouseMove = (event: MouseEvent) => {
  if (mode === "panning") {
    if (penDown && mousePosition !== null) {
      const deltaX = mousePosition.x - event.offsetX;
      const deltaY = mousePosition.y - event.offsetY;

      camera.translateX(deltaX * ZOOM);
      camera.translateY(deltaY * ZOOM);

      offset.x += deltaX;
      offset.y += deltaY;

      mousePosition = {
        x: mousePosition.x - deltaX,
        y: mousePosition.y - deltaY,
      };

      render();
    }
  } else if (mode === "drawing") {
    if (!penDown) {
      return;
    }

    const x = (event.offsetX + offset.x) * ZOOM;
    const y = (event.offsetY + offset.y) * ZOOM;

    if (previous === null) {
      previous = [x, y];
    } else {
      const current: Point = [x, y];

      // TODO: implement some more effective filters here.

      // Skip new point if it is closer than 2 pixels in euclidean metric.
      if (
        (current[0] - previous[0]) ** 2 + (current[1] - previous[1]) ** 2 <
        4
      ) {
        return;
      }

      const line = getLine(previous, current, LINE_WIDTH);
      previous = current;
      geometry.append(line, previous, current);
      render();
    }
  } else if (mode === "erasing") {
    // const x = (event.offsetX + offset.x) * ZOOM;
    // const y = (event.offsetY + offset.y) * ZOOM;
    // if (previous === null) {
    //   previous = [x, y];
    // } else {
    //   const current: Point = [x, y];
    //   geometry.erase(previous, current);
    // }
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
