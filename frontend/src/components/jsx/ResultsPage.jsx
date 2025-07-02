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
    ...filters,
    color: '',
    minYear: '',
    maxYear: '',
    maxMileage: '',
    minPrice: '',
    maxPrice: '',
    sortOption: ''
  })

  const [models, setModels] = useState(info.state.models);
  const [isSearchFavorited, setIsSearchFavorited] = useState(false);
  const [listings, setListings] = useState(info.state.listings.records);
  const [page, setPage] = useState(1);
  const [searchChange, setSearchChange] = useState(false);
  
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

  const handleSearchFavoriteClick = (event) => {
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
      setForm(prev => ({...prev, model: models[0].name}))
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

  const handleSearch = async (event, page = 1) => {
    if (event) {
      event.preventDefault();
    }

    setPage(page);

    const { make, model } = form;
    if (!make || !model) {
      logWarning('Search failed: Missing fields.');
      return
    }

    const params = {
      make: form.make,
      model: form.model,
      condition: form.condition,
      zip: form.zip,
      distance: form.distance,
      color: form.color,
      minYear: form.minYear,
      maxYear: form.maxYear,
      maxMileage: form.maxMileage,
      minPrice: form.minPrice, 
      maxPrice: form.maxPrice,
      sortOption: form.sortOption,
      page
    }

    fetchListings(params).then(data => {
      const matching_listings = data.records;
      if (page === 1) {
        setListings(matching_listings);
      } else {
        setListings(prev => [...prev, ...matching_listings])
      }
  
      setSearchChange(false);
    })
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
                    return <option value={make.name}>{make.name}</option>
                  })
                }
              </select>
            </div>
            <div className='filter'>
              <label>Model</label>
              <select className='filter-input translucent pointer' value={form.model} name='model' onChange={updateForm}>
                {/* <option value="" disabled></option> */}
                {
                  models.map(model => {
                    return <option value={model.name}>{model.name}</option>
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
                <option disabled selected></option>
                {
                  colors.map(color => {
                    return <option value={color}>{(color.charAt(0).toUpperCase()).concat(color.slice(1))}</ option>
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
        </div>
        <div id='result-page-listings-content'>
          <select className='translucent pointer' id='sort-menu' value={form.sortOption} name='sortOption' onChange={updateForm}>
            <option value="" disabled selected>Sort By: </option>
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
              listings && listings.map(listing => {
                return <Listing listingData={listing} />
              })
            }
            <button id='load-more-button' className='translucent pointer' onClick={handlePageChange}>Load More</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResultsPage