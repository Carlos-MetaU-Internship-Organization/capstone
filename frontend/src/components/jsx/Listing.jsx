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
      const response = await axios.get(`${baseURL}/api/listings/vin/${listingData.vin}`, { withCredentials: true });
      if (response.data.status === 200) {
        const listing = response.data.listing;
        const userId = response.data.userId;
        const favorited = listing.favoriters.some(favoriter => favoriter.id === userId);
        await axios.patch(`${baseURL}/api/listings/${listingData.vin}/favorite`, {}, { withCredentials: true })
        setIsFavorited(!favorited);
      } else if (response.data.status === 404) {
        const listingResponse = await axios.get(`${baseURL}/api/listings/${listingData.vin}/data`);
        const listingInfo = listingResponse.data;
        const newListingInfo = {
          condition: listingInfo.condition || 'N/A',
          make: listingInfo.make || 'N/A',
          model: listingInfo.model || 'N/A',
          year: listingInfo.year.toString() || 'N/A',
          color: listingInfo.exteriorColor || 'N/A',
          mileage: listingInfo.mileage.toString() || 'N/A',
          vin: listingInfo.vin,
          description: listingInfo.description || 'N/A',
          images: listingInfo.photoUrls,
          price: listingInfo.price.toString() || 'N/A',
          zip: listingInfo.zip || 'N/A',
          owner_name: listingInfo.dealerName || 'N/A',
          owner_number: listingInfo.phoneTel || 'N/A',
          city: listingInfo.city || 'N/A',
          state: listingInfo.state || 'N/A',
          latitude: listingInfo.latitude || 0,
          longitude: listingInfo.longitude || 0,
          createdAt: listingInfo.createdAt,
          views: 0
        }
        const newListing = await axios.post(`${baseURL}/api/listings`, newListingInfo);
        await axios.patch(`${baseURL}/api/listings/${listingData.vin}/favorite`, {}, { withCredentials: true })
        setIsFavorited(true);
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