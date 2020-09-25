// TODO:
// + Aliasing of some kind (done for now, maybe
//   https://blog.mapbox.com/drawing-antialiased-lines-with-opengl-8766f34192dc
//   in the future).
// + Panning when space is pressed.
// + Resizing with the screen.
// + Undo (⌘+Z) and redo (⇧+⌘+Z).
// + Optimize mesh (at least skip overlapping points).
// + Ability to download the whole canvas as an image (find out a bounding box
//   rectangle and preferably generate PNG out of that
//   https://stackoverflow.com/questions/42932645/creating-and-saving-to-file-new-png-image-in-javascript).
// + Prevent window from reloading.
// + Skip popup on space.
// + Creating another mesh when one is full.
// - Add padding to exported image so lines that are touching borders are not cut.
// - If distance to previous point is huge, sample several points from a bezier curve.
// - Custom cursor for pen and eraser and moving.
// - Eraser.
// - Ability to place point in place with no moving.

import React from "react";
import DownloadButton from "./components/DownloadButton";
import Popup from "./components/Popup";
import * as three from "./three";
import * as meshes from "./meshes";
import * as controls from "./controls";

three.setup();
controls.setup();
meshes.setup();
three.render();

const App = () => (
  <div>
    <DownloadButton getSvg={meshes.getSvg} />
    <Popup />
  </div>
);

export default App;
