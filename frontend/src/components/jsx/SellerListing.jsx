import './../css/SellerListing.css'
import eye from './../../assets/eye.png'
import blackHeart from './../../assets/blackHeart.png'
import edit from './../../assets/edit.png'
import money from './../../assets/money.png'
import trash from './../../assets/trash.png'
import { baseURL } from '../../globals'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { logError, logInfo } from '../../utils/logging.service'
import axios from 'axios'

function SellerListing({ listingData, onDelete }) {

  const navigate = useNavigate();
  const [sold, setSold] = useState(listingData.sold);

  logInfo(`ListingData for Listing with id: ${listingData.id}`, listingData);

  const handleListingEdit = () => {
    navigate('/sell', { state: {
      data: listingData
    }})
  }

  const handleListingDeletion = async () => {
    if (confirm("Are you sure you want to delete this listing?")) {
      try {
        const response = await axios.delete(`${baseURL}/api/listings/${listingData.id}`, { withCredentials: true });
        const data = response.data
        onDelete(listingData.id);
        logInfo(`Successfully deleted listing with id: ${listingData.id}`)
      } catch (error) {
        logError('Something bad happened when deleting a listing', error);
      }
    }
  }

  const handleListingMarkedAsSold = async () => {
    try {
      const response = await axios.patch(`${baseURL}/api/listings/${listingData.id}/sold`, {new_sold_status: !sold}, { withCredentials: true });
      setSold(prev => !prev);
    } catch (error) {
      logError("Something bad happened when updating the 'sold' status ", error);
    }
  }

  const handleListingClick = async () => {
    navigate(`/listing/${listingData.vin}`)
  }
  
  return (
    <div className='seller-listing translucent'>
      <div className='seller-listing-content'>
        <img src={listingData.images[0]} className='seller-listing-image translucent'/>
        <div className='seller-listing-info-container'>
          <div className='seller-listing-info translucent'>
            <img src={eye} />
            <p>{listingData.views}</p>
          </div>
          <div className='seller-listing-info translucent'>
            <img src={blackHeart} />
            <p>{listingData.favorites}</p>
          </div>
          <div className='edit-sold-container'>
            <div className='seller-listing-info translucent pointer' onClick={handleListingEdit}>
              <p>Edit</p>
              <img src={edit} />
            </div>
            <div className='seller-listing-info translucent pointer' onClick={handleListingMarkedAsSold}>
              <p>Mark Sold</p>
              <img src={money} />
            </div>
          </div>
          <div className='seller-listing-info translucent pointer' onClick={handleListingClick}>
            <p>View Listing</p>
          </div>
          <div className='seller-listing-info translucent pointer' onClick={handleListingDeletion}>
            <p>Delete</p>
            <img src={trash} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SellerListing