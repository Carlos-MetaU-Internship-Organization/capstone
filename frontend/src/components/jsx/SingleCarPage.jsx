import './../css/SingleCarPage.css'
import car from './../../assets/car.jpg'
import arrow from './../../assets/arrow.png'
import heart from './../../assets/heart.png'
import pinkHeart from './../../assets/pinkHeart.png'
import Header from './Header'
import { baseURL } from '../../globals'
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { logInfo, logWarning, logError } from './../../utils/logging.service';
import axios from 'axios'

function SingleCarPage() {

  let { vin } = useParams();

  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);

  // ON BOOT
  useEffect(() => {
    const boot = async () => {
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
      await checkAuth();
  
      const fetchData = async () => {
        try {
          const response = await axios.get(`${baseURL}/api/listings/${vin}`, { withCredentials: true });
          const listing = response.data.listing;
          const userId = response.data.userId;
          if (!listing) {
            const listingData = await axios.get(`${baseURL}/api/listings/${vin}/data`);
            const listingInfo = listingData.data;
            const newListingInfo = {
              condition: listingInfo.condition,
              make: listingInfo.make,
              model: listingInfo.model,
              year: listingInfo.year.toString(),
              color: listingInfo.exteriorColor,
              mileage: listingInfo.mileage ? listingInfo.mileage.toString() : "0",
              vin: listingInfo.vin,
              description: listingInfo.description,
              images: listingInfo.photoUrls,
              price: listingInfo.price.toString(),
              zip: listingInfo.zip,
              owner_name: listingInfo.dealerName,
              owner_number: listingInfo.phoneTel,
              city: listingInfo.city,
              state: listingInfo.state,
              latitude: listingInfo.latitude,
              longitude: listingInfo.longitude,
              createdAt: listingInfo.createdAt,
              views: 1
            }
            const newListing = await axios.post(`${baseURL}/api/listings`, newListingInfo);
            setListing(newListing.data);
          } else {
            const favorited = listing.favoriters.some(favoriter => favoriter.id === userId);
            setListing(response.data.listing);
            setIsFavorited(favorited);
          }
        } catch (error) {
          logError(`Something went wrong when trying to fetch listing with VIN: ${vin}`, error)
        }
      }
      await fetchData();
    }
    boot();
  }, []);

  const redirectToResultsPage = () => {
    navigate('/results')
  }

  const handleFavoriteClick = async () => {
    try {
      const response = await axios.patch(`${baseURL}/api/listings/${vin}/favorite`, {}, { withCredentials: true });
      setIsFavorited(prev => !prev);
    } catch (error) {
      logError(`Something went wrong when trying to favorite listing with VIN: ${vin}`, error)
    }
  }

  
  if (!listing) {
    return <div>Loading...</div>
  }
  const formattedCondition = listing.condition.charAt(0).toUpperCase() + listing.condition.slice(1);
  const formattedMiles = parseInt(listing.mileage).toLocaleString('en-US');
  const formattedPrice = `$${parseInt(listing.price).toLocaleString('en-US')}`;
  const formattedColor = listing.color.charAt(0).toUpperCase() + listing.color.slice(1);
  const formattedDate = new Date(listing.createdAt).toLocaleDateString();
  const formattedPhoneNumber = `(${listing.owner_number.slice(0, 3)}) ${listing.owner_number.slice(3, 6)}-${listing.owner_number.slice(6, 10)}`;
  return (
    <div id='single-car-page'>
      <Header />
      <div id='single-car-page-content'>
        <div id='main-content'>
          <div id='listing-container'>
            <div id='listing-info'>
              <img src={listing.images[0]} id='single-car-image'/>
              <p id='single-car-title'><strong>{listing.year} {listing.make} {listing.model}</strong></p>
              <p className='single-car-info'><strong>Condition: </strong>{formattedCondition}</p>
              <p className='single-car-info'><strong>Miles: </strong>{formattedMiles}</p>
              <p className='single-car-info'><strong>Location: </strong>{listing.city}, {listing.state}</p>
              <p className='single-car-info'><strong>Price: </strong>{formattedPrice}</p>
              <p className='single-car-info'><strong>Description: </strong>{listing.description}</p>
              <p className='single-car-info'><strong>Color: </strong>{formattedColor}</p>
              <p className='single-car-info'><strong>VIN: </strong>{vin}</p>
              <p className='single-car-info'><strong>Date Listed: </strong>{formattedDate}</p>
              <p className='single-car-info'><strong>Owner Name: </strong>{listing.owner_name}</p>
              <p className='single-car-info'><strong>Owner Phone Number: </strong>{formattedPhoneNumber}</p>
            </div>
            <img src={isFavorited ? pinkHeart : heart} id='favorite-listing-img' onClick={handleFavoriteClick}/>
          </div>
          <div id='contact-seller-container'>
            <h3>Contact Seller</h3>
            <div id='messages'>
              {/* Messages between Seller/Buyer here*/}
            </div>
            <div id='reply-box'>
              <textarea placeholder='Reply:' rows={3}></textarea>
              <button>Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SingleCarPage