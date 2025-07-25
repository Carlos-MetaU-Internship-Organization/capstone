import React from "react"
import loadingGIF from './../../../assets/loading.gif'
import { useNavigate } from "react-router-dom"

function RecommendedListingCarousel({ listings }) {

  const navigate = useNavigate()

  return (
    <div id='recommended-container'>
      <h2 id='recommended-label'>Recommended For You</h2>
      {listings.length > 0 ? (
        <div className='slider' style={{ '--count': listings.length }}>
          <div className='recommended-listings'>
            {
              listings.map((listing, index) => {
                return (
                  <div className='recommended-listing' key={index} style={{ '--index': index }}>
                    <img loading='lazy' src={listing.images[0]} id='recommended-car-image' className='pointer grow' onClick={() => navigate(`/listing/${listings[index].vin}`)}/>
                    <h3 id='recommended-info'>{listing.year} {listing.make} {listing.model}</h3>
                  </div>
                )
              })
            }
          </div>
        </div>
      ) : (
        <img loading='lazy' src={loadingGIF}/>
      )}
    </div>
  )
}

export default React.memo(RecommendedListingCarousel)