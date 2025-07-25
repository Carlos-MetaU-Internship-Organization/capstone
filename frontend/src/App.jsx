import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./components/jsx/LoginPage";
import SignupPage from "./components/jsx/SignupPage";
import BuyPage from "./components/jsx/BuyPage";
import SellPage from "./components/jsx/SellPage";
import ResultsPage from "./components/jsx/ResultsPage";
import SellerListingsPage from "./components/jsx/SellerListingsPage";
import SingleCarPage from "./components/jsx/SingleCarPage";
import HomePage from "./components/jsx/HomePage";
import ProtectedRoute from "./utils/ProtectedRoute";
import RedirectAuthToHome from "./utils/RedirectAuthToHome";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <RedirectAuthToHome>
                <LoginPage />
              </RedirectAuthToHome>
            }
          />
          <Route
            path="/signup"
            element={
              <RedirectAuthToHome>
                <SignupPage />
              </RedirectAuthToHome>
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buy"
            element={
              <ProtectedRoute>
                <BuyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sell"
            element={
              <ProtectedRoute>
                <SellPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/results"
            element={
              <ProtectedRoute>
                <ResultsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-listings"
            element={
              <ProtectedRoute>
                <SellerListingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/listing/:vin"
            element={
              <ProtectedRoute>
                <SingleCarPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
