import './../css/BuyPage.css'
import car from './../../assets/car.jpg'
import arrow from './../../assets/arrow.png'
import Header from './Header'
import { baseURL } from '../../globals'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { logInfo, logWarning, logError } from '../../services/loggingService';
import { getFavoritedListings, getMostDwelledListings, getModels, getUserZIP, getSavedSearchFilters } from '../../utils/api'
import axios from 'axios'
import { PAGE_SIZE } from '../../utils/constants'

function BuyPage() {

  // TODO: display error/warning messages to users

  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [filters, setFilters] = useState({
    condition: 'new&used',
    make: '',
    model: '',
    distance: '50',
    zip: '',
    color: '',
    minYear: '',
    maxYear: '',
    maxMileage: '',
    minPrice: '',
    maxPrice: ''
  })
  const [mostDwelledListing, setMostDwelledListing] = useState(null);
  const [favoritedListings, setFavoritedListings] = useState([]);
  const [savedSearchFilters, setSavedSearchFilters] = useState([]);
  const [page, setPage] = useState(1);

  const navigate = useNavigate();

  // ON BOOT
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          makesResponse,
          favoritedListingsResponse,
          mostDwelledListingsResponse,
          savedSearchFiltersResponse,
          zipResponse
        ] = await Promise.all([
          axios.get(`${baseURL}/api/makeModels/makes`, { withCredentials: true }),
          getFavoritedListings(),
          getMostDwelledListings(PAGE_SIZE),
          getSavedSearchFilters(),
          getUserZIP()
        ])

        setMakes(makesResponse.data)
        setFavoritedListings(favoritedListingsResponse.favoritedListings);
        setMostDwelledListing(mostDwelledListingsResponse.mostDwelledListings[0])
        setSavedSearchFilters(savedSearchFiltersResponse.savedSearchFilters)
        setFilters(prev => ({ ...prev, zip: zipResponse.zip }))
      } catch (error) {
        logError('One or more parallel requests went wrong', error)
      }
    }

    fetchData()
  }, []);
  
  const updateFilters = async (event) => {
    const elem = event.target.name;
    const value = event.target.value;
    setFilters(prev => ({...prev, [elem]: value}));
    
    if (elem === 'make') {
      updateModels(value);
    }
  }
  
  const updateModels = async (make) => {
    const models = await getModels(make);
    if (models) {
      setModels(models);
      setFilters(prev => ({...prev, model: models[0].name}))
    } else {
      // TODO: message component error
    }
  }
  
  const handleSearch = async (event) => {
    event.preventDefault();

    const { make, model, condition, zip, distance } = filters;
    if (!make || !model || !condition || !zip || !distance) {
      logWarning('Search failed: Missing fields.');
      return
    }

    localStorage.setItem('recentSearch', JSON.stringify( { filters, makes, models }))

    navigate('/results');
  }

  const handlePageChange = (event) => {
    if (event.target.id === 'flipped-arrow') {
      setPage(prev => prev - 1);
    } else {
      setPage(prev => prev + 1);
    }
  }

  const handleSavedSearchFilterLoad = async (event) => {
    const savedSearchFilterId = event.target.value;
    const savedSearchFilter = savedSearchFilters.find(searchFilter => searchFilter.id == savedSearchFilterId)
    
    const updatedForm = {
      make: savedSearchFilter.make,
      model: savedSearchFilter.model,
      condition: savedSearchFilter.condition,
      zip: savedSearchFilter.zip,
      distance: savedSearchFilter.distance,
      color: savedSearchFilter.color || '',
      minYear: savedSearchFilter.minYear || '',
      maxYear: savedSearchFilter.maxYear || '',
      maxMileage: savedSearchFilter.maxMileage || '',
      minPrice: savedSearchFilter.minPrice || '', 
      maxPrice: savedSearchFilter.maxPrice || ''
    }

    const models = await getModels(updatedForm.make);

    localStorage.setItem('recentSearch', JSON.stringify( { filters: updatedForm, makes, models }))

    navigate('/results');
  }


  return (
    <div id='buy-page'>
      <Header />
      <div id='buy-content'>
        <div id='buy-search'>
          <form className='translucent' id='filter-search' onSubmit={handleSearch}>
            <div id='filters'>
              <label>Condition</label>
              <select className='translucent buy-page-user-selection pointer' id="condition-selector" name="condition" onChange={updateFilters} required>
                <option value="new&used">New & Used</option>
                <option value="new">New</option>
                <option value="used">Used</option>
              </select>
              <label>Make</label>
              <select className='translucent buy-page-user-selection pointer' id="make-selector" name="make" onChange={updateFilters} required>
                <option disabled selected></option>
                {
                  makes.map(make => {
                    return <option value={make.name}>{make.name}</option>
                  })
                }
              </select>
              <label>Model</label>
              <select className='translucent buy-page-user-selection pointer' id="model-selector" name="model" onChange={updateFilters} required>
                {
                  models.length > 0 && models.map(model => {
                    return <option value={model.name}>{model.name}</option>
                  })
                }
              </select>
              <div id='location-details'>
                <label>Distance</label>
                <select className='translucent buy-page-user-selection pointer' name="distance" onChange={updateFilters} required>
                  <option value="50">50 miles</option>
                  <option value="250">250 miles</option>
                  <option value="500">500 miles</option>
                  <option value="3000">Nationwide</option>
                </select>
                <label>ZIP</label>
                <input className='translucent buy-page-user-selection' type="text" name="zip" defaultValue={filters.zip} onChange={updateFilters} required/>
              </div>
            </div>
            <button className='translucent' id='search-button' type='submit'>Search</button>
          </form>
          {
            savedSearchFilters.length > 0 && (
              <>
                <h3>OR</h3>
                <div id='buy-page-saved-search-selection-box'>
                  <label id='buy-page-saved-search-label'>Load a Saved Search</label>
                  <select id="buy-page-saved-search-select-elem" className='translucent' defaultValue="" onChange={handleSavedSearchFilterLoad}>
                    <option value="" disabled></option>
                    {
                      savedSearchFilters.map(searchFilter => (
                        <option key={searchFilter.id} value={searchFilter.id}>
                          {`${searchFilter.make} ${searchFilter.model}, ${searchFilter.distance}mi from ${searchFilter.zip}, Color: ${searchFilter.color ? searchFilter.color.charAt(0).toUpperCase() + searchFilter.color.slice(1) : 'Any'}`}
                        </option>
                      ))
                    }
                  </select>
                </div>
              </>
            )
          }
        </div>
        {
          mostDwelledListing &&
          <div id='most-viewed-container'>
            <h2>Still Interested?</h2>
            <div className='translucent most-viewed-listing pointer'>
              <img src={mostDwelledListing.images[0]} id='most-viewed-car-img' className='car-image' onClick={() => navigate(`/listing/${mostDwelledListing.vin}`)}/>
              <div id='most-viewed-car-info'>
                <p>Make: {mostDwelledListing.make}</p>
                <p>Model: {mostDwelledListing.model}</p>
                <p>Year: {mostDwelledListing.year}</p>
                <p>Location: {mostDwelledListing.city}, {mostDwelledListing.state}</p>
                <p>Price: ${parseInt(mostDwelledListing.price).toLocaleString('en-US')}</p>
              </div>
            </div>
          </div>
        }
      </div>
      {
        favoritedListings.length > 0 &&
        (
          <div id='favorites-container'>
            <label id='favorites-label' className='pointer'>Your Favorites</label>
            <div id='favorite-cars'>
              {
                page > 1 && (<img src={arrow} height='50px' id='flipped-arrow' className='pointer' onClick={handlePageChange}/>) 
              }
              {
                favoritedListings.slice((4 * (page - 1)), (4 * page)).map(listing => {
                  return <img key={listing.id} src={listing.images[0]} className='listing-image pointer' onClick={() => navigate(`/listing/${listing.vin}`)}/>
                })
              }
              {
                favoritedListings.length > page * 4 && (<img src={arrow} height='50px' className='pointer' onClick={handlePageChange}/>)
              }
            </div>
          </div>
        )
      }
    </div>
  )
}

export default BuyPage