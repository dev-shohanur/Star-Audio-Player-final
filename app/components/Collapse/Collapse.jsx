import { Icon } from "@shopify/polaris";
import React, { useState } from "react";
import { CaretDownIcon, CaretUpIcon } from "@shopify/polaris-icons";
import "./Collapse.css";

const Collapse = ({ title, height, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="collapse">
      <div className="collapse-header" onClick={() => setIsOpen(!isOpen)}>
        <span className="collapse-title">{title}</span>
        <Icon source={isOpen ? CaretDownIcon : CaretUpIcon} tone="base" />
      </div>
      <div
        className="collapse-container"
        style={{ maxHeight: isOpen && height + "px" }}
      >
        {<div className="collapse-content">{children}</div>}
      </div>
    </div>
  );
};

export default Collapse;
