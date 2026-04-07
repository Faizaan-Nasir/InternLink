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
}) {
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

        <button className='job-apply-button' type='button'>
          apply
        </button>
      </div>

      <div className='job-details'>
        <div className='job-detail-column'>
          <p className='job-detail'>
            <span className='job-detail-label'>Stipend:</span> {stipend}
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
            <span className='job-detail-label'>Apply Before:</span> {applyBefore}
          </p>
        </div>

        <div className='job-detail-column'>
          <p className='job-detail'>
            <span className='job-detail-label'>Minimum CGPA:</span> {minCgpa}
          </p>
          <p className='job-detail'>
            <span className='job-detail-label'>Minimum Eligibility:</span> {minEligibility}
          </p>
        </div>
      </div>
    </article>
  );
}
