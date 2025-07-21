import './../css/ResultsPage.css'
import heart from './../../assets/heart.png'
import pinkHeart from './../../assets/pinkHeart.png'
import Header from './Header'
import Listing from './Listing'
import SortMenu from './SortMenu'
import { baseURL } from '../../globals'
import { useState, useEffect } from 'react'
import { logInfo, logWarning, logError } from '../../services/loggingService';
import { fetchListings, getModels } from '../../utils/api'
import { sortListings } from './../../utils/listings'
import { PAGE_SIZE } from '../../utils/constants'
import axios from 'axios'

function ResultsPage() {
  
  const cachedRecentSearch = JSON.parse(localStorage.getItem('recentSearch'));
  const { filters: cachedFilters, sortOption: cachedSortOption, listings: cachedListings, makes, models: cachedModels } = cachedRecentSearch;
  
  const [onScreenFilters, setOnScreenFilters] = useState(cachedFilters);
  const [activeFilters, setActiveFilters] = useState(cachedFilters);

  const [models, setModels] = useState(cachedModels);
  const [listingsInfo, setListingsInfo] = useState(cachedListings ? { listings: cachedListings, totalListingsCount: cachedListings.length } : {});
  const [listingsUpdated, setListingsUpdated] = useState(false);
  const [displayedListings, setDisplayedListings] = useState(cachedListings?.slice(0, 20) || [])
  const [favoritedVins, setFavoritedVins] = useState([]);
  const [page, setPage] = useState(1);
  const [sortOption, setSortOption] = useState(cachedSortOption || "");
  const [searchChange, setSearchChange] = useState(false);
  
  const [savedPreferences, setSavedPreferences] = useState([]);
  const [isSearchFavorited, setIsSearchFavorited] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const favoritedListingsResponse = await axios.get(`${baseURL}/api/listings/user/favorited`, { withCredentials: true });
        const vins = favoritedListingsResponse?.data.favoritedListings.map(listing => listing.vin) || [];
        setFavoritedVins(vins);

        const searchPreferences = await axios.get(`${baseURL}/api/preferences/favorites/`, { withCredentials: true });
        if (searchPreferences) {
          setSavedPreferences(searchPreferences.data);
        }

      } catch (error) {
        logError('Something went wrong when initializing the page', error);
      }
    }
    fetchData();
  }, [])

  useEffect(() => {
    const equivalent = (a, b) => (a ?? '') == (b ?? '')
    if (savedPreferences.length > 0) {
      const isSaved = savedPreferences.some(preference => {
        return (
          equivalent(preference.condition, onScreenFilters.condition) &&
          equivalent(preference.make, onScreenFilters.make) &&
          equivalent(preference.model, onScreenFilters.model) &&
          equivalent(preference.distance, onScreenFilters.distance) &&
          equivalent(preference.zip, onScreenFilters.zip) &&
          equivalent(preference.color, onScreenFilters.color) &&
          equivalent(preference.minYear, onScreenFilters.minYear) &&
          equivalent(preference.maxYear, onScreenFilters.maxYear) &&
          equivalent(preference.maxMileage, onScreenFilters.maxMileage) &&
          equivalent(preference.minPrice, onScreenFilters.minPrice) &&
          equivalent(preference.maxPrice, onScreenFilters.maxPrice)
        )
      })
      setIsSearchFavorited(isSaved);
    }
  }, [onScreenFilters, savedPreferences])

  const handleSearchFavoriteClick = async () => {
    const response = await axios.post(`${baseURL}/api/preferences/favorite`, onScreenFilters, { withCredentials: true })
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
    const addedListings = listingsInfo.listings.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
    setDisplayedListings(prev => [...prev, ...addedListings])
    setPage(prev => prev + 1);
  }

  const updateModels = async (make) => {
    const models = await getModels(make);
    if (models) {
      setModels(models);
      setOnScreenFilters(prev => ({...prev, model: models[0].name}))
    } else {
      // TODO: message component error
    }
  }

  const updateForm = async (event) => {
    setSearchChange(true);
    const elem = event.target.name;
    const value = event.target.value;
    setOnScreenFilters(prev => ({...prev, [elem]: value}));
    
    if (elem === 'make') {
      updateModels(value);
    }
  }

  useEffect(() => {
    updateListings(activeFilters)
  }, [activeFilters])

  useEffect(() => {
    if (sortOption) {
      handleSort(sortOption)
    }
    setListingsUpdated(false);
  }, [sortOption, listingsUpdated])

  const updateListings = async (activeFilters) => {

    if (listingsInfo.listings && activeFilters === cachedFilters) {
      return
    }

    const { make, model } = activeFilters;
    if (!make || !model) {
      logWarning('Search failed: Missing fields.');
      return
    }

    const params = {
      make: activeFilters.make,
      model: activeFilters.model,
      condition: activeFilters.condition,
      zip: activeFilters.zip,
      distance: activeFilters.distance,
      color: activeFilters.color,
      minYear: activeFilters.minYear,
      maxYear: activeFilters.maxYear,
      maxMileage: activeFilters.maxMileage,
      minPrice: activeFilters.minPrice, 
      maxPrice: activeFilters.maxPrice
    }

    try {
      const [allListings, _] = await Promise.all([
        fetchListings(params),
        axios.post(`${baseURL}/api/preferences/view`, onScreenFilters, { withCredentials: true })
      ])
    
      if (allListings) {
        localStorage.setItem('recentSearch', JSON.stringify( { filters: activeFilters, sortOption, listings: allListings, makes, models }))
        const listingCount = allListings.length;
    
        setListingsInfo({ listings: allListings, totalListingsCount: listingCount });
        setListingsUpdated(true);
        if (!sortOption) {
          setDisplayedListings(allListings.slice(0, PAGE_SIZE))
        }
        setSearchChange(false);
      } else {
        setListingsInfo({ listings: [], totalListingsCount: 0 })
      }
    } catch (error) {
      // TODO: message component error
    }
  }

  const handleSavedPrefLoad = async (event) => {
    const prefId = event.target.value;
    const pref = savedPreferences.find(pref => pref.id == prefId)
    
    const updatedFilters = {
      make: pref.make,
      model: pref.model,
      condition: pref.condition,
      zip: pref.zip,
      distance: pref.distance,
      color: pref.color || '',
      minYear: pref.minYear || '',
      maxYear: pref.maxYear || '',
      maxMileage: pref.maxMileage || '',
      minPrice: pref.minPrice || '', 
      maxPrice: pref.maxPrice || ''
    }

    const models = await getModels(updatedFilters.make);
    
    localStorage.setItem('recentSearch', JSON.stringify({ filters: updatedFilters, makes, models }))

    setModels(models)
    setOnScreenFilters(updatedFilters)
    setActiveFilters(updatedFilters)
  }

  const handleSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setActiveFilters(onScreenFilters);
    setSearchChange(false);
  }

  const handleSort = async (newSortOption) => {
    localStorage.setItem('recentSearch', JSON.stringify( { filters: activeFilters, sortOption: newSortOption, listings: listingsInfo.listings, makes, models }))

    if (!listingsInfo?.listings?.length) return;

    const [field, order] = newSortOption.split(':');

    const sortedListings = sortListings(listingsInfo.listings, field, order, activeFilters.zip);

    setListingsInfo({ listings: sortedListings, totalListingsCount: sortedListings.length })
    setDisplayedListings(sortedListings.slice(0, page * PAGE_SIZE));
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
              <select className='translucent buy-page-user-selection pointer' id="condition-selector" value={onScreenFilters.condition} name="condition" onChange={updateForm} required>
                <option value="new&used">New & Used</option>
                <option value="new">New</option>
                <option value="used">Used</option>
              </select>
            </div>
            <div className='filter'>
              <label>Make</label>
              <select className='filter-input translucent pointer' value={onScreenFilters.make} name='make' onChange={updateForm}>
                {
                  makes.map(make => {
                    return <option key={make.name} value={make.name}>{make.name}</option>
                  })
                }
              </select>
            </div>
            <div className='filter'>
              <label>Model</label>
              <select className='filter-input translucent pointer' value={onScreenFilters.model} name='model' onChange={updateForm}>
                {
                  models.map(model => {
                    return <option key={model.name} value={model.name}>{model.name}</option>
                  })
                }
              </select>
            </div>
              <div id='result-page-location-details'>
                <label>Distance</label>
                <select className='translucent pointer' value={onScreenFilters.distance} name="distance" onChange={updateForm} required>
                  <option value="50">50 miles</option>
                  <option value="250">250 miles</option>
                  <option value="500">500 miles</option>
                  <option value="3000">Nationwide</option>
                </select>
                <label>ZIP</label>
                <input className='translucent' type="text" name="zip" value={onScreenFilters.zip} onChange={updateForm} required/>
              </div>
            <div className='filter'>
              <label>Color</label>
              <select className='filter-input translucent pointer' name='color' value={onScreenFilters.color} onChange={updateForm}>
                <option value="">Any</option>
                {
                  colors.map(color => {
                    return <option key={color} value={color}>{(color.charAt(0).toUpperCase()).concat(color.slice(1))}</ option>
                  })
                }
              </select>
            </div>
            <div className='filter'>
              <label>Min Year</label>
              <input type='text' className='filter-input translucent' value={onScreenFilters.minYear} name='minYear' onChange={updateForm}/>
            </div>
            <div className='filter'>
              <label>Max Year</label>
              <input type='text' className='filter-input translucent' value={onScreenFilters.maxYear} name='maxYear' onChange={updateForm}/>
            </div>
            <div className='filter'>
              <label>Max # of Miles</label>
              <input type='text' className='filter-input translucent' value={onScreenFilters.maxMileage} name='maxMileage' onChange={updateForm}/>
            </div>
            <div className='filter'>
              <label>Min Price</label>
              <input type='text' className='filter-input translucent' value={onScreenFilters.minPrice} name='minPrice' onChange={updateForm}/>
            </div>
            <div className='filter'>
              <label>Max Price</label>
              <input type='text' className='filter-input translucent' value={onScreenFilters.maxPrice} name='maxPrice' onChange={updateForm}/>
            </div>
            {
              searchChange && (<button id='result-page-search-button' type='submit'>Search</button>)
            }
          </form>
          {
            savedPreferences.length > 0 && (
              <div id='saved-search-selection-box'>
                <label id='saved-search-label'>Load a Saved Search</label>
                <select name="" id="saved-search-select-elem" className='translucent' defaultValue="" onChange={handleSavedPrefLoad}>
                  <option value="" disabled selected></option>
                  {
                    savedPreferences.map(pref => (
                      <option key={pref.id} value={pref.id}>
                        {`${pref.make} ${pref.model}, ${pref.distance}mi from ${pref.zip}, Color: ${pref.color ? pref.color.charAt(0).toUpperCase() + pref.color.slice(1) : 'Any'}`}
                      </option>
                    ))
                  }
                </select>
              </div>
            )
          }
        </div>
        <div id='result-page-listings-content'>
          <SortMenu sortOption={sortOption} onChange={setSortOption} />
          <div id='car-listing-list'>
            {
              displayedListings.length > 0 && displayedListings.map(listing => {
                return <Listing key={listing.vin} listingData={listing} favoritedOnLoad={favoritedVins.includes(listing.vin)}/>
              })
            }
            {
              listingsInfo && (page * PAGE_SIZE < listingsInfo.totalListingsCount) && (<button id='load-more-button' className='translucent pointer' onClick={handlePageChange}>Load More</button>)
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResultsPage