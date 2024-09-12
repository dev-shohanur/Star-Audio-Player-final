import React from "react";
import "./SwitchControl.css";

const SwitchControl = ({ label, value, onChange }) => {
  const toggleSwitch = () => {
    onChange((prevState) => !prevState);
  };

  return (
    <div className="SwitchControl">
      <label htmlFor="switch" className="label">
        {label}
      </label>
      <label className={value ? "switch active" : "switch"}>
        <input
          id="switch"
          type="checkbox"
          checked={value}
          onChange={toggleSwitch}
        />
        <span className="slider round"></span>
      </label>
    </div>
  );
};

export default SwitchControl;
