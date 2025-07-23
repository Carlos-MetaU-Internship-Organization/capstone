import './../css/HomePage.css'
import loadingGIF from './../../assets/loading.gif'
import arrow from './../../assets/arrow.png'
import Header from './Header'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { logInfo, logWarning, logError } from '../../services/loggingService';
import { getRecommendedListings, getFavoritedListings, getPopularListings, getRecentlyVisitedListings } from '../../utils/api'
import { PAGE_SIZE } from '../../utils/constants'

function HomePage() {

  // TODO: display error/warning messages to users


  const [recommendedListings, setRecommendedListings] = useState([]);
  const [listingIndex, setListingIndex] = useState(0);

  const [favoritedListings, setFavoritedListings] = useState([]);
  const [favoritesPage, setFavoritesPage] = useState(1);

  const [popularListings, setPopularListings] = useState([]);
  const [popularPage, setPopularPage] = useState(1);

  const [recentlyVisitedListings, setRecentlyVisitedListings] = useState([])
  const [recentlyVisitedPage, setRecentlyVisitedPage] = useState(1);

  const [loaded, setLoaded] = useState(false)

  const navigate = useNavigate();

  // ON BOOT
  useEffect(() => {

    const fetchAllListings = async () => {
      try {
        const [
          favoritedListingsResponse,
          recentlyVisitedListingsResponse,
          popularListingsResponse
        ] = await Promise.all([
          getFavoritedListings(),
          getRecentlyVisitedListings(PAGE_SIZE),
          getPopularListings()
        ]);
        
        setFavoritedListings(favoritedListingsResponse.favoritedListings);
        setRecentlyVisitedListings(recentlyVisitedListingsResponse.recentlyVisitedListings);
        setPopularListings(popularListingsResponse.popularListings)

        setLoaded(true)
        
        const recommendedListingsResponse = await getRecommendedListings()
        setRecommendedListings(recommendedListingsResponse.recommendedListings);
      } catch (error) {
        logError('Something bad happened when trying to fetch your listings', error);
      }

    };
    fetchAllListings();

  }, []);

  useEffect(() => {
    if (recommendedListings.length === 0) {
      return;
    }
    const interval = setInterval(() => {
      setListingIndex(prev => (prev + 1) % recommendedListings.length)
    }, 7500)

    return () => clearInterval(interval);
  }, [recommendedListings])

  const handleRecommendedPageChange = (event) => {
    if (event.target.classList[0] === 'flipped-arrow') {
      setListingIndex(prev => (prev - 1 + recommendedListings.length) % recommendedListings.length);
    } else {
      setListingIndex(prev => (prev + 1) % recommendedListings.length );
    }
  }
  
  const handleFavoritePageChange = (event) => {
    if (event.target.classList[0] === 'flipped-arrow') {
      setFavoritesPage(prev => prev - 1);
    } else {
      setFavoritesPage(prev => prev + 1);
    }
  }

  const handlePopularPageChange = (event) => {
    if (event.target.classList[0] === 'flipped-arrow') {
      setPopularPage(prev => prev - 1);
    } else {
      setPopularPage(prev => prev + 1);
    }
  }

  const handleRecentlyVisitedPageChange = (event) => {
    if (event.target.classList[0] === 'flipped-arrow') {
      setRecentlyVisitedPage(prev => prev - 1);
    } else {
      setRecentlyVisitedPage(prev => prev + 1);
    }
  }

  return (
    <div id='home-page'>
      <Header />
      {loaded ? (
        <div id='home-content' className='fade'>
          {
            <div id='recommended-container'>
              <h2 id='recommended-label'>Recommended For You</h2>
              {recommendedListings.length > 0 ? (
                <div className='recommended-listing'>
                  <img src={arrow} height='50px' className='flipped-arrow pointer' onClick={handleRecommendedPageChange}/>
                  <img key={listingIndex} src={recommendedListings[listingIndex].images[0]} id='recommended-car-image' className='pointer grow' onClick={() => navigate(`/listing/${recommendedListings[listingIndex].vin}`)}/>
                  <img src={arrow} height='50px' className='pointer' onClick={handleRecommendedPageChange}/>
                </div>
                ) : (
                  <img src={loadingGIF}/>
                )}
              {
                recommendedListings?.length > 0 && (
                  <h3 id='recommended-info'>{recommendedListings[listingIndex].year} {recommendedListings[listingIndex].make} {recommendedListings[listingIndex].model}</h3>
                )
              }
            </div>
          }
          {
            favoritedListings.length > 0 &&
            (
              <div id='listings-container'>
                <label className='listings-label pointer'>Your Favorites</label>
                <div className='listings-cars'>
                  {
                    favoritesPage > 1 && (<img src={arrow} height='50px' className='flipped-arrow pointer' onClick={handleFavoritePageChange}/>) 
                  }
                  {
                    favoritedListings.slice((4 * (favoritesPage - 1)), (4 * favoritesPage)).map(listing => {
                      return <img key={listing.id} src={listing.images[0]} className='listing-image pointer grow' onClick={() => navigate(`/listing/${listing.vin}`)}/>
                    })
                  }
                  {
                    favoritedListings.length > favoritesPage * 4 && (<img src={arrow} height='50px' className='pointer' onClick={handleFavoritePageChange}/>)
                  }
                </div>
              </div>
            )
          }
          {
            popularListings.length > 0 &&
            (
              <div className='listings-container'>
                <label className='listings-label pointer'>What's Popular</label>
                <div className='listings-cars'>
                  {
                    popularPage > 1 && (<img src={arrow} height='50px' className='flipped-arrow pointer' onClick={handlePopularPageChange}/>) 
                  }
                  {
                    popularListings.slice((4 * (popularPage - 1)), (4 * popularPage)).map(listing => {
                      return <img key={listing.id} src={listing.images[0]} className='listing-image pointer grow' onClick={() => navigate(`/listing/${listing.vin}`)}/>
                    })
                  }
                  {
                    popularListings.length > popularPage * 4 && (<img src={arrow} height='50px' className='pointer' onClick={handlePopularPageChange}/>)
                  }
                </div>
              </div>
            )
          }
          {
            recentlyVisitedListings.length > 0 &&
            (
              <div id='favorites-container'>
                <label className='listings-label pointer'>Most Recently Visited</label>
                <div className='listings-cars'>
                  {
                    recentlyVisitedPage > 1 && (<img src={arrow} height='50px' className='flipped-arrow pointer' onClick={handleRecentlyVisitedPageChange}/>) 
                  }
                  {
                    recentlyVisitedListings.slice((4 * (recentlyVisitedPage - 1)), (4 * recentlyVisitedPage)).map(listing => {
                      return <img key={listing.id} src={listing.images[0]} className='listing-image pointer grow' onClick={() => navigate(`/listing/${listing.vin}`)}/>
                    })
                  }
                  {
                    recentlyVisitedListings.length > recentlyVisitedPage * 4 && (<img src={arrow} height='50px' className='pointer' onClick={handleRecentlyVisitedPageChange}/>)
                  }
                </div>
              </div>
            )
          }
        </div>
      ) : (
        <div id='home-loading-screen'>
          <h1 id='welcome-text'>Welcome to CarPortal! Things are getting ready...</h1>
        </div>
      )}
    </div>
  )
}

export default HomePage