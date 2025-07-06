import './../css/LoginPage.css'
import { useState } from 'react'
import { baseURL } from '../../globals'
import axios from 'axios'
import tire from './../../assets/tire.png'
import profile from './../../assets/profile.png'
import lock from './../../assets/lock.png'
import { Link, useNavigate } from 'react-router-dom'
import { logInfo, logWarning, logError } from './../../utils/logging.service'
import { loginUser } from './../../utils/helpers'

function LoginPage() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    const result = await loginUser({ login, password });
    if (result.success) {
      // TODO: send message to buy page.
      logInfo('Navigating to Buy Page after successful login.');
      navigate('/home');
    } else {
      setMessage(result.message);
    }
  }

  return (
    <div id='login-page-overlay'>
      <form id='login-page-content' onSubmit={handleLogin} autoComplete='off'>
        <img src={tire} id='login-image'/>
        <h2>CarPortal Login</h2>
        <h3 style={{ color: 'red' }}>{message}</h3>
        <div className='login-info'>
          <img src={profile} height='16px' width='16px'/>
          <input type="text" className='login-info-textbox' name='login' value={login} placeholder='Username or email' onChange={(e) => setLogin(e.target.value)} required />
        </div>
        <div className='login-info'>
          <img src={lock} height='16px' width='16px'/>
          <input type="password" className='login-info-textbox' name='password' value={password} placeholder='Password' onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type='submit' className='login-auth-button' id='login-button'>Login</button>
        <div id='login-account-creation'>
          <p>Don't have an account?</p>
          <Link to="/signup">
            <button type='button' className='login-auth-button'>Sign up</button>
          </Link>
        </div>
      </form>
    </div>
  )
}

export default LoginPage