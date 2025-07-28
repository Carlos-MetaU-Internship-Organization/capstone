import { useNavigate } from "react-router-dom";
import "./../css/InvalidPage.css";


function InvalidPage() {
  const navigate = useNavigate()

  return (
    <div id="invalid-page">
      <p id="go-home-message" className="pointer" onClick={(e) => navigate("/home")}>Go Home</p>
      <p id="invalid-message">Invalid Route</p>
    </div>
  )
}

export default InvalidPage