import "./toggleControlStyle.css";

export function ToggleControl({ value = true, onChange = () => {}, label }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div>
        <label
          className="switchLabel"
          style={{ fontSize: "15px", fontWeight: "400", color: "#444" }}
        >
          {label}
        </label>
      </div>
      <div>
        <label className="switch">
          <input
            style={{ display: "none" }}
            type="checkbox"
            onClick={() => onChange(!value)}
            defaultChecked={value}
          />
          <span className="slider round"></span>
        </label>
      </div>
    </div>
  );
}
