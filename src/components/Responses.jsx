import { useState } from 'react';
import Job from './Job';
import SearchBar from './SearchBar';

const sampleResponses = [
  {
    title: 'AI Research Intern',
    company: 'OpenAI Inc.',
    skills: ['PyTorch', 'Transformers', 'Python'],
    stipend: 45000,
    location: 'Bengaluru',
    duration: '6 months',
    applyBefore: '2026-06-10',
    minCgpa: 8.5,
    minEligibility: 'Year 4',
    status: 'Accepted',
  },
  {
    title: 'Cloud Engineer Intern',
    company: 'Amazon Inc.',
    skills: ['AWS', 'Linux', 'Networking'],
    stipend: 36000,
    location: 'Hyderabad',
    duration: '5 months',
    applyBefore: '2026-05-18',
    minCgpa: 8.0,
    minEligibility: 'Year 3',
    status: 'Rejected',
  },
  {
    title: 'Frontend Intern',
    company: 'Adobe Inc.',
    skills: ['React', 'TypeScript', 'CSS'],
    stipend: 30000,
    location: 'Noida',
    duration: '6 months',
    applyBefore: '2026-05-28',
    minCgpa: 7.8,
    minEligibility: 'Year 3',
    status: 'Waitlist',
  },
  {
    title: 'Data Engineer Intern',
    company: 'Microsoft Inc.',
    skills: ['SQL', 'ETL', 'Azure'],
    stipend: 38000,
    location: 'Pune',
    duration: '6 months',
    applyBefore: '2026-06-04',
    minCgpa: 8.2,
    minEligibility: 'Year 3',
    status: 'Accepted',
  },
];

function getStipendValue(stipend) {
  if (typeof stipend === 'number') {
    return stipend;
  }

  return Number(String(stipend).replace(/[^\d]/g, ''));
}

export default function Responses() {
  const [searchQuery, setSearchQuery] = useState('');

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const salaryMatch = normalizedQuery.match(/\d[\d,]*/);
  const minSalary = salaryMatch ? Number(salaryMatch[0].replace(/,/g, '')) : null;
  const textTokens = normalizedQuery
    .replace(/\d[\d,]*/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  const filteredJobs = sampleResponses.filter((job) => {
    const searchableText = `${job.title} ${job.company} ${job.location} ${job.status}`.toLowerCase();
    const matchesText = textTokens.every((token) => searchableText.includes(token));
    const matchesSalary = minSalary === null || getStipendValue(job.stipend) >= minSalary;

    return matchesText && matchesSalary;
  });

  return (
    <section className='opportunities-page responses-page'>
      <div className='opportunities-toolbar'>
        <div className='opportunities-summary'>Total Responses: {filteredJobs.length}</div>

        <SearchBar
          id='responses-search'
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder='smart search'
        />
      </div>

      <hr className='opportunities-divider opportunities-divider-top' />

      <div className='opportunities-list' role='list' aria-label='Response jobs'>
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job, index) => (
            <div className='opportunity-row' key={`${job.title}-${job.company}`}>
              <Job {...job} />
              {index < filteredJobs.length - 1 ? <hr className='opportunities-divider' /> : null}
            </div>
          ))
        ) : (
          <div className='opportunities-empty'>No response entries match your current search.</div>
        )}
      </div>
    </section>
  );
}
