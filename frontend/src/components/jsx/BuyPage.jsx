import './../css/BuyPage.css'
import tire from './../../assets/tire.png'
import { baseURL } from '../../globals'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function BuyPage() {

  const navigate = useNavigate();

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

  return (
    <div className='buy-page'>
      <header>
        <img src={tire}/>
        <h2>CarPortal</h2>
        {/* Buy Redirect Link Here */}
        {/* Sell Redirect Link Here */}
        {/* Icon showing User Initials Here */}
        {/* Sidebar Button Here */}
      </header>
      <div className='buy-content'>
        <div className='buy-search'>
          <div className='word-search'>
  
          </div>
          <div className='filter-search'>
            {/* Filter - New/Used Here*/}
            {/* Filter - Make Here*/}
            {/* Filter - Model Here*/}
            <div className='location-details'>
              {/* Filter - Distance Here*/}
              {/* Filter - ZIP Here*/}
            </div>
            {/* Search Button Here */}
          </div>
        </div>
        <div className='most-viewed'>

        </div>
      </div>
      <div className='favorites'>
        {/* TODO: THESE SHOULD ALL BE CLICKABLE 
        AND BE ABLE TO REDIRECT TO THEIR 
        APPROPRIATE LISTINGS ON A CLICK */}
        {/* Car 1 Image*/}
        {/* Car 2 Image*/}
        {/* Car 3 Image*/}
        {/* Car 4 Image*/}
        {/* Button that fetches the next 4 Favorited cars */}
      </div>
    </div>
  )
}

export default BuyPage