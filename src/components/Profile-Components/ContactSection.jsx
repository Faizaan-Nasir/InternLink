export default function ContactSection({ student }) {
  return (
    <section className='section-card'>
      <h2 className='section-title'>Contact</h2>

      <div className='info-row'>
        <span className='info-label'>Phone</span>
        <span className='info-value'>{student.phone}</span>
      </div>
      <div className='info-row'>
        <span className='info-label'>Email</span>
        <span className='info-value'>{student.email}</span>
      </div>
    </section>
  );
}
