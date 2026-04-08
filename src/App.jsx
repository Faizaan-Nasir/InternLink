import './App.css'
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar'
import Logo from './assets/logo.png'
import Opportunities from './components/Opportunities';
import Applied from './components/Applied';
import Responses from './components/Responses';
import Login from './components/Login';
import ViewError from './components/ViewError';
import { supabase } from '../utils/supabase';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

function AppShell() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthReady(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);

        if (_event === 'SIGNED_IN') {
          navigate('/Opportunities', { replace: true });
        }

        if (_event === 'SIGNED_OUT') {
          navigate('/login', { replace: true });
        }
      }
    );
    return () => listener.subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!authReady) {
      return;
    }
    !user && navigate('/login');
  }, [authReady, user, navigate]);

  if (!authReady) {
    return (
      <div className="App">
        <ViewError />
      </div>
    );
  }

  return (
    <div className="App">
      <ViewError />
      {!user ? (
        <div className='main-content login-shell'>
          <Routes>
            <Route path='/login' element={<Login supabase={supabase} />} />
          </Routes>
        </div>
      ) : (
        <div className='main-content'>
          <Navbar />
          <div className='title'>Student Dashboard</div>
          <div className='title-underline' aria-hidden='true' />
          <img src={Logo} alt='logo' className='logo' onClick={() => supabase.auth.signOut()} />
          <Routes>
            <Route path='/' element={<Opportunities supabase={supabase} />} />
            <Route path='/Opportunities' element={<Opportunities supabase={supabase} />} />
            <Route path='/applied' element={<Applied />} />
            <Route path='/responses' element={<Responses />} />
            <Route path='/profile' element={<div />} />
          </Routes>
        </div>
      )}
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}

export default App
