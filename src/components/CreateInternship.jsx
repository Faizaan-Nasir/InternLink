import { useState } from 'react';
export default function CreateInternship({ supabase }) {
  const [userID, setUserID] = useState(null);
  const [companyID, setCompanyID] = useState(null);
  function handleCreateJob() {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserID(session.user.id);
        console.log('User ID:', session.user.id);
        supabase.from('profiles').select('cid').eq('id', session.user.id).single().then(({ data }) => {
          setCompanyID(data.cid);
          console.log('Company ID:', data.cid);
          const studentData = {
            company_id: companyID,
            role: document.getElementById('internship-role').value,
            stipend: parseFloat(document.getElementById('internship-stipend').value),
            duration: parseInt(document.getElementById('internship-duration').value, 10),
            deadline: document.getElementById('internship-apply-before').value,
            max_applicants: parseInt(document.getElementById('internship-max-applications').value, 10),
            min_cgpa: parseFloat(document.getElementById('internship-min-cgpa').value),
            min_year: parseInt(document.getElementById('internship-min-year').value, 10)
            // skills_required: document.getElementById('internship-skills').value.split(',').map(skill => skill.trim())
          }
          supabase.from('Internships').insert(studentData).then(({ data, error }) => {
            if (error) {
              console.error('Error creating internship:', error);
            } else {
              console.log('Internship created successfully:', data);
            }
          });
        });
      } else {
        console.error('No user session found');
      }
    }).catch((error) => {
      console.error('Error fetching user session:', error);
    });
  }
  return (
    <section className='company-create-page'>
      <div className='company-create-scroll'>
        <form className='company-create-form' noValidate>
          <div className='company-form-section'>
            <h2 className='company-form-section-title'>Basic Info</h2>
            <div className='company-form-grid'>
              <div className='company-form-group company-form-group-full'>
                <label htmlFor='internship-role'>Role</label>
                <input id='internship-role' name='role' placeholder='AI/ML Developer Intern' type='text' />
              </div>

              <div className='company-form-group'>
                <label htmlFor='internship-stipend'>Stipend</label>
                <input id='internship-stipend' name='stipend' placeholder='26000' type='number' />
              </div>

              <div className='company-form-group'>
                <label htmlFor='internship-duration'>Duration (months)</label>
                <input id='internship-duration' name='duration' placeholder='6' type='number' />
              </div>
            </div>
          </div>

          <div className='company-form-section'>
            <h2 className='company-form-section-title'>Timeline</h2>
            <div className='company-form-grid'>
              <div className='company-form-group'>
                <label htmlFor='internship-apply-before'>Apply Before</label>
                <input id='internship-apply-before' name='apply_before' type='date' />
              </div>

              <div className='company-form-group'>
                <label htmlFor='internship-max-applications'>Max Applications</label>
                <input id='internship-max-applications' name='max_applications' placeholder='500' type='number' />
              </div>
            </div>
          </div>

          <div className='company-form-section'>
            <h2 className='company-form-section-title'>Requirements</h2>
            <div className='company-form-grid'>
              <div className='company-form-group'>
                <label htmlFor='internship-min-cgpa'>Minimum CGPA</label>
                <input id='internship-min-cgpa' name='min_cgpa' placeholder='8.00' step='0.01' type='number' />
              </div>

              <div className='company-form-group'>
                <label htmlFor='internship-min-year'>Minimum Year</label>
                <input id='internship-min-year' name='min_year' placeholder='3' type='number' />
              </div>

              <div className='company-form-group company-form-group-full'>
                <label htmlFor='internship-skills'>Skills Required</label>
                <textarea
                  id='internship-skills'
                  name='skills_required'
                  placeholder='Python, Cloud Computing, Machine Learning'
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className='company-form-actions'>
            <button className='company-btn-secondary' type='button'>Cancel</button>
            <button className='company-btn-primary' type='button' onClick={() => handleCreateJob()}>Create Job</button>
          </div>
        </form>
      </div>
    </section>
  );
}
