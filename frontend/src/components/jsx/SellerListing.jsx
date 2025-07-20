import './../css/SellerListing.css'
import soldOverlay from './../../assets/soldOverlay.png'
import eye from './../../assets/eye.png'
import blackHeart from './../../assets/blackHeart.png'
import edit from './../../assets/edit.png'
import money from './../../assets/money.png'
import trash from './../../assets/trash.png'
import { baseURL } from '../../globals'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { logError, logInfo } from '../../utils/logging.service'
import { getListingViewCount } from '../../utils/api'
import axios from 'axios'

function SellerListing({ listingData, onDelete }) {

  const navigate = useNavigate();
  const [sold, setSold] = useState(listingData.sold);
  const [viewCount, setViewCount] = useState(null);

  useEffect(() => {
    const fetchViewCount = async () => {
      const result = await getListingViewCount(listingData.id);
      if (result.success) {
        setViewCount(result.viewCount)
      } else {
        setViewCount(0);
        logError(`Error retrieving view count for listing with VIN: ${listingData.vin}`)
      }
    }
    fetchViewCount();
  }, [listingData.id])

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
        <div className='seller-listing-image-wrapper'>
          <img src={listingData.images[0]} className='seller-listing-image translucent'/>
          {
            sold && <img src={soldOverlay} className='seller-listing-sold-overlay-img' />
          }
        </div>
        <div className='seller-listing-info-container'>
          <div className='seller-listing-info translucent'>
            <img src={eye} />
            <p>{viewCount}</p>
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
              <p>{sold ? 'Mark Unsold' : 'Mark Sold'}</p>
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