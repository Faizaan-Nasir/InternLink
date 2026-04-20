import { useEffect, useState } from 'react';
import Job from './Job';
import SearchBar from '../SearchBar';

function getStipendValue(stipend) {
  if (typeof stipend === 'number') {
    return stipend;
  }

  return Number(String(stipend).replace(/[^\d]/g, ''));
}

export default function Responses({ supabase }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [responses, setResponses] = useState([]);

  useEffect(() => {
    const getResponses = async () => {
      const { data, error } = await supabase.from('Internships').select('id,role,stipend,duration,deadline,min_cgpa,min_year,Companies(name,location),Internship_Skills(Skills(name)),Responses(decision)');
      if (error) {
        console.error('Error fetching responses:', error);
      } else {
        const formattedResponses = data.map((response) => (response.Responses?.[0]?.decision ? response : null)).filter(Boolean).map((response) => ({
          title: response.role,
          company: response.Companies.name,
          skills: response.Internship_Skills.map((skill) => skill.Skills.name),
          stipend: response.stipend,
          location: response.Companies.location,
          duration: `${response.duration} months`,
          applyBefore: response.deadline,
          minCgpa: response.min_cgpa,
          minEligibility: `Year ${response.min_year}`,
          status: response.Responses?.[0]?.decision
        }));
        setResponses(formattedResponses);
      }
    };
    getResponses();
  }, [supabase]);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const salaryMatch = normalizedQuery.match(/\d[\d,]*/);
  const minSalary = salaryMatch ? Number(salaryMatch[0].replace(/,/g, '')) : null;
  const textTokens = normalizedQuery
    .replace(/\d[\d,]*/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  const filteredJobs = responses.filter((job) => {
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
