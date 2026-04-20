function formatIndianPhone(phoneValue) {
  const digits = String(phoneValue ?? '').replace(/\D/g, '');
  let localNumber = digits;

  if (localNumber.length > 10) {
    if (localNumber.startsWith('91') && localNumber.length >= 12) {
      localNumber = localNumber.slice(-10);
    } else {
      localNumber = localNumber.slice(-10);
    }
  }

  if (localNumber.length !== 10) {
    return '+91 XXXXX XXXXX';
  }

  return `+91 ${localNumber.slice(0, 5)} ${localNumber.slice(5)}`;
}

export default function ContactSection({ student }) {
  return (
    <section className='section-card'>
      <h2 className='section-title'>Contact</h2>

      <div className='info-row'>
        <span className='info-label'>Phone</span>
        <span className='info-value'>{formatIndianPhone(student.phone)}</span>
      </div>
      <div className='info-row'>
        <span className='info-label'>Email</span>
        <span className='info-value'>{student.email}</span>
      </div>
    </section>
  );
}
