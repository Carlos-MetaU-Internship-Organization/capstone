import './../css/BuyPage.css'
import tire from './../../assets/tire.png'
import menu from './../../assets/menu.png'
import car from './../../assets/car.jpg'
import arrow from './../../assets/arrow.png'
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
    <div className='buy-page'>
      {/* TODO: make header a component*/}
      <header>
        <img src={tire}/>
        <h2 id='title'>CarPortal</h2>
        <div className='redirect-links'>
          <h3 className='header-buttons pointer' id='buy-redirect' style={{textDecoration: 'underline'}} onClick={handleRedirectClick}>Buy</h3>
          <h3 className='header-buttons pointer' id='sell-redirect' onClick={handleRedirectClick}>Sell</h3>
        </div>
        <h3 className='header-buttons pointer' id='logout' onClick={handleLogout}>Logout</h3>
        <img className='header-buttons pointer' id='sidebar-opener' src={menu}/>
      </header>
      <div className='buy-content'>
        <div className='buy-search'>
          <form className='filter-search' onSubmit={handleSearch}>
            <div className='filters'>
              <label>New/Used</label>
              <select id="new-used-selector" name="new-used-selector" required>
                <option value="New">New</option>
                <option value="Used">Used</option>
              </select>
              <label>Make</label>
              <select id="make-selector" name="make-selector" required>
                <option value="BMW">BMW</option>
                <option value="Porsche">Porsche</option>
                <option value="Toyota">Toyota</option>
              </select>
              <label>Model</label>
              <select id="model-selector" name="model-selector" required>
                {/* TODO: change model based on make selected*/}
                <option value="M3">M3</option>
                <option value="911">911</option>
                <option value="4Runner">4Runner</option>
              </select>
              <div className='location-details'>
                <label>Distance</label>
                <select id="model-selector" name="model-selector" required>
                  <option value="50mi">50 miles</option>
                  <option value="250mi">250 miles</option>
                  <option value="500mi">500 miles</option>
                  <option value="Nationwide">Nationwide</option>
                </select>
                <label>ZIP</label>
                {/* TODO: grab zip code based on location maybe? stretch, 
                default is fine, but when user supplies one, save it somewhere*/}
                <input type="text" defaultValue={94025}required/>
              </div>
            </div>
            <button type='submit'>Search</button>
          </form>
          <div className='most-viewed pointer'>
            <img src={car} height='400px' className='car-image'/>
            <div className='most-viewed-car-info'>
              <p>Make: Porsche</p>
              <p>Model: 911</p>
              <p>Year: 2022</p>
              <p>Location: San Francisco, CA</p>
              <p>Price: $214,999</p>
            </div>
          </div>
        </div>
      </div>
      <div className='favorites'>
        {/* TODO: THESE SHOULD ALL BE CLICKABLE 
        AND BE ABLE TO REDIRECT TO THEIR 
        APPROPRIATE LISTINGS ON A CLICK */}
        <label id='favorites-label'>Your Favorites</label>
        <div className='favorite-cars'>
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