import React from "react";

type Props = {
  title: string;
  onClick: () => void;
};

const Button = ({ title, onClick }: Props) => {
  return (
    <button
      style={{
        paddingLeft: 24,
        paddingRight: 24,
        height: 50,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#007AFF",
        borderRadius: 25,
        color: "#FFFFFF",
        border: "none",
        cursor: "pointer",
        fontSize: 20,
        fontWeight: 600,
      }}
      onClick={onClick}
    >
      {title}
    </button>
  );
};

export default Button;
