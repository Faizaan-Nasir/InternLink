import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function Navbar() {
  const location = useLocation();
  const [active, setActive] = useState(location.pathname === '/' ? 'Opportunities' : location.pathname.split('/')[1].charAt(0).toUpperCase() + location.pathname.split('/')[1].slice(1));
  return (
    <div className='navbar'>
      <Link to='/Opportunities' className={active === 'Opportunities' ? 'nav-link-active' : 'nav-link'} style={{ borderRight: '1px solid white' }} onClick={() => setActive('Opportunities')}>Opportunities</Link>
      <Link to='/Applied' className={active === 'Applied' ? 'nav-link-active' : 'nav-link'} style={{ borderRight: '1px solid white' }} onClick={() => setActive('Applied')}>Applied</Link>
      <Link to='/Responses' className={active === 'Responses' ? 'nav-link-active' : 'nav-link'} style={{ borderRight: '1px solid white' }} onClick={() => setActive('Responses')}>Responses</Link>
      <Link to='/Profile' className={active === 'Profile' ? 'nav-link-active' : 'nav-link'} onClick={() => setActive('Profile')}>Profile</Link>
    </div>
  );
}