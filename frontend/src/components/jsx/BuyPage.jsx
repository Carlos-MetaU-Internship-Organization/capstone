import './../css/BuyPage.css'
import car from './../../assets/car.jpg'
import arrow from './../../assets/arrow.png'
import Header from './Header'
import { baseURL } from '../../globals'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { logInfo, logWarning, logError } from './../../utils/logging.service';
import { getModels, getUserZIP } from '../../utils/api'
import axios from 'axios'

function BuyPage() {

  // TODO: display error/warning messages to users

  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [form, setForm] = useState({
    condition: 'new&used',
    make: '',
    model: '',
    distance: '50',
    zip: ''
  })
  const [mostDwelledListing, setMostDwelledListing] = useState(null);
  const [favoritedListings, setFavoritedListings] = useState([]);
  const [savedPreferences, setSavedPreferences] = useState([]);
  const [page, setPage] = useState(1);

  const navigate = useNavigate();

  // ON BOOT
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/auth/check-auth`, { withCredentials: true });
        if (!response.data.authenticated) {
          navigate('/');
        }
      } catch {
        navigate('/');
      }
    }
    checkAuth();

    const getAllMakes = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/search/makes`, { withCredentials: true });
        const makes = response.data;
        logInfo('Makes successfully retrieved');
        setMakes(makes);
      } catch (error) {
        logError('HTTP request failed when trying to fetch makes', error);
      }
    }
    getAllMakes();

    const getFavoritedListings = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/listings/user/favorited`, { withCredentials: true });
        const favoritedListings = response.data.favoritedListings;
        setFavoritedListings(favoritedListings);
      } catch (error) {
        logError('Something bad happened when trying to fetch your favorited listings', error);
      }
    }
    getFavoritedListings();

    const getMostDwelledListing = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/track/most-dwelled-listings`, { withCredentials: true });
        setMostDwelledListing(response.data[0].listing)
      } catch (error) {
        logError('Something bad happened when trying to fetch your 10 most-dwelled listings', error);
      }
    }
    getMostDwelledListing();

    const getSavedSearchPreferences = async () => {
      try {
        const searchPreferences = await axios.get(`${baseURL}/api/preferences/favorites`, { withCredentials: true });
        if (searchPreferences) {
          setSavedPreferences(searchPreferences.data);
        }
      } catch (error) {
        logError('Something bad happened when trying to fetch saved search preferences', error);
      }
    }
    getSavedSearchPreferences();

    const fetchZip = async () => {
      const result = await getUserZIP();
      if (result.success) {
        setForm(prev => ({ ...prev, zip: result.zip }))
      } else {
        logError(result.message)
        // TODO: message component error
      }
    }
    fetchZip();
  }, []);
  
  const updateForm = async (event) => {
    const elem = event.target.name;
    const value = event.target.value;
    setForm(prev => ({...prev, [elem]: value}));
    
    if (elem === 'make') {
      updateModels(value);
    }
  }
  
  const updateModels = async (make) => {
    const models = await getModels(make);
    if (models) {
      setModels(models);
      setForm(prev => ({...prev, model: models[0].name}))
    } else {
      // TODO: message component error
    }
  }
  
  const handleSearch = async (event) => {
    event.preventDefault();

    const { make, model, condition, zip, distance } = form;
    if (!make || !model || !condition || !zip || !distance) {
      logWarning('Search failed: Missing fields.');
      return
    }

    localStorage.setItem('recentSearch', JSON.stringify( { filters: form, makes, models }))

    navigate('/results');
  }

  const handlePageChange = (event) => {
    if (event.target.id === 'flipped-arrow') {
      setPage(prev => prev - 1);
    } else {
      setPage(prev => prev + 1);
    }
  }

  const handleSavedPrefLoad = async (event) => {
    const prefId = event.target.value;
    const pref = savedPreferences.find(pref => pref.id == prefId)
    
    const updatedForm = {
      make: pref.make,
      model: pref.model,
      condition: pref.condition,
      zip: pref.zip,
      distance: pref.distance,
      color: pref.color,
      minYear: pref.minYear,
      maxYear: pref.maxYear,
      maxMileage: pref.maxMileage,
      minPrice: pref.minPrice, 
      maxPrice: pref.maxPrice
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
              <select className='translucent buy-page-user-selection pointer' id="condition-selector" name="condition" onChange={updateForm} required>
                <option value="new&used">New & Used</option>
                <option value="new">New</option>
                <option value="used">Used</option>
              </select>
              <label>Make</label>
              <select className='translucent buy-page-user-selection pointer' id="make-selector" name="make" onChange={updateForm} required>
                <option disabled selected></option>
                {
                  makes.map(make => {
                    return <option value={make.name}>{make.name}</option>
                  })
                }
              </select>
              <label>Model</label>
              <select className='translucent buy-page-user-selection pointer' id="model-selector" name="model" onChange={updateForm} required>
                {
                  models.length > 0 && models.map(model => {
                    return <option value={model.name}>{model.name}</option>
                  })
                }
              </select>
              <div id='location-details'>
                <label>Distance</label>
                <select className='translucent buy-page-user-selection pointer' name="distance" onChange={updateForm} required>
                  <option value="50">50 miles</option>
                  <option value="250">250 miles</option>
                  <option value="500">500 miles</option>
                  <option value="3000">Nationwide</option>
                </select>
                <label>ZIP</label>
                <input className='translucent buy-page-user-selection' type="text" name="zip" defaultValue={form.zip} onChange={updateForm} required/>
              </div>
            </div>
            <button className='translucent' id='search-button' type='submit'>Search</button>
          </form>
          {
            savedPreferences.length > 0 && (
              <>
                <h3>OR</h3>
                <div id='buy-page-saved-search-selection-box'>
                  <label id='buy-page-saved-search-label'>Load a Saved Search</label>
                  <select id="buy-page-saved-search-select-elem" className='translucent' defaultValue="" onChange={handleSavedPrefLoad}>
                    <option value="" disabled></option>
                    {
                      savedPreferences.map(pref => (
                        <option key={pref.id} value={pref.id}>
                          {`${pref.make} ${pref.model}, ${pref.distance}mi from ${pref.zip}, Color: ${pref.color.charAt(0).toUpperCase() + pref.color.slice(1) || 'Any'}`}
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