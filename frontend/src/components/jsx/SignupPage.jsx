import './../css/SignupPage.css'
import { useState } from 'react'
import { baseURL } from '../../globals'
import axios from 'axios'
import tire from './../../assets/tire.png'
import profile from './../../assets/profile.png'
import lock from './../../assets/lock.png'
import phone from './../../assets/phone.png'
import mail from './../../assets/mail.png'
import { Link } from 'react-router-dom'

function SignupPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

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
    <div className='signup-page'>
      <header>
        <img src={tire}/>
        <h2>CarPortal</h2>
      </header>
      <div className='signup-page-overlay'>
        <div className='signup-page-content'>
          <h2>Create an Account</h2>
          <h3>{message}</h3>
          <div className='signup-info'>
            <input type="text" className='signup-info-textbox' name='first-name' value={firstName} placeholder='First Name' onChange={(e) => setFirstName(e.target.value)}/>
            <input type="text" className='signup-info-textbox' name='last-name' value={lastName} placeholder='Last Name' onChange={(e) => setLastName(e.target.value)}/>
          </div>
          <div className='signup-info'>
            <img src={mail} height='16px' width='16px'/>
            <input type="text" className='signup-info-textbox' name='email' value={email} placeholder='Email' onChange={(e) => setEmail(e.target.value)}/>
          </div>
          <div className='signup-info'>
            <img src={phone} height='16px' width='16px'/>
            <input type="text" className='signup-info-textbox' name='phone-number' value={phoneNumber} placeholder='Phone Number' onChange={(e) => setPhoneNumber(e.target.value)}/>
          </div>
          <div className='signup-info'>
            <img src={profile} height='16px' width='16px'/>
            <input type="text" className='signup-info-textbox' name='username' value={username} placeholder='Username' onChange={(e) => setUsername(e.target.value)}/>
          </div>
          <div className='signup-info'>
            <img src={lock} height='16px' width='16px'/>
            <input type="password" className='signup-info-textbox' name='password' value={password} placeholder='Password' onChange={(e) => setPassword(e.target.value)}/>
          </div>
          <button type='submit' className='auth-button' id='signup-button' onClick={handleSignup}>Signup</button>
          <div className='account-creation'>
            <p>Already have an account?</p>
            <Link to="/">
              <button type='button' className='auth-button'>Login</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignupPage