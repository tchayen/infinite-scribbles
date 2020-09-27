import { renderer, render, camera } from "./three";
import { getLine, Point } from "./vectors";
import * as geometry from "./geometry";
import { ZOOM } from "./consts";

const DRAWING_CURSOR = `url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACpSURBVHgB7dWxDcMgEIXhk7IAI9wojMAG8Shskhslm9CmSzYg95CRSGRRmKOx+KUny819hQvfyDav23Qf3YsmdGfmHGPMeOKdjCtASikjPK2hH6CGd+ccIE+DHQK1EAKQQAN1AREBkHRMJ1vAAhZwBSDMBmg/UI7NAjyAuhayApC0SIUsAf4HmpkASA6Ov3UPKwCVD94cjzpHhm378ScN/ip7MRn87Ht9AXj58RlNV55UAAAAAElFTkSuQmCC") -1 22, auto`;
const MOVING_CURSOR = `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAARCAYAAAA7bUf6AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAD3SURBVHgBrVTBEYIwELxRCqCE+PMJFUAH8PRJCZSQUuxAOwhUEjqAp794m0kYBCOi7MzCcXB7e5mEIy0RMy8uPjMr5uDihPlwzx+hy7I0QghLKeUYI4/3rtEC6NCD+BBAMTiPnZAXQx1FTMG8KaXitm3XXFKSJJZFUYg0TRWnTge+5Kwu8jynLYBQVVUYq7ROkJgjy7LVmNfJ3qJQp6mzUOxxoB3w4mRq9WeRrYvrscs4EOkY9A8gcmfQMKwehwVczVio/LbeApwnclsfEMyeHX0tgKaYYu4Oirqua6O1DhY3TWN4u/sDKN6NieTVfWAC7JiSJr+DJ0a04vAJkY+mAAAAAElFTkSuQmCC') 0 0, auto`;
const ERASER_CURSOR = `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAC1SURBVHgBtc1RDcMwDEXRSCOQMgiEQCiEQRiEMFgYBkLGIGOQOVI75aP17FfvSf70uTeHb6V70L3o3s54T7q+XaOLznAzbh45ws0iHH45IsHhiAZXRxB8jngWDyF07z0aGLeyeK21l1LQSP2J7wMiAw8iHIjocUUExwWRU/wuxZnIKT6WU0pduynC4mNxWZY2HjTLOYtwKKLFVREUF0Wu4mzECj+MWOPfCF2LMf4F3xe2kHfgPi+sN3A9WiV4AAAAAElFTkSuQmCC') 0 0, auto`;

document.body.style.cursor = DRAWING_CURSOR;

type Mode = "drawing" | "erasing" | "panning";
let mode: Mode = "drawing";

let penDown = false;

let previous: Point | null = null;
let mousePosition: { x: number; y: number } | null = null;
let offset: { x: number; y: number } = { x: 0, y: 0 };

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === " ") {
    mode = "panning";
    document.body.style.cursor = MOVING_CURSOR;
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
    document.body.style.cursor = DRAWING_CURSOR;
  }
};

const handleMouseUp = () => {
  penDown = false;
  previous = null;
  mousePosition = null;

  if (mode === "drawing") {
    geometry.flush();
  } else if (mode === "erasing") {
    // Remove erased shape.
  }
};

const handleMouseDown = (event: MouseEvent) => {
  penDown = true;

  if (mode === "panning") {
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

      const line = getLine(previous, current, 4);
      previous = current;
      geometry.append(line, previous, current);
      render();
    }
  } else if (mode === "erasing") {
    // TODO erasing:
    // - Find edges that were crossed.
    // - Copy them to a separate pink material buffer.
    // - Zero them in original places.
    // - When mouse goes up, clear the pink buffer.
    //
    // Future:
    // - Detect emmpty buffers and get rid of them.
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
