import React from "react";

function SavedSearchFilters({ searchFilters, onLoad }) {
  return (
    searchFilters.length > 0 && (
      <>
        <h3>OR</h3>
        <div id='buy-page-saved-search-selection-box'>
          <label id='buy-page-saved-search-label'>Load a Saved Search</label>
          <select id="buy-page-saved-search-select-elem" className='translucent' defaultValue="" onChange={onLoad}>
            <option value="" disabled></option>
            {
              searchFilters.map(searchFilter => (
                <option key={searchFilter.id} value={searchFilter.id}>
                  {`${searchFilter.make} ${searchFilter.model}, ${searchFilter.distance}mi from ${searchFilter.zip}, Color: ${searchFilter.color ? searchFilter.color.charAt(0).toUpperCase() + searchFilter.color.slice(1) : 'Any'}`}
                </option>
              ))
            }
          </select>
        </div>
      </>
    )
  )
}

export default React.memo(SavedSearchFilters);