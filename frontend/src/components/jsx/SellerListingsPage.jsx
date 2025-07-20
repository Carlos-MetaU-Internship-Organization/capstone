import './../css/SellerListingsPage.css'
import Header from './Header'
import SellerListing from './SellerListing'
import { baseURL } from '../../globals'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { logInfo, logWarning, logError } from './../../utils/logging.service';
import axios from 'axios'
import { PAGE_SIZE } from '../../utils/constants'

function SellerListingsPage() {

  const [listings, setListings] = useState([])
  const [page, setPage] = useState(1);

  const navigate = useNavigate();

  // ON BOOT
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/auth/check-auth`, { withCredentials: true });
        if (!response.data.authenticated) {
          navigate('/');
        }
      } catch {
        navigate('/');
      }
    }
    checkAuth();

  }, [navigate]);

  const fetchOwnedListings = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/listings/user/`, { withCredentials: true });
      const data = response.data;
      logInfo('Owned listings successfully retrieved');
      if (data.length > 0) {
        setListings(data);
      }
    } catch (error) {
      logError('Something went wrong when trying to fetch your owned listings', error);
    }
  }

  useEffect(() => {
    fetchOwnedListings();
  }, [])

  const handlePageChange = () => {
    setPage(prev => prev + 1);
  }

  const handleListingDeletion = (listingId) => {
    setListings(listings.filter(listing => (listing.id !== listingId)));
  }

  return (
    <div id='seller-listings-page'>
      <Header />
      <div id='seller-listings-page-content'>
        <h2 id='seller-listings-title'>Your Listings</h2>
        {
          listings.length > 0 &&
          (
            <div id='seller-listings-container'>
              <div id='seller-listings'>
                {
                  listings.slice(0, (PAGE_SIZE * page)).map(listing => {
                    return <SellerListing key={listing.id} listingData={listing} onDelete={handleListingDeletion}/>
                  })
                }
              </div>
            </div>
          )
        }
        {
          (page * PAGE_SIZE < listings.length) && (<button id='load-more-seller-listings-button' className='translucent pointer' onClick={handlePageChange}>Load More</button>)
        }
      </div>
    </div>
  )
}

export default SellerListingsPage