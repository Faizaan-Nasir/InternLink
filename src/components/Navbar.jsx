import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <div className='navbar'>
      <NavLink to='/Opportunities' className={({ isActive }) => isActive ? 'nav-link-active' : 'nav-link'} style={{ borderRight: '1px solid white' }}>Opportunities</NavLink>
      <NavLink to='/Applied' className={({ isActive }) => isActive ? 'nav-link-active' : 'nav-link'} style={{ borderRight: '1px solid white' }}>Applied</NavLink>
      <NavLink to='/Responses' className={({ isActive }) => isActive ? 'nav-link-active' : 'nav-link'} style={{ borderRight: '1px solid white' }}>Responses</NavLink>
      <NavLink to='/Profile' className={({ isActive }) => isActive ? 'nav-link-active' : 'nav-link'}>Profile</NavLink>
    </div>
  );
}