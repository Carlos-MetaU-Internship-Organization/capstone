import './../css/ResultsPage.css'
import heart from './../../assets/heart.png'
import pinkHeart from './../../assets/pinkHeart.png'
import Header from './Header'
import Listing from './Listing'
import { baseURL } from '../../globals'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'

function ResultsPage() {
  const listingData = useLocation();
  const listings = listingData.state.listings;
  const makes = listingData.state.makes;
  const models = listingData.state.models;
  const filters = listingData.state.filters;

  const navigate = useNavigate();

  const [isSearchFavorited, setIsSearchFavorited] = useState(false);
  const [form, setForm] = useState({
    ...filters,
    minYear: '',
    maxYear: '',
    max_mileage: '',
    minPrice: '',
    maxPrice: ''
  })

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

  const handleSearchFavoriteClick = (event) => {
    setIsSearchFavorited(prev => !prev);
  }

  const colors = ['beige', 'black', 'blue', 'brown', 'gold', 'gray', 'green', 'orange', 'purple', 'red', 'silver', 'white', 'yellow'];

  return (
    <div id='results-page'>
      <Header />
      <div id='result-page-content'>
        <div id='result-page-form-content' className='translucent'>
          <img id='favorite-search-button' className='pointer' height={25} src={isSearchFavorited ? pinkHeart : heart} onClick={handleSearchFavoriteClick}/>
          <form id='advanced-filters'>
            {/* <div className='filter'>
              <label>New/Used</label>
              <select className='result-page-filter translucent pointer'>
                <option value="new&used">New & Used</option>
                <option value="new">New</option>
                <option value="used">Used</option>
              </select>
            </div> */}
            <div className='filter'>
              <label>Make</label>
              <select className='result-page-filter translucent pointer' value={form.make}>
                {
                  makes.map(make => {
                    return <option value={make.name}>{make.name}</option>
                  })
                }
              </select>
            </div>
            <div className='filter'>
              <label>Model</label>
              <select className='result-page-filter translucent pointer' value={form.model}>
                {
                  models.map(model => {
                    return <option value={model.name}>{model.name}</option>
                  })
                }
              </select>
            </div>
            <div className='filter'>
              <label>Color</label>
              <select className='result-page-filter translucent pointer'>
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
              <select className='result-page-filter translucent pointer'>
                <option disabled selected></option>
              </select>
            </div>
            <div className='filter'>
              <label>Max Year</label>
              <select className='result-page-filter translucent pointer'>
                <option disabled selected></option>
              </select>
            </div>
            <div className='filter'>
              <label>Mileage</label>
              <select className='result-page-filter translucent pointer'>
                <option disabled selected></option>
              </select>
            </div>
            <div className='filter'>
              <label>Min Price</label>
              <select className='result-page-filter translucent pointer'>
                <option disabled selected></option>
              </select>
            </div>
            <div className='filter'>
              <label>Max Price</label>
              <select className='result-page-filter translucent pointer'>
                <option disabled selected></option>
              </select>
            </div>
          </form>
        </div>
        <div id='result-page-listings-content'>
          <select className='translucent pointer' id='sort-menu'>
            <option value="Sort By:" disabled selected>Sort By: </option>
            <option value="Lowest Price">Lowest Price</option>
            <option value="Highest Price">Highest Price</option>
            <option value="Nearest Location">Nearest Location</option>
            <option value="Newest Year">Newest Year</option>
            <option value="Oldest Year">Oldest Year</option>
            <option value="Newest Listed">Newest Listed</option>
            <option value="Oldest Listed">Oldest Listed</option>
          </select>
          <div id='car-listing-list'>
            {
              listings && listings.map(listing => {
                console.log(listing);
                return <Listing listingData={listing} />
              })
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResultsPage