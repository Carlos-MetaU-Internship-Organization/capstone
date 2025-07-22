import './../css/SellPage.css'
import axios from 'axios'
import arrow from './../../assets/arrow.png'
import soldOverlay from './../../assets/soldOverlay.png'
import Header from './Header'
import { baseURL } from '../../globals'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { logInfo, logWarning, logError } from '../../services/loggingService';
import { ELASTICITY_KEYS, CAPITALIZE, LISTINGS_PER_CYCLE } from './../../utils/constants'
import { getOwnedListings, getMakes, getModels, createListing, estimatePrice } from '../../utils/api'

function SellPage() {

  let initialListingInfo = {
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

  const info = useLocation();

  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [listingInfo, setListingInfo] = useState(initialListingInfo);
  const [ownedListings, setOwnedListings] = useState([]);
  const [page, setPage] = useState(1);
  const [priceEstimation, setPriceEstimation] = useState();
  const [showPriceEstimation, setShowPriceEstimation] = useState(false);
  const [sliderIndex, setSliderIndex] = useState(Math.floor(ELASTICITY_KEYS.length / 2));

  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          makesResponse,
          ownedListingsResponse
        ] = await Promise.all([
          getMakes(),
          getOwnedListings()
        ])

        setMakes(makesResponse.makes)
        setOwnedListings(ownedListingsResponse.ownedListings)

      } catch (error) {
        logError('One or more parallel requests went wrong', error);
      }
    }

    fetchData();

    if (info.state) {
      initialListingInfo = info.state.data;
      updateModels(initialListingInfo.make);
      setListingInfo(initialListingInfo)
    }
  }, [])

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
    const elem = event.target.name;

    const value = event.target.value;
    setListingInfo(prev => ({...prev, [elem]: value}));
    
    if (elem === 'make') {
      updateModels(value);
    }
  }
  
  const handleListingCreation = async (event) => {
    event.preventDefault();

    try {
      const { listing } = await createListing(listingInfo)
      logInfo('New listing created successfully');
      setListingInfo(initialListingInfo);
      setOwnedListings(prev => [listing, ...prev]);
    } catch (error) {
      logError('Something went wrong when trying to create a new listing', error);
    }
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
    setListingInfo(prev => ({...prev, images}))
  }

  const handlePageChange = (event) => {
    if (event.target.id === 'flipped-arrow') {
      setPage(prev => prev - 1);
    } else {
      setPage(prev => prev + 1);
    }
  }

  const redirectToListingsPage = () => {
    navigate('/my-listings')
  }

  const handlePriceEstimation = async () => {
    try {
      const { priceEstimationInfo } = await estimatePrice(listingInfo);
      if (!priceEstimationInfo) {
        // TODO: display error message component
      } else {
        setPriceEstimation(priceEstimationInfo);
        setShowPriceEstimation(true);
      }
    } catch (error) {
      logError('Something went wrong when trying to generate a price for your listing', error);
    }
  }

  const handleSliderInput = async (event) => {
    setSliderIndex(Number(event.target.value));
  }

  const colors = ['beige', 'black', 'blue', 'brown', 'gold', 'gray', 'green', 'orange', 'purple', 'red', 'silver', 'white', 'yellow'];
  const currentSliderKey = ELASTICITY_KEYS[sliderIndex];

  return (
    <div id='sell-page'>
      <Header />
      <div id='sell-page-container'>
        <div id='sell-content'>
          <div id='sell-search'>
            <form className='translucent' id='new-listing-form' onSubmit={handleListingCreation} autoComplete='off'>
              <div id='listing-options'>
                  <div id='listing-option'>
                    <label>Condition</label>
                    <select className='translucent new-listing-input pointer' id="condition-selector" value={listingInfo.condition} name="condition" onChange={updateForm} required>
                      <option value="" disabled selected></option>
                      <option value="new">New</option>
                      <option value="used">Used</option>
                    </select>
                  </div>
                  <div id='listing-option'>
                    <label>Make</label>
                    <select className='translucent new-listing-input pointer' id="make-selector" value={listingInfo.make} name="make" onChange={updateForm} required>
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
                    <select className='translucent new-listing-input pointer' id="model-selector" value={listingInfo.model} name="model" onChange={updateForm} required>
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
                    <input type='number' className='new-listing-input translucent' value={listingInfo.year} name='year' onChange={updateForm} required/>
                  </div>
                  <div id='listing-option'>
                    <label>Color</label>
                    <select className='new-listing-input translucent pointer' value={listingInfo.color} name='color' onChange={updateForm} required>
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
                    <input type='number' inputmode='numeric' className='new-listing-input translucent' value={listingInfo.mileage} name='mileage' onChange={updateForm} required/>
                  </div>
                  <div id='listing-option'>
                    <label>VIN</label>
                    <input type='text' className='new-listing-input translucent' value={listingInfo.vin} name='vin' onChange={updateForm} required/>
                  </div>
                </div>
              <div id='finalize-listing'>
                <div id='listing-option'>
                  <label>Description</label>
                  <textarea id="description-input" className='new-listing-input translucent' value={listingInfo.description} name='description' onChange={updateForm} required />
                </div>
                <div id='listing-option'>
                  <label>Upload Images</label>
                  <input type="file" id='image-upload-input' className='new-listing-input translucent pointer' onChange={handleFileUpload} multiple required />
                </div>
                <div id='listing-option'>
                  {/* TODO: after submission, reset images */}
                  <label>Asking Price</label>
                  <input type="number" id='asking-price-input' className='new-listing-input translucent' value={listingInfo.price} name='price' onChange={updateForm} required/>
                </div>
                <button className='translucent' id='create-listing-button' type='submit'>Create Listing</button>
              </div>
            </form>
            <div id='price-helper-container' className='translucent'>
              <p>Don't know what to price your car?</p>
              <button id='price-helper-button' className='translucent' onClick={handlePriceEstimation}>Click Me</button>
              {
                showPriceEstimation && (
                  <div id='price-estimation'>
                    <p>Recommended Price: <strong>{priceEstimation.recommendedPrice}</strong></p>
                    <p>Confidence Level: <strong>{CAPITALIZE(priceEstimation.confidenceLevel)}</strong></p>
                    {
                      priceEstimation.recommendedPrice !== priceEstimation.marketPrice && <p>Market Price: <strong>{priceEstimation.marketPrice}</strong></p>
                    }
                    {
                      Object.keys(priceEstimation.elasticity).length !== 0 && (
                        <>
                          <p>Expected Time to Sell: <strong>{priceEstimation.elasticity[currentSliderKey]} days {currentSliderKey != '0' ? `at ${currentSliderKey}% price change` : ''}</strong></p>
                          <input type="range" min="0" max={ELASTICITY_KEYS.length - 1} value={sliderIndex} id='slider' onInput={handleSliderInput}/>
                        </>
                      )
                    }
                  </div>
                )
              }
            </div>
          </div>
        </div>
        {
          ownedListings?.length > 0 &&
          (
            <div id='listings-container'>
              <label id='listings-label' className='pointer' onClick={redirectToListingsPage}>Your Listings</label>
              <div id='listings-cars'>
                {
                  page > 1 && (<img src={arrow} height='50px' id='flipped-arrow' className='pointer' onClick={handlePageChange}/>) 
                }
                {
                  ownedListings.slice((LISTINGS_PER_CYCLE * (page - 1)), (LISTINGS_PER_CYCLE * page)).map(listing => (
                    <div key={listing.id} className='listing-wrapper' onClick={() => navigate(`/listing/${listing.vin}`)}>
                      <img src={listing.images[0]} className='listing-image pointer'/>
                      {
                        listing.sold && <img src={soldOverlay} className='sold-overlay-img' />
                      }
                    </div>
                  ))
                }
                {
                  ownedListings.length > page * LISTINGS_PER_CYCLE && (<img src={arrow} height='50px' className='pointer' onClick={handlePageChange}/>)
                }
              </div>
            </div>
          )
        }
      </div>
    </div>
  )
}

export default SellPage