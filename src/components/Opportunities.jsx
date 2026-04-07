import Job from './Job';

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

export default function Opportunities() {
  return (
    <section className='opportunities-page'>
      <div className='opportunities-summary'>Total Job Postings: {sampleJobs.length}</div>
      <hr className='opportunities-divider opportunities-divider-top' />

      <div className='opportunities-list' role='list' aria-label='Job opportunities'>
        {sampleJobs.map((job, index) => (
          <div className='opportunity-row' key={`${job.title}-${job.company}`}>
            <Job {...job} />
            {index < sampleJobs.length - 1 ? <hr className='opportunities-divider' /> : null}
          </div>
        ))}
      </div>
    </section>
  );
}
