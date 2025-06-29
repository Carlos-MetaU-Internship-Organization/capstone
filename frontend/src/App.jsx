import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import LoginPage from './components/jsx/LoginPage'
import SignupPage from './components/jsx/SignupPage'
import BuyPage from './components/jsx/BuyPage'
import SellPage from './components/jsx/SellPage'

function App() {

  return (
   <div className='App'>
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage/>} />
        <Route path="/buy" element={<BuyPage />} />
        <Route path="/sell" element={<SellPage />} />
      </Routes>
    </Router>
   </div>
  )
}

export default App
