import "./../css/SignupPage.css";
import { useState } from "react";
import tire from "./../../assets/tire.png";
import profile from "./../../assets/profile.png";
import lock from "./../../assets/lock.png";
import phone from "./../../assets/phone.png";
import mail from "./../../assets/mail.png";
import pin from "./../../assets/pin.png";
import eye from "./../../assets/eye.png"
import { Link, useNavigate } from "react-router-dom";
import { signupUser } from "../../utils/api";

function SignupPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [zip, setZip] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false)

  const navigate = useNavigate();

  const handleSignup = async (event) => {
    event.preventDefault();

    const fullName = `${firstName} ${lastName}`;
    const userInfo = {
      name: fullName,
      email,
      phoneNumber,
      zip,
      username,
      password,
    };

    const result = await signupUser(userInfo);
    if (result.success || result.status === 409) {
      navigate("/");
    }
    setMessage(result.message);
  };

  const handleZipChange = (event) => {
    const value = event.target.value;
    if (/^\d*$/.test(value)) {
      setZip(value);
    }
  };

  return (
    <div id="signup-page">
      <header id="signup-page-header">
        <img loading="lazy" src={tire} id="signup-page-header-image" />
        <h2>CarPortal</h2>
      </header>
      <div id="signup-page-overlay">
        <form
          id="signup-page-content"
          className="translucent"
          onSubmit={handleSignup}
          autoComplete="off"
        >
          <h2>Create an Account</h2>
          <h3>{message}</h3>
          <div className="signup-info">
            <input
              type="text"
              className="signup-info-textbox"
              name="first-name"
              value={firstName}
              placeholder="First Name"
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <input
              type="text"
              className="signup-info-textbox"
              name="last-name"
              value={lastName}
              placeholder="Last Name"
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          <div className="signup-info">
            <img loading="lazy" src={mail} height="16px" width="16px" />
            <input
              type="text"
              className="signup-info-textbox"
              name="email"
              value={email}
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="signup-info">
            <img loading="lazy" src={phone} height="16px" width="16px" />
            <input
              type="text"
              className="signup-info-textbox"
              name="phone-number"
              value={phoneNumber}
              placeholder="Phone Number"
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>
          <div className="signup-info">
            <img loading="lazy" src={pin} height="16px" width="16px" />
            <input
              type="text"
              className="signup-info-textbox"
              name="zip"
              value={zip}
              placeholder="ZIP"
              onChange={handleZipChange}
              required
            />
          </div>
          <div className="signup-info">
            <img loading="lazy" src={profile} height="16px" width="16px" />
            <input
              type="text"
              className="signup-info-textbox"
              name="username"
              value={username}
              placeholder="Username"
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="signup-info">
            <img loading="lazy" src={lock} height="16px" width="16px" />
            <input
              type={showPassword ? "text" : "password"}
              className="signup-info-textbox"
              name="password"
              value={password}
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <img loading="lazy" src={eye} height="16px" width="16px" className='pointer' style={{ marginRight: '10px' }} onClick={() => setShowPassword(prev => !prev)}/>
          </div>
          <button
            type="submit"
            className="signup-auth-button"
            id="signup-button"
          >
            Sign up
          </button>
          <div id="signup-account-creation">
            <p>Already have an account?</p>
            <Link to="/">
              <button type="button" className="signup-auth-button">
                Login
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignupPage;
