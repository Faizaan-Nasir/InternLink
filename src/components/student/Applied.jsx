import { useState, useEffect } from 'react';
import Job from './Job';
import SearchBar from '../SearchBar';

function getStipendValue(stipend) {
  if (typeof stipend === 'number') {
    return stipend;
  }

  return Number(String(stipend).replace(/[^\d]/g, ''));
}

export default function Applied({ supabase }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedJobs, setAppliedJobs] = useState([]);

  useEffect(() => {
    supabase.from('Applications').select('applied_time,Internships(role,stipend,duration,deadline,min_cgpa,min_year,Companies(name,location),Internship_Skills(Skills(name)))').then(({ data, error }) => {
      if (error) {
        console.error('Error fetching applied jobs:', error);
      } else {
        const formattedJobs = data.map((application) => ({
          title: application.Internships.role,
          company: application.Internships.Companies.name,
          skills: application.Internships.Internship_Skills.map((skill) => skill.Skills.name),
          stipend: application.Internships.stipend,
          location: application.Internships.Companies.location,
          duration: `${application.Internships.duration} months`,
          appliedOn: application.applied_time,
          minCgpa: application.Internships.min_cgpa,
          minEligibility: `Year ${application.Internships.min_year}`,
          status: 'applied',
        }));
        setAppliedJobs(formattedJobs);
      }
    });
  }, [supabase]);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const salaryMatch = normalizedQuery.match(/\d[\d,]*/);
  const minSalary = salaryMatch ? Number(salaryMatch[0].replace(/,/g, '')) : null;
  const textTokens = normalizedQuery
    .replace(/\d[\d,]*/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  const filteredJobs = appliedJobs.filter((job) => {
    const searchableText = `${job.title} ${job.company} ${job.location}`.toLowerCase();
    const matchesText = textTokens.every((token) => searchableText.includes(token));
    const matchesSalary = minSalary === null || getStipendValue(job.stipend) >= minSalary;

    return matchesText && matchesSalary;
  });

  return (
    <section className='opportunities-page applied-page'>
      <div className='opportunities-toolbar'>
        <div className='opportunities-summary'>Total Applied Jobs: {filteredJobs.length}</div>

        <SearchBar
          id='applied-search'
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder='smart search'
        />
      </div>

      <hr className='opportunities-divider opportunities-divider-top' />

      <div className='opportunities-list' role='list' aria-label='Applied jobs'>
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job, index) => (
            <div className='opportunity-row' key={`${job.title}-${job.company}`}>
              <Job {...job} />
              {index < filteredJobs.length - 1 ? <hr className='opportunities-divider' /> : null}
            </div>
          ))
        ) : (
          <div className='opportunities-empty'>No applied jobs match your current search.</div>
        )}
      </div>
    </section>
  );
}
