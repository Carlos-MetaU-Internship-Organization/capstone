import './../css/ResultsPage.css'
import heart from './../../assets/heart.png'
import pinkHeart from './../../assets/pinkHeart.png'
import Header from './Header'
import Listing from './Listing'
import { baseURL } from '../../globals'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { logInfo, logWarning, logError } from './../../utils/logging.service';
import { fetchListings } from './../../utils/helpers'
import axios from 'axios'

function ResultsPage() {
  const info = useLocation();
  const makes = info.state.makes;
  const filters = info.state.filters;

  const navigate = useNavigate();

  const [form, setForm] = useState({
    color: '',
    minYear: '',
    maxYear: '',
    maxMileage: '',
    minPrice: '',
    maxPrice: '',
    sortOption: '',
    ...filters,
  })

  const [models, setModels] = useState(info.state.models);
  const [listingsInfo, setListingsInfo] = useState({});
  const [favoritedVins, setFavoritedVins] = useState([]);
  const [page, setPage] = useState(1);
  const [searchChange, setSearchChange] = useState(false);
  
  const [savedPreferences, setSavedPreferences] = useState([]);
  const [isSearchFavorited, setIsSearchFavorited] = useState(false);
  
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
  }, [navigate]);

  useEffect(() => {
    if (form.sortOption != '') {
      handleSearch();
    }
  }, [form.sortOption])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const favoritedListingsResponse = await axios.get(`${baseURL}/api/listings/user/favorited`, { withCredentials: true });
        const vins = favoritedListingsResponse.data.favoritedListings.map(listing => listing.vin);
        setFavoritedVins(vins);

        const searchPreferences = await axios.get(`${baseURL}/api/preferences/`, { withCredentials: true });
        if (searchPreferences) {
          setSavedPreferences(searchPreferences.data);
        }

        handleSearch();
      } catch (error) {
        logError('Something went wrong when initializing the page', error);
      }
    }
    fetchData();
  }, [])

  useEffect(() => {
    if (savedPreferences.length > 0) {
      const isSaved = savedPreferences.some(preference => {
        return (
          preference.condition == form.condition &&
          preference.make == form.make &&
          preference.model == form.model &&
          preference.distance == form.distance &&
          preference.zip == form.zip &&
          preference.color == form.color &&
          preference.minYear == form.minYear &&
          preference.maxYear == form.maxYear &&
          preference.maxMileage == form.maxMileage &&
          preference.minPrice == form.minPrice &&
          preference.maxPrice == form.maxPrice
        )
      })
      setIsSearchFavorited(isSaved);
    }
  }, [form, savedPreferences])

  const handleSearchFavoriteClick = async () => {
    const response = await axios.post(`${baseURL}/api/preferences`, form, { withCredentials: true })
    const preference = response.data.preference;
    if (response.data.inDB) {
      setSavedPreferences(prev => [...prev, preference])
    } else {
      setSavedPreferences(prev => prev.filter(pref => pref.id !== preference.id));
      document.getElementById('saved-search-select-elem').value = "";
    }
    setIsSearchFavorited(prev => !prev);
  }


  const handlePageChange = () => {
    const newPage = page + 1;
    handleSearch(null, newPage);
  }

  const updateModels = async (selection) => {
    try {
      const response = await axios.get(`${baseURL}/api/search/${selection}/models`, { withCredentials: true });
      const models = response.data;
      logInfo('Models successfully retrieved');
      setModels(models);
      if (!form.model) {
        setForm(prev => ({...prev, model: models[0].name}))
      }
    } catch (error) {
      logError('HTTP request failed when trying to fetch models', error);
    }
  }

  const updateForm = async (event) => {
    if (event.target.name != 'sortOption') {
      setSearchChange(true);
    }
    const elem = event.target.name;
    const value = event.target.value;
    setForm(prev => ({...prev, [elem]: value}));
    
    if (elem === 'make') {
      updateModels(value);
    }
  }

  const handleSearch = async (event, page = 1, customForm = form) => {
    if (event) {
      event.preventDefault();
    }

    setPage(page);

    const { make, model } = customForm;
    if (!make || !model) {
      logWarning('Search failed: Missing fields.');
      return
    }

    const params = {
      make: customForm.make,
      model: customForm.model,
      condition: customForm.condition,
      zip: customForm.zip,
      distance: customForm.distance,
      color: customForm.color,
      minYear: customForm.minYear,
      maxYear: customForm.maxYear,
      maxMileage: customForm.maxMileage,
      minPrice: customForm.minPrice, 
      maxPrice: customForm.maxPrice,
      sortOption: customForm.sortOption,
      page
    }

    fetchListings(params).then(data => {
      const listings = data.records;
      const listingCount = data.totalCount;
      setForm(customForm)
      updateModels(customForm.make)
      if (page === 1) {
        setListingsInfo(prev => ({...prev, listings: listings, totalListingsCount: listingCount}));
      } else {
        setListingsInfo(prev => ({...prev, listings: [...prev.listings, ...listings], totalListingsCount: listingCount }))
      }

      navigate('/results', {state: {
        filters: form,
        makes,
        models
      }})
  
      setSearchChange(false);
    })
  }

  const handleSavedPrefLoad = (event) => {
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
      maxPrice: pref.maxPrice,
      sortOption: form.sortOption
    }

    handleSearch(null, 1, updatedForm);
  }

  const colors = ['beige', 'black', 'blue', 'brown', 'gold', 'gray', 'green', 'orange', 'purple', 'red', 'silver', 'white', 'yellow'];

  return (
    <div id='results-page'>
      <Header />
      <div id='result-page-content'>
        <div id='result-page-form-content' className='translucent'>
          <img id='favorite-search-button' className='pointer' height={25} src={isSearchFavorited ? pinkHeart : heart} onClick={handleSearchFavoriteClick}/>
          <form id='advanced-filters' onSubmit={handleSearch}>
            <div className='filter'>
              <label>Condition</label>
              <select className='translucent buy-page-user-selection pointer' id="condition-selector" value={form.condition} name="condition" onChange={updateForm} required>
                <option value="new&used">New & Used</option>
                <option value="new">New</option>
                <option value="used">Used</option>
              </select>
            </div>
            <div className='filter'>
              <label>Make</label>
              <select className='filter-input translucent pointer' value={form.make} name='make' onChange={updateForm}>
                {
                  makes.map(make => {
                    return <option key={make.name} value={make.name}>{make.name}</option>
                  })
                }
              </select>
            </div>
            <div className='filter'>
              <label>Model</label>
              <select className='filter-input translucent pointer' value={form.model} name='model' onChange={updateForm}>
                {
                  models.map(model => {
                    return <option key={model.name} value={model.name}>{model.name}</option>
                  })
                }
              </select>
            </div>
              <div id='result-page-location-details'>
                <label>Distance</label>
                <select className='translucent pointer' value={form.distance} name="distance" onChange={updateForm} required>
                  <option value="50">50 miles</option>
                  <option value="250">250 miles</option>
                  <option value="500">500 miles</option>
                  <option value="3000">Nationwide</option>
                </select>
                <label>ZIP</label>
                <input className='translucent' type="text" name="zip" value={form.zip} onChange={updateForm} required/>
              </div>
            <div className='filter'>
              <label>Color</label>
              <select className='filter-input translucent pointer' name='color' value={form.color} onChange={updateForm}>
                <option value="" disabled></option>
                {
                  colors.map(color => {
                    return <option key={color} value={color}>{(color.charAt(0).toUpperCase()).concat(color.slice(1))}</ option>
                  })
                }
              </select>
            </div>
            <div className='filter'>
              <label>Min Year</label>
              <input type='text' className='filter-input translucent' value={form.minYear} name='minYear' onChange={updateForm}/>
            </div>
            <div className='filter'>
              <label>Max Year</label>
              <input type='text' className='filter-input translucent' value={form.maxYear} name='maxYear' onChange={updateForm}/>
            </div>
            <div className='filter'>
              <label>Max # of Miles</label>
              <input type='text' className='filter-input translucent' value={form.maxMileage} name='maxMileage' onChange={updateForm}/>
            </div>
            <div className='filter'>
              <label>Min Price</label>
              <input type='text' className='filter-input translucent' value={form.minPrice} name='minPrice' onChange={updateForm}/>
            </div>
            <div className='filter'>
              <label>Max Price</label>
              <input type='text' className='filter-input translucent' value={form.maxPrice} name='maxPrice' onChange={updateForm}/>
            </div>
            {
              searchChange && (<button id='result-page-search-button' type='submit'>Search</button>)
            }
          </form>

          <div id='saved-search-selection-box'>
            <label id='saved-search-label'>Load a Saved Search</label>
            <select name="" id="saved-search-select-elem" className='translucent' defaultValue="" onChange={handleSavedPrefLoad}>
              <option value="" disabled selected></option>
              {
                savedPreferences.map(pref => (
                  <option key={pref.id} value={pref.id}>
                    {`${pref.make} ${pref.model}, ${pref.distance}mi from ${pref.zip}, Color: ${pref.color.charAt(0).toUpperCase() + pref.color.slice(1) || 'Any'}`}
                  </option>
                ))
              }
            </select>
          </div>
        </div>
        <div id='result-page-listings-content'>
          <select className='translucent pointer' id='sort-menu' value={form.sortOption} name='sortOption' onChange={updateForm}>
            <option value="" disabled>Sort By: </option>
            <option value="price:asc">Price (Least Expensive First)</option>
            <option value="price:desc">Price (Most Expensive First)</option>
            <option value="distance:asc">Distance (Nearest First)</option>
            <option value="year:desc">Year (Newest First)</option>
            <option value="year:asc">Year (Oldest First)</option>
            <option value="mileage:asc">Mileage (Lowest First)</option>
            <option value="created_at:desc">Time on Market (Shortest First)</option>
            <option value="created_at:asc">Time on Market (Longest First)</option>
          </select>
          <div id='car-listing-list'>
            {
              listingsInfo.listings && listingsInfo.listings.map(listing => {
                return <Listing key={listing.vin} listingData={listing} favoritedOnLoad={favoritedVins.includes(listing.vin)}/>
              })
            }
            {
              (page * 20 < listingsInfo.totalListingsCount) && (<button id='load-more-button' className='translucent pointer' onClick={handlePageChange}>Load More</button>)
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResultsPage