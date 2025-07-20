import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom'
import { checkAuth } from './api'

function RedirectAuthToHome({ children }) {

  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    async function verify() {
      const result = await checkAuth();
      setIsAuthenticated(result.authenticated);
      setAuthChecked(true);
    }
    verify();
  }, [])

  if (!authChecked) return null;
  if (isAuthenticated) {
    return navigate('/home')
  }
  return children;
}

export default RedirectAuthToHome