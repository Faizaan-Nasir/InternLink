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

function formatLongDate(dateValue) {
  if (!dateValue) {
    return '';
  }

  const normalizedDateValue = typeof dateValue === 'string'
    ? dateValue.replace(' ', 'T')
    : dateValue;
  const date = new Date(normalizedDateValue);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
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

async function handleApply(supabase, jobId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { status: 'error' };
  }

  const rno = await supabase
    .from('profiles')
    .select('sid')
    .eq('id', user.id)
    .single()
    .then(({ data }) => data?.sid);

  if (!rno) {
    return { status: 'error' };
  }

  const universityId = await supabase
    .from('Students')
    .select('university_id')
    .eq('rno', rno)
    .single()
    .then(({ data }) => data?.university_id);

  if (!universityId) {
    return { status: 'error' };
  }

  const { data: response, error: responseError } = await supabase.from('Applications').select('*').eq('student_id', rno).eq('internship_id', jobId).maybeSingle();
  if (responseError) {
    console.error('Error fetching application data:', responseError);
    return { status: 'error' };
  }
  if (response) {
    console.warn('Already applied for this job');
    return { status: 'already_applied' };
  }

  const { data, error } = await supabase.from('Applications').insert({
    student_id: rno,
    internship_id: jobId,
    university_id: universityId
  });

  if (error) {
    console.error('Error applying for job:', error);
    if (error.code === '42501') {
      return { status: 'blacklisted' };
    }
    return { status: 'error' };
  } else {
    console.log('Successfully applied for job:', data);
    return { status: 'applied' };
  }
}

export default function Job({
  supabase,
  jobId,
  title,
  company,
  skills = [],
  stipend,
  location,
  duration,
  applyBefore,
  appliedOn,
  minCgpa,
  minEligibility,
  status = 'opportunity',
  onApplyIntent = null,
  isAlreadyApplied = false,
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
          <button
            className={`job-apply-button${isAlreadyApplied ? ' job-apply-button-disabled' : ''}`}
            type='button'
            disabled={isAlreadyApplied}
            onClick={() => {
              const runApplyQuery = () => handleApply(supabase, jobId);
              if (onApplyIntent) {
                onApplyIntent({
                  jobId,
                  title,
                  company,
                  runApplyQuery,
                });
                return;
              }

              runApplyQuery();
            }}
          >
            {isAlreadyApplied ? 'applied' : 'apply'}
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
            <span className='job-detail-label'>{status === 'applied' ? 'Applied On:' : 'Apply Before:'}</span>{' '}
            {formatLongDate(status === 'applied' ? appliedOn : applyBefore)}
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
