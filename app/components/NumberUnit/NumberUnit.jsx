import React from "react";
import "./NumberUnit.css";
import { useState } from "react";
import { useCallback } from "react";
import { useEffect } from "react";
import { Select } from "@shopify/polaris";

const NumberUnit = ({ position, type, label, options, value, onChange }) => {
  const [unit, setUnit] = useState(value?.match(/[a-z%]+/i)[0]);
  const [number, setNumber] = useState(parseInt(value));

  useEffect(() => {
    onChange(number + unit);
  }, [unit, number]);

  function createRandomString(length) {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  useEffect(() => {
    setUnit(value?.match(/[a-z%]+/i)[0]);
    setNumber(parseInt(value));
  }, [value]);

  const id = createRandomString(24);

  return (
    <div className={`NumberUnit ${position || "left"}`}>
      <label htmlFor={`NumberUnit-${id}`}>{label}</label>
      <div className="filed">
        <input
          className={position || "left"}
          type={type}
          name=""
          id={`NumberUnit-${id}`}
          value={number}
          onChange={(e) => setNumber(e.target.value)}
        />
        <Select
          name="date_range"
          options={options}
          value={unit}
          onChange={(v) => setUnit(v)}
        />
      </div>
    </div>
  );
};

export default NumberUnit;
