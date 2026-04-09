export default function AcademicDetailsSection({ student }) {
  return (
    <section className='section-card'>
      <h2 className='section-title'>Academic Details</h2>

      <div className='info-row'>
        <span className='info-label'>Year</span>
        <span className='info-value'>{student.year}</span>
      </div>
      <div className='info-row'>
        <span className='info-label'>CGPA</span>
        <span className='info-value'>{student.cgpa}</span>
      </div>
      <div className='info-row'>
        <span className='info-label'>Branch</span>
        <span className='info-value'>{student.branch}</span>
      </div>
      <div className='info-row'>
        <span className='info-label'>University</span>
        <span className='info-value'>{student.university}</span>
      </div>
    </section>
  );
}
