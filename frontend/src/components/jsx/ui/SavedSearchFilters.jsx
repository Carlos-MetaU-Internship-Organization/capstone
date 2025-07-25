import "./../../css/ui/SavedSearchFilters.css";
import React from "react";

function SavedSearchFilters({ searchFilters, onLoad }) {
  return (
    searchFilters.length > 0 && (
      <>
        <h3>OR</h3>
        <div className="saved-search-selection-box">
          <label className="saved-search-label">Load a Saved Search</label>
          <select
            className="saved-search-select-elem translucent"
            defaultValue=""
            onChange={onLoad}
          >
            <option value="" disabled></option>
            {searchFilters.map((searchFilter) => (
              <option key={searchFilter.id} value={searchFilter.id}>
                {`${searchFilter.make} ${searchFilter.model}, ${searchFilter.distance}mi from ${searchFilter.zip}, Color: ${searchFilter.color ? searchFilter.color.charAt(0).toUpperCase() + searchFilter.color.slice(1) : "Any"}`}
              </option>
            ))}
          </select>
        </div>
      </>
    )
  );
}

export default React.memo(SavedSearchFilters);
