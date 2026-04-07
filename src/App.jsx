import './App.css'
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar'
import Logo from './assets/logo.png'
import { BrowserRouter } from 'react-router-dom';
function App() {

  return (
    <BrowserRouter>
      <div className="App">
        <div className='main-content'>
          <Navbar />
          <div className='title'>Student Dashboard</div>
          <img src={Logo} alt='logo' className='logo' />
          <Routes>
            {/* element={} */}
            <Route path='/' />
            <Route path='/applied' />
            <Route path='/responses' />
            <Route path='/profile' />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
