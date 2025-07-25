import './../../css/ui/SortMenu.css'

function SortMenu({ sortOption, onChange }) {
  
  return (
    <select className='translucent pointer' id='sort-menu' value={sortOption} name='sortOption' onChange={(e) => onChange(e.target.value)}>
      <option value="" disabled>Sort By: </option>
      <option value="price:asc">Price (Least Expensive First)</option>
      <option value="price:desc">Price (Most Expensive First)</option>
      <option value="distance:asc">Distance (Nearest First)</option>
      <option value="year:desc">Year (Newest First)</option>
      <option value="year:asc">Year (Oldest First)</option>
      <option value="mileage:asc">Mileage (Lowest First)</option>
      <option value="createdAt:desc">Time on Market (Shortest First)</option>
      <option value="createdAt:asc">Time on Market (Longest First)</option>
    </select>
  )
}

export default SortMenu