import { useState, useEffect } from 'react';
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

    useEffect(() => {
        const fetchJobs = async () => {
            const { data, error } = await supabase.from('Internships').select('role,stipend,duration,deadline,min_cgpa,min_year,Companies(name,location),Internship_Skills(Skills(name))');
            if (error) {
                console.error('Error fetching jobs:', error);
            } else {
                setJobs(data);
            }
        };
        fetchJobs();
    }, []);

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
                            />
                            {index < filteredJobs.length - 1 ? <hr className='opportunities-divider' /> : null}
                        </div>
                    ))
                ) : (
                    <div className='opportunities-empty'>No job postings match your current search.</div>
                )}
            </div>
        </section>
    );
}
