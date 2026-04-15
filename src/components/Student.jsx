import { Route, Routes, useLocation } from 'react-router-dom';
import Logo from '../assets/Logo.png';
import Applied from './Applied';
import Navbar from './Navbar';
import Opportunities from './Opportunities';
import Profile from './Profile';
import Responses from './Responses';
import University from './University';

export default function Student({ supabase }) {
  const location = useLocation();

  if (location.pathname.toLowerCase().startsWith('/university')) {
    return <University />;
  }

  const studentLinks = [
    { to: '/Opportunities', label: 'Opportunities' },
    { to: '/Applied', label: 'Applied' },
    { to: '/Responses', label: 'Responses' },
    { to: '/Profile', label: 'Profile' },
  ];

  return (
    <div className='main-content'>
      <Navbar links={studentLinks} />
      <div className='title'>Student Dashboard</div>
      <div className='title-underline' aria-hidden='true' />
      <img
        src={Logo}
        alt='logo'
        className='logo'
        onClick={() => supabase.auth.signOut()}
      />

      <Routes>
        <Route path='/' element={<Opportunities supabase={supabase} />} />
        <Route path='/Opportunities' element={<Opportunities supabase={supabase} />} />
        <Route path='/Applied' element={<Applied supabase={supabase} />} />
        <Route path='/Responses' element={<Responses supabase={supabase} />} />
        <Route path='/Profile' element={<Profile supabase={supabase} />} />
      </Routes>
    </div>
  );
}
