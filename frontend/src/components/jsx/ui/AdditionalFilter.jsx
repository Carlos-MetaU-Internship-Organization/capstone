import "./../../css/ui/AdditionalFilter.css";
import React from "react";

function AdditionalFilter({ label, name, value, updateValue }) {
  return (
    <div className="filter">
      <label>{label}</label>
      <input
        type="text"
        className="filter-input translucent"
        value={value}
        name={name}
        onChange={updateValue}
      />
    </div>
  );
}

export default React.memo(AdditionalFilter);
