import './../css/Listing.css'
import heart from './../../assets/heart.png'
import pinkHeart from './../../assets/pinkHeart.png'
import { useState } from 'react'

function Listing({ listingData }) {

  // TODO: check if listing is already favorited from backend and set this to intial val
  const [isListingFavorited, setIsListingFavorited] = useState(false);

  const carTitle = `${listingData.year} ${listingData.make} ${listingData.model}`
  const carLocation = `${listingData.city}, ${listingData.state}`
  
  return (
    <div className='car-listing translucent'>
      <img className='car-listing-image pointer' src={listingData.primaryPhotoUrl}/>
      <div className='car-listing-info'>
        <span>
          <img id='favorite-listing-button' height={25}src={isListingFavorited ? pinkHeart : heart} />
          <h3 className='car-listing-title'>{carTitle}</h3>
        </span>
        <p className='car-listing-miles'>{listingData.mileage}</p>
        <p className='car-listing-location'>{carLocation}</p>
        <p className='car-listing-price'>{listingData.price}</p>
      </div>
    </div>
  )
}

export default Listing