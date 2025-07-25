import { COLORS } from "./../../../utils/constants";

function ColorSelector({
  className,
  activeColor,
  updateColor,
  disableDefaultOption,
}) {
  return (
    <>
      <label>Color</label>
      <select
        className={`${className} translucent pointer`}
        value={activeColor}
        name="color"
        onChange={updateColor}
      >
        <option
          id="blank-color"
          value=""
          selected
          disabled={disableDefaultOption}
        >
          {disableDefaultOption ? "" : "Any"}
        </option>
        {COLORS.map((color) => {
          return (
            <option value={color}>
              {color.charAt(0).toUpperCase().concat(color.slice(1))}
            </option>
          );
        })}
      </select>
    </>
  );
}

export default ColorSelector;
