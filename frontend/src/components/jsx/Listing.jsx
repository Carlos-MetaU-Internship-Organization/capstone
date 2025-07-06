import './../css/Listing.css'
import heart from './../../assets/heart.png'
import pinkHeart from './../../assets/pinkHeart.png'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { baseURL } from '../../globals'
import { logError } from '../../utils/logging.service'
import axios from 'axios'

function Listing({ listingData, favoritedOnLoad }) {

  const navigate = useNavigate();
  // TODO: check if listing is already favorited from backend and set this to intial val
  const [isFavorited, setIsFavorited] = useState(favoritedOnLoad);

  const carTitle = `${listingData.year} ${listingData.make} ${listingData.model}`
  const carLocation = `${listingData.city}, ${listingData.state}`

  const handleListingClick = async () => {
    navigate(`/listing/${listingData.vin}`)
  }

  const handleListingFavorite = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/listings/${listingData.vin}`, { withCredentials: true });
      const listing = response.data.listing;
      const userId = response.data.userId;
      if (!listing) {
        const listingResponse = await axios.get(`${baseURL}/api/listings/${listingData.vin}/data`);
        const listingInfo = listingResponse.data;
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
          createdAt: listingInfo.createdAt
        }
        const newListing = await axios.post(`${baseURL}/api/listings`, newListingInfo);
        await axios.patch(`${baseURL}/api/listings/${listingData.vin}/favorite`, {}, { withCredentials: true })
        setIsFavorited(true);
      } else {
        const favorited = listing.favoriters.some(favoriter => favoriter.id === userId);
        await axios.patch(`${baseURL}/api/listings/${listingData.vin}/favorite`, {}, { withCredentials: true })
        setIsFavorited(!favorited);
      }
    } catch (error) {
      logError(`Something went wrong when trying to favorite listing with VIN: ${listingData.vin}`, error)
    }
  }
  
  return (
    <div className='car-listing translucent'>
      <img className='car-listing-image pointer' src={listingData.primaryPhotoUrl} onClick={handleListingClick}/>
      <div className='car-listing-info'>
          <img id='favorite-listing-button' className='pointer' height={25}src={isFavorited ? pinkHeart : heart} onClick={handleListingFavorite}/>
          <h3 className='car-listing-title'>{carTitle}</h3>
        <p className='car-listing-miles'>{listingData.mileage}</p>
        <p className='car-listing-location'>{carLocation}</p>
        <p className='car-listing-price'>{listingData.price}</p>
      </div>
    </div>
  )
}

export default Listing