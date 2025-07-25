import React from 'react';
import './../../css/ui/ListingCarousel.css'
import arrow from './../../../assets/arrow.png'
import { LISTING_COUNT_PER_PAGE_CAROUSEL } from './../../../utils/constants'
import { useNavigate } from 'react-router-dom';


function ListingCarousel({ listings, currentPage, title, pageSetter }) {
  
  const navigate = useNavigate()

  const start = (currentPage - 1) * LISTING_COUNT_PER_PAGE_CAROUSEL;
  const end = currentPage * LISTING_COUNT_PER_PAGE_CAROUSEL;

  const handlePageChange = (event) => {
    if (event.target.classList[0] === 'flipped-arrow') {
      pageSetter(prev => (prev - 1 + listings.length) % listings.length);
    } else {
      pageSetter(prev => (prev + 1) % listings.length );
    }
  }

  return (
    listings.length > 0 && (
      <div className='listings-container'>
        <label className='listings-label'>{title}</label>
        <div className='listings-cars'>
          {
            currentPage > 1 && (<img loading='lazy' src={arrow} height='50px' className='flipped-arrow pointer' onClick={handlePageChange}/>) 
          }
          {
            listings.slice(start, end).map(listing => {
              return <img loading='lazy' key={listing.id} src={listing.images[0]} className='listing-image pointer grow' onClick={() => navigate(`/listing/${listing.vin}`)}/>
            })
          }
          {
            listings.length > end && (<img loading='lazy' src={arrow} height='50px' className='pointer' onClick={handlePageChange}/>)
          }
        </div>
      </div>
    )
  )
}

export default React.memo(ListingCarousel)