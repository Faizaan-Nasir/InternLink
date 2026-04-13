import { Routes, Route } from 'react-router-dom';
import Company from './components/Company';
import Login from './components/Login';
import Student from './components/Student';
import ViewError from './components/ViewError';
import { supabase } from '../utils/supabase';
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [category, setCategory] = useState(null);
  const [roleReady, setRoleReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!active) {
        return;
      }
      setUser(session?.user ?? null);
      setAuthReady(true);
    }

    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (_event === 'SIGNED_OUT') {
          setUser(null);
          setCategory(null);
          setRoleReady(true);
          navigate('/login', { replace: true });
          return;
        }

        const nextUser = session?.user ?? null;
        setUser((prevUser) => {
          if (prevUser?.id === nextUser?.id) {
            return prevUser;
          }
          return nextUser;
        });
      }
    );

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    const userId = user?.id ?? null;

    if (!authReady) {
      return;
    }

    if (!userId) {
      setCategory(null);
      setRoleReady(true);
      return;
    }

    let active = true;
    setRoleReady(false);

    async function resolveRoleForUser() {
      setRoleReady(false);

      const { data, error } = await supabase.from('profiles')
        .select('category')
        .eq('id', userId)
        .single();

      if (!active) {
        return;
      }

      if (error || !data?.category) {
        console.error('Profile fetch error:', error);
        await supabase.auth.signOut();
        return;
      }

      setCategory(data.category);

      if (data.category !== 'Student' && data.category !== 'Company') {
        console.error('Unauthorized access: User is not a student or company');
        await supabase.auth.signOut();
        return;
      }

      setRoleReady(true);
    }

    resolveRoleForUser();

    return () => {
      active = false;
    };
  }, [authReady, user?.id]);

  useEffect(() => {
    if (!authReady || !roleReady || !user || (category !== 'Student' && category !== 'Company')) {
      return;
    }

    if (location.pathname.toLowerCase() === '/login' && category === 'Student') {
      navigate('/Opportunities', { replace: true });
    }
    if (location.pathname.toLowerCase() === '/login' && category === 'Company') {
      navigate('/CreateJob', { replace: true });
    }
  }, [authReady, roleReady, user, category, location.pathname, navigate]);

  const shouldShowStudent = authReady && !!user && roleReady && category === 'Student';
  const shouldShowCompany = authReady && !!user && roleReady && category === 'Company';

  return (
    <div className="App">
      <ViewError />
      {shouldShowCompany ? (
        <Company supabase={supabase} />
      ) : shouldShowStudent ? (
        <Student supabase={supabase} />
      ) : (
        <div className='main-content login-shell'>
          <Routes>
            <Route path='/login' element={<Login supabase={supabase} />} />
            <Route path='*' element={<Login supabase={supabase} />} />
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
