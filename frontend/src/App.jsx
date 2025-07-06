import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import LoginPage from './components/jsx/LoginPage'
import SignupPage from './components/jsx/SignupPage'
import BuyPage from './components/jsx/BuyPage'
import SellPage from './components/jsx/SellPage'
import ResultsPage from './components/jsx/ResultsPage'
import SellerListingsPage from './components/jsx/SellerListingsPage'
import SingleCarPage from './components/jsx/SingleCarPage'
import HomePage from './components/jsx/HomePage'

function App() {

  return (
   <div className='App'>
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/signup" element={<SignupPage/>} />
        <Route path="/buy" element={<BuyPage />} />
        <Route path="/sell" element={<SellPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path='/my-listings' element={<SellerListingsPage />} />
        <Route path='/listing/:vin' element={<SingleCarPage />} />
      </Routes>
    </Router>
   </div>
  )
}

export default App
