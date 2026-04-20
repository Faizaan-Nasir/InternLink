import { useLocation } from 'react-router-dom';
import Logo from '../../assets/Logo.png';
import CompanyApplicants from './CompanyApplicants';
import CompanyInfo from './CompanyInfo';
import CreateInternship from './CreateInternship';
import Navbar from '../Navbar';
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
  const [blacklistedStudents, setBlacklistedStudents] = useState([
    'Loading...'
  ]);
  const [blacklistedUniversities, setBlacklistedUniversities] = useState([
    'Loading...'
  ]);

  useEffect(() => {
    async function fetchCompanyData() {
      const { data, error } = await supabase
        .from('Companies')
        .select('*')
        .maybeSingle();
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
    async function fetchBlacklistedStudents() {
      const { data, error } = await supabase
        .from('student_blacklist')
        .select('Students(name)');
      if (error) {
        console.error('Error fetching blacklisted students:', error);
      } else {
        setBlacklistedStudents(data.map((row) => row.Students.name));
      }
    }
    fetchBlacklistedStudents();
    fetchBlacklistedUniversities();
    fetchCompanyData();
  }, [supabase]);

  async function onBlacklistStudent(studentId, studentName) {
    const { error } = await supabase.from('student_blacklist').insert({ sid: studentId, cid: companyData.cid });
    if (error) {
      console.error('Error blacklisting student:', error);
      return { error };
    } else {
      setBlacklistedStudents((prev) => [...prev, studentName]);
      return { error: null };
    }
  }

  async function onBlacklistUniversity(universityId, universityName) {
    const { error } = await supabase.from('university_blacklist').insert({ uid: universityId, cid: companyData.cid });
    if (error) {
      console.error('Error blacklisting university:', error);
      return { error };
    } else {
      setBlacklistedUniversities((prev) => [...prev, universityName]);
      return { error: null };
    }
  }

  async function onRemoveBlacklistedStudent(studentName) {
    const normalizedStudentName = (studentName ?? '').trim();
    if (!normalizedStudentName || !companyData?.cid) {
      return { error: new Error('Missing student name or company id') };
    }

    const { data: studentRows, error: studentFetchError } = await supabase
      .from('Students')
      .select('rno')
      .eq('name', normalizedStudentName);

    if (studentFetchError) {
      console.error('Error fetching student ids for blacklist removal:', studentFetchError);
      return { error: studentFetchError };
    }

    const studentIds = (studentRows ?? []).map((student) => student.rno);

    if (studentIds.length === 0) {
      setBlacklistedStudents((prev) => prev.filter((name) => name !== normalizedStudentName));
      return { error: null };
    }

    const { error } = await supabase
      .from('student_blacklist')
      .delete()
      .eq('cid', companyData.cid)
      .in('sid', studentIds);

    if (error) {
      console.error('Error removing student blacklist:', error);
      return { error };
    }

    setBlacklistedStudents((prev) => prev.filter((name) => name !== normalizedStudentName));
    return { error: null };
  }

  async function onRemoveBlacklistedUniversity(universityName) {
    const normalizedUniversityName = (universityName ?? '').trim();
    if (!normalizedUniversityName || !companyData?.cid) {
      return { error: new Error('Missing university name or company id') };
    }

    const { data: universityRows, error: universityFetchError } = await supabase
      .from('Universities')
      .select('university_id')
      .eq('name', normalizedUniversityName);

    if (universityFetchError) {
      console.error('Error fetching university ids for blacklist removal:', universityFetchError);
      return { error: universityFetchError };
    }

    const universityIds = (universityRows ?? []).map((university) => university.university_id);

    if (universityIds.length === 0) {
      setBlacklistedUniversities((prev) => prev.filter((name) => name !== normalizedUniversityName));
      return { error: null };
    }

    const { error } = await supabase
      .from('university_blacklist')
      .delete()
      .eq('cid', companyData.cid)
      .in('uid', universityIds);

    if (error) {
      console.error('Error removing university blacklist:', error);
      return { error };
    }

    setBlacklistedUniversities((prev) => prev.filter((name) => name !== normalizedUniversityName));
    return { error: null };
  }

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
      {isApplicantsRoute ? (
        <CompanyApplicants
          supabase={supabase}
          blacklistedUniversities={blacklistedUniversities}
          blacklistedStudents={blacklistedStudents}
          onBlacklistStudent={onBlacklistStudent}
          onBlacklistUniversity={onBlacklistUniversity}
        />
      ) : isInfoRoute ? (
        <CompanyInfo
          companyData={companyData}
          blacklistedUniversities={blacklistedUniversities}
          blacklistedStudents={blacklistedStudents}
          onRemoveBlacklistedStudent={onRemoveBlacklistedStudent}
          onRemoveBlacklistedUniversity={onRemoveBlacklistedUniversity}
        />
      ) : (
        <CreateInternship supabase={supabase} />
      )}
    </div>
  );
}
