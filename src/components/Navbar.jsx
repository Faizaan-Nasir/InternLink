import { NavLink } from 'react-router-dom';

export default function Navbar({
  links = [
    { to: '/Opportunities', label: 'Opportunities' },
    { to: '/Applied', label: 'Applied' },
    { to: '/Responses', label: 'Responses' },
    { to: '/Profile', label: 'Profile' },
  ],
  className = 'navbar',
  linkClassName = 'nav-link',
  activeClassName = 'nav-link-active',
  dividerColor = 'white',
}) {
  return (
    <div className={className}>
      {links.map((link, index) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) => (isActive ? activeClassName : linkClassName)}
          style={index < links.length - 1 ? { borderRight: `1px solid ${dividerColor}` } : undefined}
        >
          {link.label}
        </NavLink>
      ))}
    </div>
  );
}
