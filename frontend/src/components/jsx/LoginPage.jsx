import './../css/LoginPage.css'
import { useState } from 'react'
import tire from './../../assets/tire.png'
import profile from './../../assets/profile.png'
import lock from './../../assets/lock.png'

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className='login-page-overlay'>
      <div className='login-page-content'>
        <img src={tire} height='100px' width='100px'/>
        <h2>CarPortal Login</h2>
        <div className='credentials'>
          <img src={profile} height='16px' width='16px'/>
          <input type="text" name='username' value={username} placeholder='Username or email' onChange={(e) => setUsername(e.target.value)}/>
        </div>
        <div className='credentials'>
          <img src={lock} height='16px' width='16px'/>
          <input type="text" name='password' value={password} placeholder='Password' onChange={(e) => setPassword(e.target.value)}/>
        </div>
        <button type='submit' id='login-button'>Login</button>
        <div className='account-creation'>
          <p>Don't have an account?</p>
          <button type='button'>Sign up</button>
        </div>
      </div>
    </div>
  )
}

export default LoginPage