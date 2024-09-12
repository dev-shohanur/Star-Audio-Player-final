import React from "react";
import "./SelectInput.css";
import { Select } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";

const SelectInput = ({ position, label, options, value, onChange }) => {
  function createRandomString(length) {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  const id = createRandomString(24);
  return (
    <div className={`SelectInput-Container ${position || "left"}`}>
      <>
        <label htmlFor={`SelectInput-${id}`}>{label}</label>
        {/* <select
          name="SelectInput"
          id={`SelectInput-${id}`}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((option, i) => (
            <option key={i} value={option.value}>
              {option.label}
            </option>
          ))}
        </select> */}
        <Select
          id={`SelectInput-${id}`}
          name="date_range"
          options={options}
          value={value}
          onChange={onChange}
        />
      </>
    </div>
  );
};

export default SelectInput;
