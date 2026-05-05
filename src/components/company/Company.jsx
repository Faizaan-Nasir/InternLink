import { useLocation } from 'react-router-dom';
import Logo from '../../assets/Logo.png';
import CompanyApplicants from './CompanyApplicants';
import CompanyInfo from './CompanyInfo';
import CreateInternship from './CreateInternship';
import Navbar from '../Navbar';
import { useState, useEffect } from 'react';
import { GenerateSummary } from '../../../utils/summarizer';

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

  const [jobs, setJobs] = useState([]);
  const [aiSummariesByApplicant, setAISummariesByApplicant] = useState({});
  const [decisionByApplication, setDecisionByApplication] = useState({});


  useEffect(() => {
    const getCompanyJobs = async () => {
      const { data, error } = await supabase.from('Internships').select('id,role,Applications(student_id,applied_time),Companies(cid,name)');
      if (error) {
        console.error('Error fetching company jobs:', error);
      } else {
        for (const job of data) {
          for (const app of job.Applications) {
            const { data: studentData, error: studentError } = await supabase.from('Students').select('name,branch,year,cgpa,ph,university,university_id,Student_Skills(Skills(name)),email').eq('rno', app.student_id).maybeSingle();
            const { data: acceptedResponse, error: responseError } = await supabase.from('Responses').select('decision').eq('student_id', app.student_id).eq('internship_id', job.id).maybeSingle();
            if (responseError) {
              console.error(`Error fetching response for applicant ${app.student_id}:`, responseError);
            } else {
              const applicationKey = `${job.id}:${app.student_id}`;
              setDecisionByApplication((previousDecisions) => ({
                ...previousDecisions,
                [applicationKey]: acceptedResponse?.decision ?? null
              }));
            }
            if (studentError) {
              console.error(`Error fetching student data for applicant ${app.student_id}:`, studentError);
            } else {
              app.name = studentData.name;
              app.branch = studentData.branch;
              app.year = studentData.year;
              app.cgpa = studentData.cgpa;
              app.phone = studentData.ph;
              app.university = studentData.university;
              app.email = studentData.email;
              app.skills = studentData.Student_Skills.map((skill) => skill.Skills.name);
              app.university_id = studentData.university_id;
              app.cid = job.Companies.cid;
              app.companyName = job.Companies.name;
            }
          }
        }
      }
      const temporaryJobs = data.map((job) => ({
        id: job.id,
        title: job.role,
        companyName: job.Companies.name,
        applicantCount: job.Applications.length,
        applicants: job.Applications.map((app) => ({
          id: app.student_id,
          appliedAgo: `${Math.floor((Date.now() - new Date(app.applied_time).getTime()) / (1000 * 60 * 60))}h ago`,
          name: app.name,
          skills: app.skills,
          cgpa: app.cgpa,
          branch: app.branch,
          year: app.year,
          phone: app.phone,
          email: app.email,
          university: app.university,
          university_id: app.university_id,
          cid: app.cid,
        }))
      }))
      setJobs(temporaryJobs);
      for (const job of temporaryJobs) {
        for (const applicant of job.applicants) {
          const aiSummary = await GenerateSummary({
            branch: applicant.branch,
            year: applicant.year,
            university: applicant.university,
            cgpa: applicant.cgpa,
            skills: applicant.skills,
            company: job.companyName,
            role: job.title
          });
          setAISummariesByApplicant((previousSummaries) => ({
            ...previousSummaries,
            [`${applicant.id}:${job.id}`]: aiSummary
          }));
        }
      }
    };
    getCompanyJobs();
  }, [supabase]);

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
          jobs={jobs}
          aiSummariesByApplicant={aiSummariesByApplicant}
          decisionByApplication={decisionByApplication}
          setDecisionByApplication={setDecisionByApplication}
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
        <CreateInternship supabase={supabase} setJobs={setJobs} companyName={companyData.name} />
      )}
    </div>
  );
}
