import './../css/BuyPage.css'
import car from './../../assets/car.jpg'
import arrow from './../../assets/arrow.png'
import Header from './Header'
import { baseURL } from '../../globals'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function BuyPage() {

  const navigate = useNavigate();

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

  const handleRedirectClick = (event) => {
    navigate(`/${event.target.textContent}`)
  }

  const handleSearch = (event) => {
    event.preventDefault();
  }

  const handleLogout = () => {
    // call axios backend logout endpoint
  }

  return (
    <div id='buy-page'>
      <Header />
      <div id='buy-content'>
        <div id='buy-search'>
          <form className='translucent' id='filter-search' onSubmit={handleSearch}>
            <div id='filters'>
              <label>New/Used</label>
              <select className='translucent buy-page-user-selection' id="new-used-selector" name="new-used-selector" required>
                <option value="New">New</option>
                <option value="Used">Used</option>
              </select>
              <label>Make</label>
              <select className='translucent buy-page-user-selection' id="make-selector" name="make-selector" required>
                <option value="BMW">BMW</option>
                <option value="Porsche">Porsche</option>
                <option value="Toyota">Toyota</option>
              </select>
              <label>Model</label>
              <select className='translucent buy-page-user-selection' id="model-selector" name="model-selector" required>
                {/* TODO: change model based on make selected*/}
                <option value="M3">M3</option>
                <option value="911">911</option>
                <option value="4Runner">4Runner</option>
              </select>
              <div id='location-details'>
                <label>Distance</label>
                <select className='translucent buy-page-user-selection' name="model-selector" required>
                  <option value="50mi">50 miles</option>
                  <option value="250mi">250 miles</option>
                  <option value="500mi">500 miles</option>
                  <option value="Nationwide">Nationwide</option>
                </select>
                <label>ZIP</label>
                <input className='translucent buy-page-user-selection' type="text" defaultValue={94025}required/>
              </div>
            </div>
            <button className='translucent' id='search-button' type='submit'>Search</button>
          </form>
          <div id='most-viewed-container'>
            <p>Still Interested?</p>
            <div className='translucent most-viewed-listing pointer'>
              <img src={car} id='most-viewed-car-img' className='car-image'/>
              <div id='most-viewed-car-info'>
                <p>Make: Porsche</p>
                <p>Model: 911</p>
                <p>Year: 2022</p>
                <p>Location: San Francisco, CA</p>
                <p>Price: $214,999</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id='favorites-container'>
        {/* TODO: THESE SHOULD ALL BE CLICKABLE 
        AND BE ABLE TO REDIRECT TO THEIR 
        APPROPRIATE LISTINGS ON A CLICK */}
        <label id='favorites-label'>Your Favorites</label>
        <div id='favorite-cars'>
          <img src={car} height='150px' className='car-image pointer'/>
          <img src={car} height='150px' className='car-image pointer'/>
          <img src={car} height='150px' className='car-image pointer'/>
          <img src={car} height='150px' className='car-image pointer'/>
          <img src={car} height='150px' className='car-image pointer'/>
          <img src={arrow} height='50px' className='pointer'/>
        </div>
        {/* Button that fetches the next 4 Favorited cars */}
      </div>
    </div>
  )
}

export default BuyPage