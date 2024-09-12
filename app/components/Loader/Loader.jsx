import React from "react";
import "./loader.css";

const Loader = () => {
  return (
    <div
      style={{
        height: "100dvh",
        width: "100dvw",
        display: "flex",
        alignContent: "center",
        justifyContent: "center",
        backdropFilter: blur("50px"),
        zIndex: 99999,
        position: "absolute",
        inset: 0,
      }}
    >
      <div style={{ position: "relative" }}>
        <div
          className="inner-circle-loader"
          style={{
            width: "50px",
            height: "50px",
            backgroundColor: "transparent",
            borderRadius: "50%",
            borderLeft: "2px solid",
            borderRight: "2px solid",
            borderBottom: "2px solid",
            borderTop: "2px solid transparent",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, 50%)",
          }}
        ></div>
      </div>
    </div>
  );
};

export default Loader;
