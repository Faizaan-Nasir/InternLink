import { useEffect, useMemo, useState } from 'react';
import SearchBar from './SearchBar';

export default function CompanyApplicants({ supabase }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedApplicantId, setSelectedApplicantId] = useState(null);
  const [jobs, setJobs] = useState([]);
  async function getCompanyJobs() {
    const { data, error } = await supabase.from('Internships').select('id,role,Applications(student_id,applied_time),Companies(name)');
    if (error) {
      console.error('Error fetching company jobs:', error);
    } else {
      console.log('Fetched company jobs:', data);
      for (const job of data) {
        console.log(`Job: ${job.role}, Applicants: ${job.Applications.length}`);
        for (const app of job.Applications) {
          console.log(`  Applicant ID: ${app.student_id}, Applied Time: ${app.applied_time}`);
          const { data: studentData, error: studentError } = await supabase.from('Students').select('name,branch,year,cgpa,ph,university,Student_Skills(Skills(name)),email').eq('rno', app.student_id).single();
          if (studentError) {
            console.error(`Error fetching student data for applicant ${app.student_id}:`, studentError);
          } else {
            console.log(`    Student Name: ${studentData.name}, Branch: ${studentData.branch}, Year: ${studentData.year}, CGPA: ${studentData.cgpa}, University: ${studentData.university}, Skills: ${studentData.Student_Skills.map((skill) => skill.Skills.name).join(', ')}`);
            app.name = studentData.name;
            app.branch = studentData.branch;
            app.year = studentData.year;
            app.cgpa = studentData.cgpa;
            app.phone = studentData.ph;
            app.university = studentData.university;
            app.email = studentData.email;
            app.skills = studentData.Student_Skills.map((skill) => skill.Skills.name);
          }
        }
      }
    }
    const temporaryJobs = data.map((job) => ({
      id: job.id,
      title: job.role,
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
        university: app.university
      }))
    }))
    setJobs(temporaryJobs);
  }
  useEffect(() => {
    getCompanyJobs();
  }, [supabase]);
  const filteredJobs = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase();
    if (!normalizedQuery) {
      return jobs;
    }

    return jobs.filter((job) => job.title.toLowerCase().includes(normalizedQuery));
  }, [jobs, searchTerm]);

  useEffect(() => {
    if (!selectedJobId) {
      return;
    }

    const selectedStillVisible = filteredJobs.some((job) => job.id === selectedJobId);
    if (!selectedStillVisible) {
      setSelectedJobId(null);
      setSelectedApplicantId(null);
    }
  }, [filteredJobs, selectedJobId]);

  const selectedJob = filteredJobs.find((job) => job.id === selectedJobId) || null;
  const applicantsForSelectedJob = selectedJob ? selectedJob.applicants : [];
  const selectedApplicant = applicantsForSelectedJob.find((applicant) => applicant.id === selectedApplicantId) || null;

  const selectJob = (jobId) => {
    setSelectedJobId(jobId);
    const job = jobs.find((item) => item.id === jobId);
    setSelectedApplicantId(job?.applicants?.[0]?.id ?? null);
  };

  return (
    <section className='company-applicants-page'>
      <div className='company-applicants-top'>
        <h2 className='company-applicants-title'>Applicants</h2>
        <SearchBar
          id='company-job-search'
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder='Search by job title...'
        />
      </div>

      <div className='company-applicants-layout'>
        <div className='jobs-panel'>
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <button
                key={job.id}
                type='button'
                className={`panel-row jobs-row${selectedJobId === job.id ? ' panel-row-selected' : ''}`}
                onClick={() => selectJob(job.id)}
              >
                <span className='jobs-row-title'>{job.title}</span>
                <span className='jobs-row-meta'>{job.applicantCount} applicants</span>
              </button>
            ))
          ) : (
            <div className='panel-empty'>No jobs match this search.</div>
          )}
        </div>

        <div className='applicants-panel'>
          {!selectedJob ? (
            <div className='panel-empty'>Select a job to view applicants</div>
          ) : (
            applicantsForSelectedJob.map((applicant) => (
              <button
                key={applicant.id}
                type='button'
                className={`panel-row applicants-row${selectedApplicantId === applicant.id ? ' panel-row-selected' : ''}`}
                onClick={() => setSelectedApplicantId(applicant.id)}
              >
                <span className='applicants-row-name'>{applicant.name}</span>
                <span className='applicants-row-meta'>CGPA {applicant.cgpa} • {applicant.appliedAgo}</span>
              </button>
            ))
          )}
        </div>

        <div className='details-panel'>
          {!selectedApplicant ? (
            <div className='panel-empty'>Select an applicant to view details</div>
          ) : (
            <div className='details-content'>
              <div className='details-scroll'>
                <h3 className='details-name'>{selectedApplicant.name}</h3>
                <p className='details-subtext'>{selectedApplicant.branch} • Year {selectedApplicant.year}</p>

                <div className='details-row'>
                  <span className='details-label'>University</span>
                  <span className='details-value'>{selectedApplicant.university}</span>
                </div>
                <div className='details-row'>
                  <span className='details-label'>CGPA</span>
                  <span className='details-value'>{selectedApplicant.cgpa}</span>
                </div>
                <div className='details-row'>
                  <span className='details-label'>Skills</span>
                  <span className='details-value'>{selectedApplicant.skills.join(', ')}</span>
                </div>
                <div className='details-row'>
                  <span className='details-label'>Phone</span>
                  <span className='details-value'>{selectedApplicant.phone}</span>
                </div>
                <div className='details-row'>
                  <span className='details-label'>Email</span>
                  <span className='details-value'>{selectedApplicant.email}</span>
                </div>
              </div>

              <div className='details-actions details-actions-sticky'>
                <button type='button' className='details-btn-secondary'>View Resume</button>
                <div className='details-actions-inline'>
                  <button type='button' className='details-btn-accept'>Accept</button>
                  <button type='button' className='details-btn-reject'>Reject</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
