import React from "react";

type Props = {
  getSvg: () => string;
};

const DownloadButton = ({ getSvg }: Props) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: 50,
        width: 50,
        cursor: "pointer",
        position: "absolute",
        top: 20,
        right: 20,
        userSelect: "none",
      }}
      onClick={() => {
        const element = document.createElement("a");
        const svg = getSvg();
        element.setAttribute(
          "href",
          `data:text/plain;charset=utf-8,${encodeURIComponent(svg)}`
        );
        element.setAttribute("download", "snapshot.svg");
        element.style.display = "none";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }}
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2 22C2 21.4477 1.55228 21 1 21C0.447715 21 0 21.4477 0 22H2ZM1 27H0C0 27.5523 0.447715 28 1 28L1 27ZM27 27V28C27.5523 28 28 27.5523 28 27H27ZM28 22C28 21.4477 27.5523 21 27 21C26.4477 21 26 21.4477 26 22H28ZM15 1C15 0.447715 14.5523 0 14 0C13.4477 0 13 0.447715 13 1H15ZM14 22L13.2929 22.7071C13.6834 23.0976 14.3166 23.0976 14.7071 22.7071L14 22ZM7.70711 14.2929C7.31658 13.9024 6.68342 13.9024 6.29289 14.2929C5.90237 14.6834 5.90237 15.3166 6.29289 15.7071L7.70711 14.2929ZM21.7071 15.7071C22.0976 15.3166 22.0976 14.6834 21.7071 14.2929C21.3166 13.9024 20.6834 13.9024 20.2929 14.2929L21.7071 15.7071ZM0 22V27H2V22H0ZM1 28H27V26H1V28ZM28 27V22H26V27H28ZM13 1V22H15V1H13ZM14.7071 21.2929L7.70711 14.2929L6.29289 15.7071L13.2929 22.7071L14.7071 21.2929ZM14.7071 22.7071L21.7071 15.7071L20.2929 14.2929L13.2929 21.2929L14.7071 22.7071Z"
          fill="black"
        />
      </svg>
      <span style={{ fontWeight: 600, fontSize: 12 }}>SVG</span>
    </div>
  );
};

export default DownloadButton;
