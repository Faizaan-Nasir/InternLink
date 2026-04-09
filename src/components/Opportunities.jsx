import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Job from './Job';
import SearchIcon from '../assets/search-icon.png';

function getStipendValue(stipend) {
    if (typeof stipend === 'number') {
        return stipend;
    }

    return Number(String(stipend).replace(/[^\d]/g, ''));
}

function isActiveDeadline(deadline) {
    const jobDeadline = new Date(deadline);

    if (Number.isNaN(jobDeadline.getTime())) {
        return true;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    jobDeadline.setHours(0, 0, 0, 0);

    return jobDeadline >= today;
}

export default function Opportunities({ supabase }) {
    const [jobs, setJobs] = useState([]);
    const [applyConfirmation, setApplyConfirmation] = useState(null);
    const [isApplying, setIsApplying] = useState(false);
    const [appliedInternshipIds, setAppliedInternshipIds] = useState(new Set());

    useEffect(() => {
        const fetchJobs = async () => {
            const { data, error } = await supabase.from('Internships').select('id,role,stipend,duration,deadline,min_cgpa,min_year,Companies(name,location),Internship_Skills(Skills(name))');
            if (error) {
                console.error('Error fetching jobs:', error);
            } else {
                setJobs(data);
            }
        };

        const fetchAppliedInternships = async () => {
            const { data: authData } = await supabase.auth.getUser();
            const userId = authData?.user?.id;
            if (!userId) {
                setAppliedInternshipIds(new Set());
                return;
            }

            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('sid')
                .eq('id', userId)
                .single();

            if (profileError || !profileData?.sid) {
                console.error('Error fetching profile sid:', profileError);
                setAppliedInternshipIds(new Set());
                return;
            }

            const { data: applicationsData, error: applicationsError } = await supabase
                .from('Applications')
                .select('internship_id')
                .eq('student_id', profileData.sid);

            if (applicationsError) {
                console.error('Error fetching applications:', applicationsError);
                setAppliedInternshipIds(new Set());
                return;
            }

            setAppliedInternshipIds(new Set((applicationsData ?? []).map((application) => application.internship_id)));
        };

        fetchJobs();
        fetchAppliedInternships();
    }, [supabase]);

    jobs.forEach(job => {
        const skillsSet = new Set();
        job.Internship_Skills.forEach(skill => skillsSet.add(skill.Skills.name));
        job.skills = Array.from(skillsSet);
    });

    const [searchQuery, setSearchQuery] = useState('');

    const normalizedQuery = searchQuery.trim().toLowerCase();
    const salaryMatch = normalizedQuery.match(/\d[\d,]*/);
    const minSalary = salaryMatch ? Number(salaryMatch[0].replace(/,/g, '')) : null;
    const textTokens = normalizedQuery
        .replace(/\d[\d,]*/g, ' ')
        .split(/\s+/)
        .filter(Boolean);

    const filteredJobs = jobs.filter((job) => {
        const hasActiveDeadline = isActiveDeadline(job.deadline);
        const searchableText = `${job.role} ${job.Companies.name} ${job.Companies.location}`.toLowerCase();
        const matchesText = textTokens.every((token) => searchableText.includes(token));
        const matchesSalary = minSalary === null || getStipendValue(job.stipend) >= minSalary;

        return hasActiveDeadline && matchesText && matchesSalary;
    });

    const confirmApply = async () => {
        if (!applyConfirmation || applyConfirmation.phase !== 'confirm' || isApplying) {
            return;
        }

        setIsApplying(true);
        try {
            const result = await applyConfirmation.runApplyQuery();
            if (result?.status === 'applied') {
                setAppliedInternshipIds((previousIds) => {
                    const nextIds = new Set(previousIds);
                    nextIds.add(applyConfirmation.jobId);
                    return nextIds;
                });
                setApplyConfirmation((previousConfirmation) => {
                    if (!previousConfirmation) {
                        return null;
                    }
                    return {
                        ...previousConfirmation,
                        phase: 'result',
                        resultType: 'applied',
                    };
                });
            } else if (result?.status === 'already_applied') {
                setAppliedInternshipIds((previousIds) => {
                    const nextIds = new Set(previousIds);
                    nextIds.add(applyConfirmation.jobId);
                    return nextIds;
                });
                setApplyConfirmation((previousConfirmation) => {
                    if (!previousConfirmation) {
                        return null;
                    }
                    return {
                        ...previousConfirmation,
                        phase: 'result',
                        resultType: 'already_applied',
                    };
                });
            } else {
                setApplyConfirmation((previousConfirmation) => {
                    if (!previousConfirmation) {
                        return null;
                    }
                    return {
                        ...previousConfirmation,
                        phase: 'result',
                        resultType: 'error',
                    };
                });
            }
        } finally {
            setIsApplying(false);
        }
    };

    return (
        <section className='opportunities-page'>
            <div className='opportunities-toolbar'>
                <div className='opportunities-summary'>Total Job Postings: {filteredJobs.length}</div>

                <label className='opportunities-search' htmlFor='opportunities-search'>
                    <input
                        id='opportunities-search'
                        className='opportunities-search-input'
                        type='text'
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder='smart search'
                    />
                    <img className='opportunities-search-image' src={SearchIcon} alt='' aria-hidden='true' />
                </label>
            </div>

            <hr className='opportunities-divider opportunities-divider-top' />

            <div className='opportunities-list' role='list' aria-label='Job opportunities'>
                {filteredJobs.length > 0 ? (
                    filteredJobs.map((job, index) => (
                        <div className='opportunity-row' key={`${job.role}-${job.Companies.name}`}>
                            <Job
                                title={job.role}
                                company={job.Companies.name}
                                location={job.Companies.location}
                                stipend={job.stipend}
                                duration={`${job.duration} months`}
                                minCgpa={job.min_cgpa}
                                minEligibility={`Year ${job.min_year}`}
                                applyBefore={job.deadline}
                                skills={job.skills}
                                status='opportunity'
                                supabase={supabase}
                                jobId={job.id}
                                onApplyIntent={(payload) => setApplyConfirmation({ ...payload, phase: 'confirm' })}
                                isAlreadyApplied={appliedInternshipIds.has(job.id)}
                            />
                            {index < filteredJobs.length - 1 ? <hr className='opportunities-divider' /> : null}
                        </div>
                    ))
                ) : (
                    <div className='opportunities-empty'>No job postings match your current search.</div>
                )}
            </div>

            {applyConfirmation ? createPortal(
                <div className='apply-confirm-overlay' role='dialog' aria-modal='true' aria-labelledby='apply-confirm-title'>
                    <div className='apply-confirm-card'>
                        {applyConfirmation.phase === 'confirm' ? (
                            <>
                                <h3 className='apply-confirm-title' id='apply-confirm-title'>Confirm Application</h3>
                                <p className='apply-confirm-message'>
                                    Apply for <strong>{applyConfirmation.title}</strong> at <strong>{applyConfirmation.company}</strong>?
                                </p>
                                <div className='apply-confirm-actions'>
                                    <button
                                        className='apply-confirm-cancel'
                                        type='button'
                                        onClick={() => setApplyConfirmation(null)}
                                        disabled={isApplying}
                                    >
                                        cancel
                                    </button>
                                    <button
                                        className='apply-confirm-submit'
                                        type='button'
                                        onClick={confirmApply}
                                        disabled={isApplying}
                                    >
                                        {isApplying ? 'applying...' : 'confirm'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h3 className='apply-confirm-title' id='apply-confirm-title'>
                                    {applyConfirmation.resultType === 'applied'
                                        ? 'Applied Successfully'
                                        : applyConfirmation.resultType === 'already_applied'
                                            ? 'Already Applied'
                                            : 'Unable To Apply'}
                                </h3>
                                <p className='apply-confirm-message'>
                                    {applyConfirmation.resultType === 'applied'
                                        ? (
                                            <>
                                                Your application for <strong>{applyConfirmation.title}</strong> at <strong>{applyConfirmation.company}</strong> has been submitted.
                                            </>
                                        )
                                        : applyConfirmation.resultType === 'already_applied'
                                            ? (
                                                <>
                                                    You have already applied for <strong>{applyConfirmation.title}</strong> at <strong>{applyConfirmation.company}</strong>.
                                                </>
                                            )
                                            : (
                                                <>
                                                    We could not process your application right now. Please try again in a while.
                                                </>
                                            )}
                                </p>
                                <p className='apply-confirm-note'>All the best. You will get a response from the company soon.</p>
                                <div className='apply-confirm-actions'>
                                    <button
                                        className='apply-confirm-submit'
                                        type='button'
                                        onClick={() => setApplyConfirmation(null)}
                                    >
                                        close
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>,
                document.body
            ) : null}
        </section>
    );
}
