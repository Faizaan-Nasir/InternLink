import { useEffect, useMemo, useState } from 'react';
import SearchBar from './SearchBar';

export default function CompanyApplicants({ supabase, blacklistedUniversities }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedApplicantId, setSelectedApplicantId] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [decisionByApplication, setDecisionByApplication] = useState({});
  const [isBlacklistModalOpen, setIsBlacklistModalOpen] = useState(false);
  const [localBlacklistedUniversities, setLocalBlacklistedUniversities] = useState([]);

  const blacklist = useMemo(() => {
    const source = Array.isArray(blacklistedUniversities) ? blacklistedUniversities : [];
    const normalizedFromSource = source
      .map((entry) => {
        if (typeof entry === 'string') {
          return entry.trim();
        }

        if (entry && typeof entry === 'object') {
          if (typeof entry.name === 'string') {
            return entry.name.trim();
          }

          if (typeof entry.Universities === 'string') {
            return entry.Universities.trim();
          }

          if (entry.Universities && typeof entry.Universities === 'object' && typeof entry.Universities.name === 'string') {
            return entry.Universities.name.trim();
          }

          if (Array.isArray(entry.Universities) && typeof entry.Universities[0]?.name === 'string') {
            return entry.Universities[0].name.trim();
          }
        }

        return '';
      })
      .filter(Boolean);

    return Array.from(new Set([...normalizedFromSource, ...localBlacklistedUniversities]));
  }, [blacklistedUniversities, localBlacklistedUniversities]);

  useEffect(() => {
    const getCompanyJobs = async () => {
      const { data, error } = await supabase.from('Internships').select('id,role,Applications(student_id,applied_time),Companies(cid,name)');
      if (error) {
        console.error('Error fetching company jobs:', error);
      } else {
        for (const job of data) {
          for (const app of job.Applications) {
            const { data: studentData, error: studentError } = await supabase.from('Students').select('name,branch,year,cgpa,ph,university,university_id,Student_Skills(Skills(name)),email').eq('rno', app.student_id).single();
            const { data: acceptedResponse, error: responseError } = await supabase.from('Responses').select('decision').eq('student_id', app.student_id).eq('internship_id', job.id).single();
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
          university: app.university,
          university_id: app.university_id,
          cid: app.cid
        }))
      }))
      setJobs(temporaryJobs);
    };
    getCompanyJobs();
  }, [supabase, blacklistedUniversities]);
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
  const selectedUniversityName = (selectedApplicant?.university ?? '').trim();
  const isUniversityInBlacklist = selectedUniversityName !== '' && blacklist.includes(selectedUniversityName);

  const selectJob = (jobId) => {
    setSelectedJobId(jobId);
    const job = jobs.find((item) => item.id === jobId);
    setSelectedApplicantId(job?.applicants?.[0]?.id ?? null);
  };

  const getApplicationKey = (jobId, applicantId) => `${jobId}:${applicantId}`;

  const selectedDecision = useMemo(() => {
    if (!selectedJob || !selectedApplicant) {
      return null;
    }
    return decisionByApplication[getApplicationKey(selectedJob.id, selectedApplicant.id)] ?? null;
  }, [decisionByApplication, selectedApplicant, selectedJob]);

  const handleDecision = async (decision) => {
    if (!selectedApplicant || !selectedJob) {
      return;
    }

    const dataToBeInserted = {
      student_id: selectedApplicant.id,
      internship_id: selectedJob.id,
      university_id: selectedApplicant.university_id,
      decision
    };

    const { error } = await supabase.from('Responses').insert(dataToBeInserted);

    if (error) {
      console.error(`Error updating applicant status to ${decision}:`, error);
    } else {
      const applicationKey = getApplicationKey(selectedJob.id, selectedApplicant.id);
      setDecisionByApplication((previousDecisions) => ({
        ...previousDecisions,
        [applicationKey]: decision
      }));
    }
  };

  const handleAccept = async () => {
    await handleDecision('Accepted');
  };

  const handleWaitlist = async () => {
    await handleDecision('Waitlist');
  };

  const handleReject = async () => {
    await handleDecision('Rejected');
  };

  const openBlacklistModal = () => {
    if (!selectedApplicant?.university) {
      return;
    }
    if (isUniversityInBlacklist) {
      return;
    }
    setIsBlacklistModalOpen(true);
  };

  const closeBlacklistModal = () => {
    setIsBlacklistModalOpen(false);
  };

  const confirmUniversityBlacklist = async () => {
    console.log(`Blacklisting university ${selectedApplicant.university} with ID ${selectedApplicant.university_id} for company ID ${selectedApplicant.cid}`);
    const { error } = await supabase.from('university_blacklist').insert({ university_id: selectedApplicant.university_id, cid: selectedApplicant.cid });
    if (error) {
      console.error('Error blacklisting university:', error);
    } else {
      setLocalBlacklistedUniversities((previous) => (
        previous.includes(selectedUniversityName) ? previous : [...previous, selectedUniversityName]
      ));
      setIsBlacklistModalOpen(false);
    }
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
                <button type='button' className='details-btn-secondary' disabled={isUniversityInBlacklist}>View Resume</button>
                <div className='details-actions-inline'>
                  {selectedDecision ? (
                    <button
                      type='button'
                      className={`details-btn-decision details-btn-decision-${selectedDecision.toLowerCase()}`}
                      disabled
                    >
                      {selectedDecision}
                    </button>
                  ) : (
                    <>
                      <button type='button' className='details-btn-accept' onClick={handleAccept} disabled={isUniversityInBlacklist}>Accept</button>
                      <button type='button' className='details-btn-waitlist' onClick={handleWaitlist} disabled={isUniversityInBlacklist}>Waitlist</button>
                      <button type='button' className='details-btn-reject' onClick={handleReject} disabled={isUniversityInBlacklist}>Reject</button>
                    </>
                  )}
                </div>
                <button type='button' className='details-btn-blacklist-university' onClick={openBlacklistModal} disabled={isUniversityInBlacklist}>
                  Add University To Blacklist
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isBlacklistModalOpen ? (
        <div className='company-applicants-modal-overlay' role='dialog' aria-modal='true' aria-labelledby='company-applicants-modal-title'>
          <div className='company-applicants-modal-card'>
            <h3 className='company-applicants-modal-title' id='company-applicants-modal-title'>Confirm University Blacklist</h3>
            <p className='company-applicants-modal-message'>
              Add <strong>{selectedApplicant?.university}</strong> to the blacklist?
            </p>
            <div className='company-applicants-modal-actions'>
              <button type='button' className='company-applicants-modal-cancel' onClick={closeBlacklistModal}>Cancel</button>
              <button type='button' className='company-applicants-modal-confirm' onClick={confirmUniversityBlacklist}>Confirm</button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
