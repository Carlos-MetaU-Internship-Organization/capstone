import './../../css/ui/Header.css'
import tire from './../../../assets/tire.png'
import { useNavigate } from 'react-router-dom'
import { logoutUser } from './../../../utils/api'

function Header() {
  const navigate = useNavigate();

  const handleRedirectClick = (event) => {
    navigate(`/${event.target.id.split('-')[0]}`)
  }
  
  const handleLogout = async () => {
    await logoutUser()
    // TODO, send message here...
    navigate('/')
  }

  return (
    <header id='header'>
      <img loading='lazy' src={tire} className='header-image pointer' id='home-redirect' onClick={handleRedirectClick}/>
      <h2 id='home-redirect' className='pointer' onClick={handleRedirectClick}>CarPortal</h2>
      <div id='redirect-links'>
        <h3 className='header-buttons pointer' id='buy-redirect' onClick={handleRedirectClick}>Buy</h3>
        <h3 className='header-buttons pointer' id='sell-redirect' onClick={handleRedirectClick}>Sell</h3>
      </div>
      <h3 className='header-buttons pointer' id='logout' onClick={handleLogout}>Logout</h3>
    </header>
  )
}

export default Header