import './../css/Header.css'
import tire from './../../assets/tire.png'
import menu from './../../assets/menu.png'
import { useNavigate } from 'react-router-dom'
import { logoutUser } from '../../utils/api'


function Header() {
  const navigate = useNavigate();

  const handleRedirectClick = (event) => {
    navigate(`/${event.target.textContent}`)
  }
  
  const handleLogout = async () => {
    await logoutUser()
    // TODO, send message here...
    navigate('/')
  }

  return (
    <header id='header'>
      <img src={tire} className='header-image'/>
      <h2 id='title'>CarPortal</h2>
      <div id='redirect-links'>
        <h3 className='header-buttons pointer' id='buy-redirect' onClick={handleRedirectClick}>Buy</h3>
        <h3 className='header-buttons pointer' id='sell-redirect' onClick={handleRedirectClick}>Sell</h3>
      </div>
      <h3 className='header-buttons pointer' id='logout' onClick={handleLogout}>Logout</h3>
      <img className='header-image header-buttons pointer' id='sidebar-opener' src={menu}/>
    </header>
  )
}

export default Header