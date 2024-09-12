import React, { useState } from "react";
import "./ColoeController.css";

function ColorController({
  label = "Color Control Panel",
  value = "#ffffff",
  onChange,
}) {
  const [color, setColor] = useState("#000000"); // Default color is black

  return (
    <div style={{ padding: "10px" }}>
      <h2 className="colorControllerLabel">{label}</h2>
      <div className="colorControllerInputOptions">
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </div>
  );
}

export default ColorController;
