import './../css/SellerListingsPage.css'
import Header from './Header'
import SellerListing from './SellerListing'
import { baseURL } from '../../globals'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { logInfo, logWarning, logError } from './../../utils/logging.service';
import axios from 'axios'

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

  const fetchUserListings = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/listings/user/`, { withCredentials: true });
      const data = response.data;
      logInfo('Active listings successfully retrieved');
      if (data.length > 0) {
        setListings(data);
      }
    } catch (error) {
      logError('Something went wrong when trying to fetch your active listings', error);
    }
  }

  useEffect(() => {
    fetchUserListings();
  }, [])

  const handlePageChange = () => {
    setPage(prev => prev + 1);
  }

  const handleListingDeletion = (listingId) => {
    setListings(listings.filter(listing => (listing.id !== listingId)));
  }

  const handleListingSoldStatusUpdate = (listingId) => {
    // find listing, update sold status, setListings state var
  }

  return (
    <div id='seller-listings-page'>
      <Header />
      <h2 id='seller-listings-title'>Your Listings</h2>
      {
        listings.length > 0 &&
        (
          <div id='seller-listings-container'>
            <div id='seller-listings'>
              {
                listings.slice(0, (20 * page)).map(listing => {
                  return <SellerListing key={listing.id} listingData={listing} onDelete={handleListingDeletion}/>
                })
              }
              {
              (page * 20 < listings.length.totalListingsCount) && (<button id='load-more-seller-listings-button' className='translucent pointer' onClick={handlePageChange}>Load More</button>)
              }
            </div>
          </div>
        )
      }
    </div>
  )
}

export default SellerListingsPage