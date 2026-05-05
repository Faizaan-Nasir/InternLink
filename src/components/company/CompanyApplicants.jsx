import { useEffect, useMemo, useState } from 'react';
import SearchBar from '../SearchBar';

export default function CompanyApplicants({ supabase, blacklistedUniversities, blacklistedStudents, onBlacklistStudent, onBlacklistUniversity, jobs, aiSummariesByApplicant, decisionByApplication, setDecisionByApplication }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedApplicantId, setSelectedApplicantId] = useState(null);
  const [blacklistModalType, setBlacklistModalType] = useState(null);

  const filteredJobs = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase();
    if (!normalizedQuery) {
      return jobs;
    }

    return jobs.filter((job) => job.title.toLowerCase().includes(normalizedQuery));
  }, [jobs, searchTerm]);

  useEffect(() => {
    async function validateSelectedJob() {
      if (!selectedJobId) {
        return;
      }

      const selectedStillVisible = filteredJobs.some((job) => job.id === selectedJobId);
      if (!selectedStillVisible) {
        await setSelectedJobId(null);
        setSelectedApplicantId(null);
      }
    }
    validateSelectedJob();
  }, [filteredJobs, selectedJobId]);

  const selectedJob = filteredJobs.find((job) => job.id === selectedJobId) || null;
  const applicantsForSelectedJob = selectedJob ? selectedJob.applicants : [];
  const selectedApplicant = applicantsForSelectedJob.find((applicant) => applicant.id === selectedApplicantId) || null;
  const selectedUniversityName = (selectedApplicant?.university ?? '').trim();
  const selectedStudentName = (selectedApplicant?.name ?? '').trim();
  const studentBlacklist = useMemo(
    () => new Set((Array.isArray(blacklistedStudents) ? blacklistedStudents : []).map((name) => name.trim())),
    [blacklistedStudents]
  );
  const isUniversityInBlacklist = selectedUniversityName !== '' && blacklistedUniversities.includes(selectedUniversityName);
  const isStudentInBlacklist = selectedStudentName !== '' && studentBlacklist.has(selectedStudentName);

  const selectJob = (jobId) => {
    setSelectedJobId(jobId);
    const job = jobs.find((item) => item.id === jobId);
    setSelectedApplicantId(job?.applicants?.[0]?.id ?? null);
  };

  const getApplicationKey = (jobId, applicantId) => `${jobId}:${applicantId}`;

  const selectedDecision =
    selectedJob && selectedApplicant
      ? decisionByApplication[getApplicationKey(selectedJob.id, selectedApplicant.id)] ?? null
      : null;

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

  const openBlacklistModal = (category) => {
    if (category == 'university' && !selectedApplicant?.university) {
      return;
    }
    if (category == 'student' && !selectedApplicant?.name) {
      return;
    }
    setBlacklistModalType(category);
  };


  const closeBlacklistModal = () => {
    setBlacklistModalType(null);
  };

  const confirmUniversityBlacklist = async () => {
    console.log(`Blacklisting university ${selectedApplicant.university} with ID ${selectedApplicant.university_id} for company ID ${selectedApplicant.cid}`);
    const { error } = await onBlacklistUniversity(selectedApplicant.university_id, selectedApplicant.university);
    if (error) {
      console.error('Error blacklisting university:', error);
    }
    setBlacklistModalType(null);
  };

  const confirmStudentBlacklist = async () => {
    console.log(`Blacklisting student ${selectedStudentName} for company ID ${selectedApplicant.cid}`);
    const { error } = await onBlacklistStudent(selectedApplicant.id, selectedStudentName);
    if (error) {
      console.error('Error blacklisting student:', error);
    }
    setBlacklistModalType(null);
  };

  const confirmBlacklist = async () => {
    if (blacklistModalType === 'student') {
      await confirmStudentBlacklist();
      return;
    }

    await confirmUniversityBlacklist();
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

                <div className='details-ai-insights'>
                  <h4 className='details-ai-insights-title'>AI Insights</h4>
                  <p className='details-ai-insights-copy'>
                    {aiSummariesByApplicant[`${selectedApplicant.id}:${selectedJob.id}`] || 'Generating AI insights...'}
                  </p>
                </div>

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
                <button type='button' className='details-btn-secondary' disabled={isUniversityInBlacklist || isStudentInBlacklist}>View Resume</button>
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
                      <button type='button' className='details-btn-accept' onClick={handleAccept} disabled={isUniversityInBlacklist || isStudentInBlacklist}>Accept</button>
                      <button type='button' className='details-btn-waitlist' onClick={handleWaitlist} disabled={isUniversityInBlacklist || isStudentInBlacklist}>Waitlist</button>
                      <button type='button' className='details-btn-reject' onClick={handleReject} disabled={isUniversityInBlacklist || isStudentInBlacklist}>Reject</button>
                    </>
                  )}
                </div>
                <div className='details-blacklist-actions'>
                  <button
                    type='button'
                    className='details-btn-blacklist-student'
                    onClick={() => openBlacklistModal('student')}
                    disabled={isStudentInBlacklist}
                  >
                    Blacklist Student
                  </button>
                  <button
                    type='button'
                    className='details-btn-blacklist-university'
                    onClick={() => openBlacklistModal('university')}
                    disabled={isUniversityInBlacklist}
                  >
                    Blacklist University
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {blacklistModalType ? (
        <div className='company-applicants-modal-overlay' role='dialog' aria-modal='true' aria-labelledby='company-applicants-modal-title'>
          <div className='company-applicants-modal-card'>
            <h3 className='company-applicants-modal-title' id='company-applicants-modal-title'>
              {blacklistModalType === 'student' ? 'Confirm Student Blacklist' : 'Confirm University Blacklist'}
            </h3>
            <p className='company-applicants-modal-message'>
              Add <strong>{blacklistModalType === 'student' ? selectedApplicant?.name : selectedApplicant?.university}</strong> to the blacklist?
            </p>
            <div className='company-applicants-modal-actions'>
              <button type='button' className='company-applicants-modal-cancel' onClick={closeBlacklistModal}>Cancel</button>
              <button type='button' className='company-applicants-modal-confirm' onClick={confirmBlacklist}>Confirm</button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
