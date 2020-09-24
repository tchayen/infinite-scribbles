import React, { useState } from "react";
import Button from "./Button";

const Popup = () => {
  const [show, setShow] = useState(true);

  if (!show) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        width: "100vw",
        height: "100vh",
        top: 0,
        left: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.15)",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          width: 600,
          padding: 32,
          borderRadius: 10,
          boxShadow:
            "0 3px 6px rgba(0, 0, 0 , 0.15), 0 2px 4px rgba(0, 0, 0 , 0.12)",
        }}
      >
        <h2>Drawing editor</h2>
        <ul>
          <li>
            Just <strong>press</strong> your mouse (or tablet pen) to draw.
          </li>
          <li>
            Hold <strong>space</strong> to drag and move.
          </li>
          <li>Download your note as SVG in the top right corner.</li>
          {/* <li>
            Press <strong>escape</strong> to see this window.
          </li> */}
          {/* <li>Change color and brush size in the panel at the top.</li> */}
          <li>
            Contact me{" "}
            <strong>
              <a href="https://twitter.com/tchayen">@tchayen</a>
            </strong>{" "}
            on Twitter if you have any ideas or suggestions.
          </li>
        </ul>
        <div
          style={{ display: "flex", justifyContent: "center", marginTop: 32 }}
        >
          <Button arrow title="Start" onClick={() => setShow(false)} />
        </div>
      </div>
    </div>
  );
};

export default Popup;
