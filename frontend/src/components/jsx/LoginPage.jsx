import './../css/LoginPage.css'
import { useState } from 'react'
import { baseURL } from '../../globals'
import axios from 'axios'
import tire from './../../assets/tire.png'
import profile from './../../assets/profile.png'
import lock from './../../assets/lock.png'
import { Link } from 'react-router-dom'

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();
    if (!username || !password) {
      alert('Username and password cannot be blank')
      return
    }

    const credentials = { username, password };
    
    try {
      const response = await axios.post(`${baseURL}/api/auth/login/`, credentials);
      setMessage(response.data.message);
    } catch (error) {
      console.log(`Error logging in: ${error.response.data}`);
    }
  }

  const handleSignup = async () => {
    if (!username || !password) {
      alert('Username and password cannot be blank')
      return
    }
    const credentials = { username, password };

    try {
      const response = await axios.post(`${baseURL}/api/auth/signup`, credentials);
      setMessage(response.data.message);
    } catch (error) {
      console.log(`Error signing up: ${error.response.data}`);
    }
  }

  return (
    <div className='login-page-overlay'>
      <div className='login-page-content'>
        <img src={tire} height='100px' width='100px'/>
        <h2>CarPortal Login</h2>
        <h3>{message}</h3>
        <div className='login-info'>
          <img src={profile} height='16px' width='16px'/>
          <input type="text" name='username' value={username} placeholder='Username or email' onChange={(e) => setUsername(e.target.value)}/>
        </div>
        <div className='login-info'>
          <img src={lock} height='16px' width='16px'/>
          <input type="password" name='password' value={password} placeholder='Password' onChange={(e) => setPassword(e.target.value)}/>
        </div>
        <button type='submit' className='auth-button' id='login-button' onClick={handleLogin}>Login</button>
        <div className='account-creation'>
          <p>Don't have an account?</p>
          <Link to="/signup">
            <button type='button' className='auth-button'>Sign up</button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default LoginPage