function RequiredFilters({ makes, models, filters, setForm}) {
  return (
    <>
      <div className='filter'>
        <label>Condition</label>
        <select className='translucent buy-page-user-selection pointer' id="condition-selector" value={filters.condition} name="condition" onChange={setForm} required>
          <option value="new&used">New & Used</option>
          <option value="new">New</option>
          <option value="used">Used</option>
        </select>
      </div>
      <div className='filter'>
        <label>Make</label>
        <select className='filter-input translucent pointer' value={filters.make} name='make' onChange={setForm} required>
          <option key='' value='' disabled></option>
          {
            makes.map(make => {
              return <option key={make.name} value={make.name}>{make.name}</option>
            })
          }
        </select>
      </div>
      <div className='filter'>
        <label>Model</label>
        <select className='filter-input translucent pointer' value={filters.model} name='model' onChange={setForm} required>
          {
            models.map(model => {
              return <option key={model.name} value={model.name}>{model.name}</option>
            })
          }
        </select>
      </div>
      <div id='result-page-location-details'>
        <label>Distance</label>
        <select className='translucent pointer' value={filters.distance} name="distance" onChange={setForm} required>
          <option value="50">50 miles</option>
          <option value="250">250 miles</option>
          <option value="500">500 miles</option>
          <option value="3000">Nationwide</option>
        </select>
        <label>ZIP</label>
        <input className='translucent' type="text" name="zip" value={filters.zip} onChange={setForm} required/>
      </div>
    </>
  )
}

export default RequiredFilters