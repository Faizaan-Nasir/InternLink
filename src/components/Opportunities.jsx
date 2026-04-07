import { useState, useEffect } from 'react';
import Job from './Job';
import SearchIcon from '../assets/search-icon.png';

const sampleJobs = [
    {
        title: 'AI/ML Developer Intern',
        company: 'Microsoft Inc.',
        skills: ['PyTorch', 'LSTM', 'Cloud Computing'],
        stipend: 'Rs. 26,000',
        location: 'Hyderabad',
        duration: '6 months',
        applyBefore: 'April 24, 2026',
        minCgpa: '8.0',
        minEligibility: 'Year 3',
    },
    {
        title: 'SDE Intern',
        company: 'Google Inc.',
        skills: ['Python', 'Java', 'Cyber-Security'],
        stipend: 'Rs. 24,000',
        location: 'Bengaluru',
        duration: '6 months',
        applyBefore: 'April 30, 2026',
        minCgpa: '8.5',
        minEligibility: 'Year 3',
    },
    {
        title: 'Database Engineer',
        company: 'Oracle Inc.',
        skills: ['MySQL', 'PostgreSQL', 'Cloud Computing'],
        stipend: 'Rs. 22,000',
        location: 'Pune',
        duration: '5 months',
        applyBefore: 'May 5, 2026',
        minCgpa: '7.8',
        minEligibility: 'Year 2',
    },
    {
        title: 'Frontend Engineer Intern',
        company: 'Adobe Inc.',
        skills: ['React', 'JavaScript', 'UI Design'],
        stipend: 'Rs. 25,000',
        location: 'Noida',
        duration: '6 months',
        applyBefore: 'May 10, 2026',
        minCgpa: '8.2',
        minEligibility: 'Year 3',
    },
    {
        title: 'Data Analyst Intern',
        company: 'Amazon Inc.',
        skills: ['SQL', 'Excel', 'Data Visualization'],
        stipend: 'Rs. 23,000',
        location: 'Chennai',
        duration: '4 months',
        applyBefore: 'May 14, 2026',
        minCgpa: '7.5',
        minEligibility: 'Year 2',
    },
];

function getStipendValue(stipend) {
    return Number(stipend.replace(/[^\d]/g, ''));
}

export default function Opportunities({ supabase }) {
    const [jobs, setJobs] = useState([]);

    useEffect(() => {
        const fetchJobs = async () => {
            const { data, error } = await supabase.from('Internships').select('role,stipend,duration,deadline,min_cgpa,min_year,Companies(name,location)');
            if (error) {
                console.error('Error fetching jobs:', error);
            } else {
                setJobs(data);
            }
        };
        fetchJobs();
    }, []);

    console.log(jobs);

    const [searchQuery, setSearchQuery] = useState('');

    const normalizedQuery = searchQuery.trim().toLowerCase();
    const salaryMatch = normalizedQuery.match(/\d[\d,]*/);
    const minSalary = salaryMatch ? Number(salaryMatch[0].replace(/,/g, '')) : null;
    const textTokens = normalizedQuery
        .replace(/\d[\d,]*/g, ' ')
        .split(/\s+/)
        .filter(Boolean);

    const filteredJobs = jobs.filter((job) => {
        const searchableText = `${job.role} ${job.Companies.name} ${job.Companies.location}`.toLowerCase();
        const matchesText = textTokens.every((token) => searchableText.includes(token));
        const matchesSalary = minSalary === null || getStipendValue(job.stipend) >= minSalary;

        return matchesText && matchesSalary;
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
                                stipend={`Rs. ${job.stipend}`}
                                duration={`${job.duration} months`}
                                minCgpa={job.min_cgpa}
                                minEligibility={`Year ${job.min_year}`}
                                applyBefore={job.deadline}
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
