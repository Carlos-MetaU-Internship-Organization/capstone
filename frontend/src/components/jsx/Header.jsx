import './../css/Header.css'
import tire from './../../assets/tire.png'
import menu from './../../assets/menu.png'
import { useNavigate } from 'react-router-dom'


function Header() {
  const navigate = useNavigate();

  const handleRedirectClick = (event) => {
    navigate(`/${event.target.textContent}`)
  }
  
  const handleLogout = () => {
    // call axios backend logout endpoint
  }

  return (
    <header id='header'>
      <img src={tire} className='header-image'/>
      <h2 id='title'>CarPortal</h2>
      <div id='redirect-links'>
        <h3 className='header-buttons pointer' id='buy-redirect' style={{textDecoration: 'underline'}} onClick={handleRedirectClick}>Buy</h3>
        <h3 className='header-buttons pointer' id='sell-redirect' onClick={handleRedirectClick}>Sell</h3>
      </div>
      <h3 className='header-buttons pointer' id='logout' onClick={handleLogout}>Logout</h3>
      <img className='header-image header-buttons pointer' id='sidebar-opener' src={menu}/>
    </header>
  )
}

export default Header