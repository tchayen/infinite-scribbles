// TODO:

// Important:
// - Eraser.
// - Handle going out of the canvas with cursor (or over the download button).

// Nice to have:
// - Custom cursors for pen and eraser and moving.
// - A way to download a PNG.
// - If distance to previous point is huge, sample several points from a bezier curve.
// - Ability to place point in place with no moving.

import React from "react";
import DownloadButton from "./components/DownloadButton";
import Popup from "./components/Popup";
import * as three from "./three";
import * as geometry from "./geometry";
import * as controls from "./controls";

three.setup();
controls.setup();
geometry.setup();
three.render();

const App = () => (
  <div>
    <DownloadButton getSvg={geometry.getSvg} />
    <Popup />
  </div>
);

export default App;
