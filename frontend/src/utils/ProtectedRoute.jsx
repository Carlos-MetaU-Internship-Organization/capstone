import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom'
import { checkAuth } from './api'
import { logWarning } from "../services/loggingService";

function ProtectedRoute({ children }) {

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
  if (!isAuthenticated) {
    logWarning('User cannot access this page until they have logged in')
    return navigate('/')
  }
  return children;
}

export default ProtectedRoute