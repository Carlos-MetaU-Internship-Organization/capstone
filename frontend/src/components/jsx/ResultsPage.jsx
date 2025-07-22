import './../css/ResultsPage.css'
import heart from './../../assets/heart.png'
import pinkHeart from './../../assets/pinkHeart.png'
import Header from './Header'
import Listing from './Listing'
import SortMenu from './SortMenu'
import { useState, useEffect } from 'react'
import { logInfo, logWarning, logError } from '../../services/loggingService';
import { getFavoritedListings, getModels, getSavedSearchFilters, saveSearchFilter, viewSearchFilter, getListings } from '../../utils/api'
import { sortListings } from './../../utils/listings'
import { PAGE_SIZE } from '../../utils/constants'

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
  
  const [savedSearchFilters, setSavedSearchFilters] = useState([]);
  const [isSearchFavorited, setIsSearchFavorited] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          favoritedListingsResponse,
          savedSearchFiltersResponse
        ] = await Promise.all([
          getFavoritedListings(),
          getSavedSearchFilters()
        ])

        const vins = favoritedListingsResponse.favoritedListings.map(listing => listing.vin);
        setFavoritedVins(vins);

        setSavedSearchFilters(savedSearchFiltersResponse.savedSearchFilters);

      } catch (error) {
        logError('One or more parallel requests went wrong', error);
      }
    }
    fetchData();
  }, [])

  useEffect(() => {
    const equivalent = (a, b) => (a ?? '') == (b ?? '')
    if (savedSearchFilters.length > 0) {
      const isSaved = savedSearchFilters.some(savedFilter => {
        return (
          equivalent(savedFilter.condition, onScreenFilters.condition) &&
          equivalent(savedFilter.make, onScreenFilters.make) &&
          equivalent(savedFilter.model, onScreenFilters.model) &&
          equivalent(savedFilter.distance, onScreenFilters.distance) &&
          equivalent(savedFilter.zip, onScreenFilters.zip) &&
          equivalent(savedFilter.color, onScreenFilters.color) &&
          equivalent(savedFilter.minYear, onScreenFilters.minYear) &&
          equivalent(savedFilter.maxYear, onScreenFilters.maxYear) &&
          equivalent(savedFilter.maxMileage, onScreenFilters.maxMileage) &&
          equivalent(savedFilter.minPrice, onScreenFilters.minPrice) &&
          equivalent(savedFilter.maxPrice, onScreenFilters.maxPrice)
        )
      })
      setIsSearchFavorited(isSaved);
    }
  }, [onScreenFilters, savedSearchFilters])

  const handleSearchFavoriteClick = async () => {
    const searchFilterResponse = await saveSearchFilter(onScreenFilters);
    const { inDB, searchFilter } = searchFilterResponse;
    if (inDB) {
      setSavedSearchFilters(prev => [...prev, searchFilter])
    } else {
      setSavedSearchFilters(prev => prev.filter(filter => filter.id !== searchFilter.id));
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
    try {
      const { models, success } = await getModels(make)
      if (success) {
        setModels(models);
        setFilters(prev => ({...prev, model: models[0].name}))
      } else {
        // TODO: error message component
      }
    } catch (error) {
      logError('Something went wrong', error);
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

    try {
      const [{ listings }, _] = await Promise.all([
        getListings(activeFilters),
        viewSearchFilter(onScreenFilters)
      ])
    
      if (listings) {
        localStorage.setItem('recentSearch', JSON.stringify( { filters: activeFilters, sortOption, listings, makes, models }))
        const listingCount = listings.length;
    
        setListingsInfo({ listings, totalListingsCount: listingCount });
        setListingsUpdated(true);
        if (!sortOption) {
          setDisplayedListings(listings.slice(0, PAGE_SIZE))
        }
        setSearchChange(false);
      } else {
        setListingsInfo({ listings: [], totalListingsCount: 0 })
      }
    } catch (error) {
      // TODO: message component error
    }
  }

  const handleSavedSearchFilterLoad = async (event) => {
    const savedSearchFilterId = event.target.value;
    const savedSearchFilter = savedSearchFilters.find(searchFilter => searchFilter.id == savedSearchFilterId)
    
    const updatedFilters = {
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

    const { models } = await getModels(updatedFilters.make);
    
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
            savedSearchFilters.length > 0 && (
              <div id='saved-search-selection-box'>
                <label id='saved-search-label'>Load a Saved Search</label>
                <select name="" id="saved-search-select-elem" className='translucent' defaultValue="" onChange={handleSavedSearchFilterLoad}>
                  <option value="" disabled selected></option>
                  {
                    savedSearchFilters.map(searchFilter => (
                      <option key={searchFilter.id} value={searchFilter.id}>
                        {`${searchFilter.make} ${searchFilter.model}, ${searchFilter.distance}mi from ${searchFilter.zip}, Color: ${searchFilter.color ? searchFilter.color.charAt(0).toUpperCase() + searchFilter.color.slice(1) : 'Any'}`}
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