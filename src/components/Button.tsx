import React from "react";

type Props = {
  title: string;
  onClick: () => void;
  arrow?: boolean;
};

const Button = ({ title, onClick, arrow }: Props) => {
  return (
    <button
      style={{
        paddingLeft: 24,
        paddingRight: 24,
        height: 50,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 25,
        color: "#FFFFFF",
        border: "none",
        cursor: "pointer",
        fontSize: 20,
        fontWeight: 600,
      }}
      onClick={onClick}
    >
      <span>{title}</span>
      {arrow && (
        <div style={{ display: "flex", marginLeft: 16 }}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14.25 8L14.9323 7.26894L15.7156 8L14.9323 8.73106L14.25 8ZM14.25 9H0.75V7H14.25V9ZM13.5677 8.73106L6.06768 1.73106L7.43232 0.268945L14.9323 7.26894L13.5677 8.73106ZM14.9323 8.73106L7.43232 15.7311L6.06768 14.2689L13.5677 7.26894L14.9323 8.73106Z"
              fill="white"
            />
          </svg>
        </div>
      )}
    </button>
  );
};

export default Button;
