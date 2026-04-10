import { useLocation } from 'react-router-dom';
import Logo from '../assets/Logo.png';
import CompanyApplicants from './CompanyApplicants';
import CreateInternship from './CreateInternship';
import Navbar from './Navbar';

export default function Company({ supabase }) {
  const location = useLocation();
  const isApplicantsRoute = location.pathname.toLowerCase().startsWith('/applicants');

  const companyLinks = [
    { to: '/CreateJob', label: 'Create Job' },
    { to: '/Applicants', label: 'Applicants' },
  ];

  return (
    <div className='main-content'>
      <Navbar
        links={companyLinks}
        className='company-navbar'
        linkClassName='company-nav-link'
        activeClassName='company-nav-link-active'
        dividerColor='rgba(255, 255, 255, 0.45)'
      />
      <div className='title'>Company Dashboard</div>
      <div className='title-underline' aria-hidden='true' />
      <img
        src={Logo}
        alt='logo'
        className='logo'
        onClick={() => supabase.auth.signOut()}
      />

      {isApplicantsRoute ? <CompanyApplicants supabase={supabase} /> : <CreateInternship supabase={supabase} />}
    </div>
  );
}
