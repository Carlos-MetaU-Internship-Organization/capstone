import './../css/SignupPage.css'
import { useState, useEffect } from 'react'
import { baseURL } from '../../globals'
import axios from 'axios'
import tire from './../../assets/tire.png'
import profile from './../../assets/profile.png'
import lock from './../../assets/lock.png'
import phone from './../../assets/phone.png'
import mail from './../../assets/mail.png'
import pin from './../../assets/pin.png'
import { Link, useNavigate } from 'react-router-dom'

function SignupPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [zip, setZip] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/auth/check-auth`, { withCredentials: true });
        if (response.data.authenticated) {
          navigate('/home');
        }
      } catch (error) {
        logError('Something went wrong when trying to check for a valid session', error);
      }
    }
    checkAuth();
  }, []);

  const handleSignup = async (event) => {
    event.preventDefault();

    const fullName = `${firstName} ${lastName}`;
    const credentials = { name: fullName, email, phoneNumber, zip, username, password };

    try {
      const response = await axios.post(`${baseURL}/api/auth/signup`, credentials);
      if (response.data.status === 200) {
        navigate('/');
      }
      setMessage(response.data.message);
    } catch (error) {
      console.log(`Error signing up: ${error.response.data}`);
    }
  }

  return (
    <div id='signup-page'>
      <header id='signup-page-header'>
        <img src={tire} id='signup-page-header-image'/>
        <h2>CarPortal</h2>
      </header>
      <div id='signup-page-overlay'>
        <form id='signup-page-content' onSubmit={handleSignup} autoComplete='off'>
          <h2>Create an Account</h2>
          <h3>{message}</h3>
          {/* TODO: make signup-info's into a component */}
          <div className='signup-info'>
            <input type="text" className='signup-info-textbox' name='first-name' value={firstName} placeholder='First Name' onChange={(e) => setFirstName(e.target.value)} required />
            <input type="text" className='signup-info-textbox' name='last-name' value={lastName} placeholder='Last Name' onChange={(e) => setLastName(e.target.value)} required />
          </div>
          <div className='signup-info'>
            <img src={mail} height='16px' width='16px'/>
            <input type="text" className='signup-info-textbox' name='email' value={email} placeholder='Email' onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className='signup-info'>
            <img src={phone} height='16px' width='16px'/>
            <input type="text" className='signup-info-textbox' name='phone-number' value={phoneNumber} placeholder='Phone Number' onChange={(e) => setPhoneNumber(e.target.value)} required />
          </div>
          <div className='signup-info'>
            <img src={pin} height='16px' width='16px'/>
            <input type="number" className='signup-info-textbox' name='zip' value={zip} placeholder='ZIP' onChange={(e) => setZip(e.target.value)} required />
          </div>
          <div className='signup-info'>
            <img src={profile} height='16px' width='16px'/>
            <input type="text" className='signup-info-textbox' name='username' value={username} placeholder='Username' onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className='signup-info'>
            <img src={lock} height='16px' width='16px'/>
            <input type="password" className='signup-info-textbox' name='password' value={password} placeholder='Password' onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type='submit' className='signup-auth-button' id='signup-button'>Sign up</button>
          <div id='signup-account-creation'>
            <p>Already have an account?</p>
            <Link to="/">
              <button type='button' className='signup-auth-button'>Login</button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SignupPage