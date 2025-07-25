import './../../css/ui/SellerListing.css'
import soldOverlay from './../../../assets/soldOverlay.png'
import eye from './../../../assets/eye.png'
import blackHeart from './../../../assets/blackHeart.png'
import edit from './../../../assets/edit.png'
import money from './../../../assets/money.png'
import trash from './../../../assets/trash.png'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { logError, logInfo } from './../../../services/loggingService'
import { deleteListing, getListingViewCount, sellListing } from './../../../utils/api'

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
        const { deletionStatus } = await deleteListing(listingData.id)
        if (!deletionStatus) {
          // Listing did not seem to delete... Something went wrong
          // TODO: display error message component
        } else {
          logInfo(`Successfully deleted listing with id: ${listingData.id}`)
          onDelete(listingData.id);
        }
      } catch (error) {
        logError('Something bad happened when deleting a listing', error);
      }
    }
  }

  const handleListingMarkedAsSold = async () => {
    try {
      const { soldStatus } = await sellListing(listingData.id, !sold)
      if (soldStatus === sold) {
        // SoldStatus did not update... Something went wrong
        // TODO: display error message component
      } else {
        setSold(soldStatus);
      }
    } catch (error) {
      logError("Something bad happened when updating the 'sold' status ", error);
    }
  }

  const handleListingClick = async () => {
    navigate(`/listing/${listingData.vin}`)
  }
  
  return (
    <div className='seller-listing translucent grow'>
      <div className='seller-listing-content'>
        <div className='seller-listing-image-wrapper'>
          <img loading='lazy' src={listingData.images[0]} className='seller-listing-image translucent'/>
          {
          sold && <img loading='lazy' src={soldOverlay} className='seller-listing-sold-overlay-img' />
          }
        </div>
        <div className='seller-listing-info-container'>
          <div className='seller-listing-info translucent'>
            <img loading='lazy' src={eye} />
            <p>{viewCount}</p>
          </div>
          <div className='seller-listing-info translucent'>
            <img loading='lazy' src={blackHeart} />
            <p>{listingData.favorites}</p>
          </div>
          <div className='edit-sold-container'>
            <div className='seller-listing-info translucent pointer' onClick={handleListingEdit}>
              <p>Edit</p>
              <img loading='lazy' src={edit} />
            </div>
            <div className='seller-listing-info translucent pointer' onClick={handleListingMarkedAsSold}>
              <p>{sold ? 'Mark Unsold' : 'Mark Sold'}</p>
              <img loading='lazy' src={money} />
            </div>
          </div>
          <div className='seller-listing-info translucent pointer' onClick={handleListingClick}>
            <p>View Listing</p>
          </div>
          <div className='seller-listing-info translucent pointer' onClick={handleListingDeletion}>
            <p>Delete</p>
            <img loading='lazy' src={trash} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(SellerListing)