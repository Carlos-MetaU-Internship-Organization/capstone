import './../css/BuyPage.css'
import car from './../../assets/car.jpg'
import arrow from './../../assets/arrow.png'
import Header from './Header'
import { baseURL } from '../../globals'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { logInfo, logWarning, logError } from './../../utils/logging.service';
import axios from 'axios'

function BuyPage() {

  // TODO: display error/warning messages to users

  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [form, setForm] = useState({
    condition: 'new',
    make: '',
    model: '',
    distance: '50',
    zip: '94025'
  })
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
  }, [navigate]);
  
  const handleLogout = () => {
    // call axios backend logout endpoint
  }
  
  const updateForm = async (event) => {
    const elem = event.target.name;
    const value = event.target.value;
    setForm(prev => ({...prev, [elem]: value}));
    
    if (elem === 'make') {
      updateModels(value);
    }
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
  
  const handleSearch = async (event) => {
    event.preventDefault();

    const { make, model, condition, zip, distance } = form;
    if (!make || !model || !condition || !zip || !distance) {
      logWarning('Search failed: Missing fields.');
      return
    }

    try {
      const response = await axios.get(`${baseURL}/api/search/${form.make}/${form.model}/${form.condition}/${form.zip}/${form.distance}/1`, { withCredentials: true });
      const listings = response.data.records;
      // navigate to results page here, passing in listings as a state
    } catch (error) {
      logError('Listings HTTP request failed', error);
    }
  }

  return (
    <div id='buy-page'>
      <Header />
      <div id='buy-content'>
        <div id='buy-search'>
          <form className='translucent' id='filter-search' onSubmit={handleSearch}>
            <div id='filters'>
              <label>New/Used</label>
              <select className='translucent buy-page-user-selection pointer' id="condition-selector" name="condition" onChange={updateForm} required>
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