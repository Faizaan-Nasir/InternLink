function formatStipend(stipend) {
  const value = typeof stipend === 'number' ? stipend : Number(String(stipend).replace(/[^\d.]/g, ''));

  if (Number.isNaN(value)) {
    return stipend;
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCgpa(minCgpa) {
  const value = typeof minCgpa === 'number' ? minCgpa : Number(minCgpa);

  if (Number.isNaN(value)) {
    return minCgpa;
  }

  return value.toFixed(2);
}

function formatDeadline(applyBefore) {
  const date = new Date(applyBefore);

  if (Number.isNaN(date.getTime())) {
    return applyBefore;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function isResponseStatus(status) {
  return status === 'Accepted' || status === 'Rejected' || status === 'Waitlist';
}

export default function Job({
  title,
  company,
  skills = [],
  stipend,
  location,
  duration,
  applyBefore,
  minCgpa,
  minEligibility,
  status = 'opportunity',
}) {
  const showResponseStatus = isResponseStatus(status);

  return (
    <article className='job'>
      <div className='job-header'>
        <h2 className='job-title'>{title}</h2>
        <div className='job-company'>{company}</div>
      </div>

      <div className='job-meta-row'>
        <div className='job-skills'>
          {skills.map((skill) => (
            <span className='job-skill' key={skill}>
              {skill}
            </span>
          ))}
        </div>

        {showResponseStatus ? (
          <span className={`job-status-pill job-status-${status.toLowerCase()}`}>{status}</span>
        ) : status !== 'applied' ? (
          <button className='job-apply-button' type='button'>
            apply
          </button>
        ) : null}
      </div>

      <div className='job-details'>
        <div className='job-detail-column'>
          <p className='job-detail'>
            <span className='job-detail-label'>Stipend:</span> {formatStipend(stipend)}
          </p>
          <p className='job-detail'>
            <span className='job-detail-label'>Location:</span> {location}
          </p>
        </div>

        <div className='job-detail-column'>
          <p className='job-detail'>
            <span className='job-detail-label'>Duration:</span> {duration}
          </p>
          <p className='job-detail'>
            <span className='job-detail-label'>Apply Before:</span> {formatDeadline(applyBefore)}
          </p>
        </div>

        <div className='job-detail-column'>
          <p className='job-detail'>
            <span className='job-detail-label'>Minimum CGPA:</span> {formatCgpa(minCgpa)}
          </p>
          <p className='job-detail'>
            <span className='job-detail-label'>Minimum Eligibility:</span> {minEligibility}
          </p>
        </div>
      </div>
    </article>
  );
}
