import './../css/Listing.css'
import heart from './../../assets/heart.png'
import pinkHeart from './../../assets/pinkHeart.png'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { logError } from '../../services/loggingService'
import { favoriteListing } from '../../utils/api'

function Listing({ listingData, favoritedOnLoad }) {

  const navigate = useNavigate();
  // TODO: check if listing is already favorited from backend and set this to intial val
  const [isFavorited, setIsFavorited] = useState(favoritedOnLoad);

  useEffect(() => {
    setIsFavorited(favoritedOnLoad)
  }, [favoritedOnLoad])

  const carTitle = `${listingData.year} ${listingData.make} ${listingData.model}`
  const carLocation = `${listingData.city}, ${listingData.state}`

  const handleListingClick = async () => {
    navigate(`/listing/${listingData.vin}`)
  }

  const handleListingFavorite = async () => {
    try {
      const { favoritedStatus } = await favoriteListing(listingData.vin, !isFavorited)
      if (favoritedStatus === isFavorited) {
        // FavoriteStatus did not update... Something went wrong
        // TODO: display error message component
      } else {
        setIsFavorited(favoritedStatus);
      }
    } catch (error) {
      logError(`Something went wrong when trying to favorite listing with VIN: ${listingData.vin}`, error)
    }
  }
  
  return (
    <div className='car-listing translucent grow'>
      <img className='car-listing-image pointer' src={listingData.images[0]} onClick={handleListingClick}/>
      <div className='car-listing-info'>
          <img id='favorite-listing-button' className='pointer' height={25}src={isFavorited ? pinkHeart : heart} onClick={handleListingFavorite}/>
          <h3 className='car-listing-title'>{carTitle}</h3>
        <p className='car-listing-miles'>{`${listingData.mileage.toLocaleString('en-US')} miles`}</p>
        <p className='car-listing-location'>{carLocation}</p>
        <p className='car-listing-price'>{`$${listingData.price.toLocaleString('en-US')}`}</p>
      </div>
    </div>
  )
}

export default Listing