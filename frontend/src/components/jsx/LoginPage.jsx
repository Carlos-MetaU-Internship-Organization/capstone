import "./../css/LoginPage.css";
import { useState } from "react";
import tire from "./../../assets/tire.png";
import profile from "./../../assets/profile.png";
import lock from "./../../assets/lock.png";
import eye from "./../../assets/eye.png"
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../utils/api";

function LoginPage() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false)

  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    const result = await loginUser({ login, password });
    if (result.success) {
      navigate("/home");
    } else {
      setMessage(result.message);
    }
  };

  return (
    <div id="login-page-overlay">
      <form id="login-page-content" onSubmit={handleLogin} autoComplete="off">
        <img loading="lazy" src={tire} id="login-image" />
        <h2>CarPortal Login</h2>
        <h3 style={{ color: "red" }}>{message}</h3>
        <div className="login-info">
          <img loading="lazy" src={profile} height="16px" width="16px" />
          <input
            type="text"
            className="login-info-textbox"
            name="login"
            value={login}
            placeholder="Username or email"
            onChange={(e) => setLogin(e.target.value)}
            required
          />
        </div>
        <div className="login-info">
          <img loading="lazy" src={lock} height="16px" width="16px" />
          <input
            type={showPassword ? "text" : "password"}
            className="login-info-textbox"
            name="password"
            value={password}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <img loading="lazy" src={eye} height="16px" width="16px" className='pointer' style={{ marginRight: '10px' }} onClick={() => setShowPassword(prev => !prev)}/>
        </div>
        <button type="submit" className="login-auth-button" id="login-button">
          Login
        </button>
        <div id="login-account-creation">
          <p>Don't have an account?</p>
          <Link to="/signup">
            <button type="button" className="login-auth-button">
              Sign up
            </button>
          </Link>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
