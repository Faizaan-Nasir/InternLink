import './App.css'
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar'
import Logo from './assets/logo.png'
import Opportunities from './components/Opportunities';
import ViewError from './components/ViewError';
import { supabase } from '../utils/supabase';
import { BrowserRouter } from 'react-router-dom';
function App() {

  return (
    <BrowserRouter>
      <div className="App">
        <ViewError />
        <div className='main-content'>
          <Navbar />
          <div className='title'>Student Dashboard</div>
          <div className='title-underline' aria-hidden='true' />
          <img src={Logo} alt='logo' className='logo' />
          <Routes>
            <Route path='/' element={<Opportunities supabase={supabase} />} />
            <Route path='/Opportunities' element={<Opportunities supabase={supabase} />} />
            <Route path='/applied' element={<div />} />
            <Route path='/responses' element={<div />} />
            <Route path='/profile' element={<div />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
