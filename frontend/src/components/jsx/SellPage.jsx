import './../css/SellPage.css'
import car from './../../assets/car.jpg'
import arrow from './../../assets/arrow.png'
import Header from './Header'
import { baseURL } from '../../globals'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { logInfo, logWarning, logError } from './../../utils/logging.service';
import axios from 'axios'

function SellPage() {

  const initialFormState = {
    condition: '',
    make: '',
    model: '',
    year: '',
    color: '',
    mileage: '',
    vin: '',
    description: '',
    images: [],
    price: ''
  }

  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [form, setForm] = useState(initialFormState);
  const [listings, setListings] = useState()

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
  }, []);
  
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
    } catch (error) {
      logError('HTTP request failed when trying to fetch models', error);
    }
  }
  
  const handleListingCreation = async (event) => {
    event.preventDefault();

    const { condition, make, model, year, color, mileage, vin, description, images, price } = form;
    if (!condition || !make || !model || !year || !color || !mileage || !vin || !description || !images || !price) {
      logWarning('Search failed: Missing fields.');
      return
    }

    const listingInfo = {
      condition,
      make,
      model,
      year,
      color,
      mileage,
      vin,
      description,
      images,
      price
    }

    const response = await axios.post(`${baseURL}/api/listings/user/`, listingInfo, { withCredentials: true });
    const data = response.data;
    setForm(initialFormState);
  }

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    let images = [];
    for (const file of files) {
      const reader = new FileReader();
      const result = await new Promise((resolve) => {
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      })
      images.push(result);
    }
    setForm(prev => ({...prev, images}))
  }

  const fetchUserListings = async () => {

  }

  const colors = ['beige', 'black', 'blue', 'brown', 'gold', 'gray', 'green', 'orange', 'purple', 'red', 'silver', 'white', 'yellow'];

  return (
    <div id='sell-page'>
      <Header />
      <div id='sell-content'>
        <div id='sell-search'>
          <form className='translucent' id='new-listing-form' onSubmit={handleListingCreation}>
            <div id='listing-options'>
                <div id='listing-option'>
                  <label>Condition</label>
                  <select className='translucent new-listing-input pointer' id="condition-selector" value={form.condition} name="condition" onChange={updateForm} required>
                    <option value="" disabled selected></option>
                    <option value="new">New</option>
                    <option value="used">Used</option>
                  </select>
                </div>
                <div id='listing-option'>
                  <label>Make</label>
                  <select className='translucent new-listing-input pointer' id="make-selector" value={form.make} name="make" onChange={updateForm} required>
                    <option value="" disabled selected></option>
                    {
                      makes.map(make => {
                        return <option value={make.name}>{make.name}</option>
                      })
                    }
                  </select>
                </div>
                <div id='listing-option'>
                  <label>Model</label>
                  <select className='translucent new-listing-input pointer' id="model-selector" value={form.model} name="model" onChange={updateForm} required>
                    <option value="" disabled selected></option>
                    {
                      models.length > 0 && models.map(model => {
                        return <option value={model.name}>{model.name}</option>
                      })
                    }
                  </select>
                </div>
                <div id='listing-option'>
                  <label>Year</label>
                  <input type='number' className='new-listing-input translucent' value={form.year} name='year' onChange={updateForm} required/>
                </div>
                <div id='listing-option'>
                  <label>Color</label>
                  <select className='new-listing-input translucent pointer' value={form.color} name='color' onChange={updateForm} required>
                    <option disabled selected></option>
                    {
                      colors.map(color => {
                        return <option value={color}>{(color.charAt(0).toUpperCase()).concat(color.slice(1))}</ option>
                      })
                    }
                  </select>
                </div>
                <div id='listing-option'>
                  <label>Mileage</label>
                  <input type='number' inputmode='numeric' className='new-listing-input translucent' value={form.mileage} name='mileage' onChange={updateForm} required/>
                </div>
                <div id='listing-option'>
                  <label>VIN</label>
                  <input type='text' className='new-listing-input translucent' value={form.vin} name='vin' onChange={updateForm} required/>
                </div>
              </div>
            <div id='finalize-listing'>
              <div id='listing-option'>
                <label>Description</label>
                <textarea id="description-input" className='new-listing-input translucent' value={form.description} name='description' onChange={updateForm} required />
              </div>
              <div id='listing-option'>
                <label>Upload Images</label>
                <input type="file" id='image-upload-input' className='new-listing-input translucent' value={form.images} onChange={handleFileUpload} multiple required />
              </div>
              <div id='listing-option'>
                {/* TODO: after submission, reset images */}
                <label>Asking Price</label>
                <input type="number" id='asking-price-input' className='new-listing-input translucent' name='price' onChange={updateForm} required/>
              </div>
              <button className='translucent' id='create-listing-button' type='submit'>Create Listing</button>
            </div>
          </form>
          <div id='price-helper-container' className='translucent'>
            <p>Don't know what to price your car?</p>
            <button id='price-helper-button' className='translucent'>Click Me</button>
          </div>
        </div>
      </div>
      <div id='listings-container'>
        <label id='listings-label'>Your Listings</label>
        <div id='listings-cars'>
          <img src={car} height='150px' className='listings-car-image pointer'/>
          <img src={car} height='150px' className='listings-car-image pointer'/>
          <img src={car} height='150px' className='listings-car-image pointer'/>
          <img src={car} height='150px' className='listings-car-image pointer'/>
          <img src={car} height='150px' className='listings-car-image pointer'/>
          {/* Button that fetches the next 4 Favorited cars */}
          <img src={arrow} height='50px' className='pointer'/>
        </div>
      </div>
    </div>
  )
}

export default SellPage