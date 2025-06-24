import './../css/LoginPage.css'
import { useState } from 'react'

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className='login-page-overlay'>
      <div className='login-page-content'>
        <h2>Login</h2>
        <div className='credentials'>
          <div className='username'>
            {/* img here */}
            <input type="text" name='username' value={username} placeholder='Username or email' />
          </div>
          <div className='password'>
            {/* img here */}
            <input type="text" name='password' value={password} placeholder='Password' />
          </div>
        </div>
        <button type='submit'>LOGIN</button>
        <div className='account-creation'>
          <p>Don't have an account?</p>
          <button type='button'>SIGN UP</button>
        </div>
      </div>
    </div>
  )
}

export default LoginPage