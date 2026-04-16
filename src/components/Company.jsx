import { useLocation } from 'react-router-dom';
import Logo from '../assets/Logo.png';
import CompanyApplicants from './CompanyApplicants';
import CompanyInfo from './CompanyInfo';
import CreateInternship from './CreateInternship';
import Navbar from './Navbar';
import { useState, useEffect } from 'react';

export default function Company({ supabase }) {
  const location = useLocation();
  const isApplicantsRoute = location.pathname.toLowerCase().startsWith('/applicants');
  const isInfoRoute = location.pathname.toLowerCase().startsWith('/company/info');
  const [companyData, setCompanyData] = useState({
    name: 'Loading...',
    sector: 'Loading...',
    location: 'Loading...',
  });
  const [blacklistedUniversities, setBlacklistedUniversities] = useState([]);

  useEffect(() => {
    async function fetchCompanyData() {
      const { data, error } = await supabase
        .from('Companies')
        .select('*')
        .single();
      if (error) {
        console.error('Error fetching company data:', error);
      }
      setCompanyData(data);
    };
    async function fetchBlacklistedUniversities() {
      const { data, error } = await supabase
        .from('university_blacklist')
        .select('Universities(name)');
      if (error) {
        console.error('Error fetching blacklisted universities:', error);
      } else {
        setBlacklistedUniversities(data.map((row) => row.Universities.name));
      }
    }
    fetchBlacklistedUniversities();
    fetchCompanyData();
  }, [supabase]);

  const companyLinks = [
    { to: '/CreateJob', label: 'Create Job' },
    { to: '/Applicants', label: 'Applicants' },
    { to: '/company/info', label: 'Information' },
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
      {isApplicantsRoute ? <CompanyApplicants supabase={supabase} blacklistedUniversities={blacklistedUniversities} /> : isInfoRoute ? <CompanyInfo companyData={companyData} blacklistedUniversities={blacklistedUniversities} /> : <CreateInternship supabase={supabase} />}
    </div>
  );
}
