import React from "react";
import "./TextInput.css";

const TextInput = ({ type, label, value, onChange }) => {
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
    <div className="TextImport">
      <label htmlFor={`TextInput-${id}`}>{label}</label>
      <input
        type={type}
        name=""
        id={`TextInput-${id}`}
        defaultValue={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default TextInput;
