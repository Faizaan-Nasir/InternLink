import { useState } from 'react';
import { createPortal } from 'react-dom';

const INITIAL_FORM = {
  role: '',
  stipend: '',
  duration: '',
  apply_before: '',
  max_applications: '',
  min_cgpa: '',
  min_year: '',
  skills_required: '',
};

export default function CreateInternship({ supabase, setJobs, companyName }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalState, setModalState] = useState(null);

  const openConfirmationModal = () => {
    setModalState({ phase: 'confirm' });
  };

  const closeModal = () => {
    if (isSubmitting) {
      return;
    }
    setModalState(null);
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
  };

  const createInternship = async () => {
    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      if (!userId) {
        throw new Error('No user session found');
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('cid')
        .eq('id', userId)
        .single();

      if (profileError || !profileData?.cid) {
        throw profileError || new Error('Company ID not found for current user');
      }

      const internshipData = {
        company_id: profileData.cid,
        role: form.role,
        stipend: Number(form.stipend),
        duration: Number(form.duration),
        deadline: form.apply_before,
        max_applicants: Number(form.max_applications),
        min_cgpa: Number(form.min_cgpa),
        min_year: Number(form.min_year)
      };

      const { data: insertedRow, error: insertError } = await supabase.from('Internships').insert(internshipData).select().single();

      insertError && console.error('Internship insert error:', insertError);

      const skills = form.skills_required.split(',').map((skill) => skill.trim());
      const existingSkills = await supabase.from('Skills').select('skid,name');
      for (const skill of skills) {
        console.log(`Processing skill: ${skill}`);
        if (skill && !existingSkills.data.some((s) => s.name.toLowerCase() === skill.toLowerCase())) {
          console.log(`Inserting new skill: ${skill}`);
          const { data: newSkill, error: skillError } = await supabase.from('Skills').insert({ name: skill }).select().single();
          skillError && console.error(`Error inserting skill "${skill}":`, skillError);
          console.log(newSkill.skid)
          const { error: internshipSkillError } = await supabase.from('Internship_Skills').insert({
            skid: newSkill.skid,
            internship_id: insertedRow.id
          });
          internshipSkillError && console.error(`Error inserting internship skill:`, internshipSkillError);
        } else {
          const { error: internshipSkillError } = await supabase.from('Internship_Skills').insert({
            skid: existingSkills.data.find((s) => s.name.toLowerCase() === skill.toLowerCase()).skid,
            internship_id: insertedRow.id
          });
          internshipSkillError && console.error(`Error inserting internship skill:`, internshipSkillError);
        }
      }



      if (insertError) {
        throw insertError;
      }

      setModalState({ phase: 'success' });
      resetForm();
      const temporaryJob = {
        id: internshipData.id,
        title: internshipData.role,
        companyName: companyName,
        applicantCount: 0,
        applicants: []
      };
      setJobs((prevJobs) => [...prevJobs, temporaryJob]);
    } catch (error) {
      console.error('Error creating internship:', error);
      setModalState({
        phase: 'error',
        message: 'We could not create the job right now. Please try again in a while.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className='company-create-page'>
      <div className='company-create-scroll'>
        <form className='company-create-form' noValidate>
          <div className='company-form-section'>
            <h2 className='company-form-section-title'>Basic Info</h2>
            <div className='company-form-grid'>
              <div className='company-form-group company-form-group-full'>
                <label htmlFor='internship-role'>Role</label>
                <input
                  id='internship-role'
                  name='role'
                  placeholder='AI/ML Developer Intern'
                  type='text'
                  value={form.role}
                  onChange={(event) => setForm((previous) => ({ ...previous, role: event.target.value }))}
                />
              </div>

              <div className='company-form-group'>
                <label htmlFor='internship-stipend'>Stipend</label>
                <input
                  id='internship-stipend'
                  name='stipend'
                  placeholder='26000'
                  type='number'
                  value={form.stipend}
                  onChange={(event) => setForm((previous) => ({ ...previous, stipend: event.target.value }))}
                />
              </div>

              <div className='company-form-group'>
                <label htmlFor='internship-duration'>Duration (months)</label>
                <input
                  id='internship-duration'
                  name='duration'
                  placeholder='6'
                  type='number'
                  value={form.duration}
                  onChange={(event) => setForm((previous) => ({ ...previous, duration: event.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className='company-form-section'>
            <h2 className='company-form-section-title'>Timeline</h2>
            <div className='company-form-grid'>
              <div className='company-form-group'>
                <label htmlFor='internship-apply-before'>Apply Before</label>
                <input
                  id='internship-apply-before'
                  name='apply_before'
                  type='date'
                  value={form.apply_before}
                  onChange={(event) => setForm((previous) => ({ ...previous, apply_before: event.target.value }))}
                />
              </div>

              <div className='company-form-group'>
                <label htmlFor='internship-max-applications'>Max Applications</label>
                <input
                  id='internship-max-applications'
                  name='max_applications'
                  placeholder='500'
                  type='number'
                  value={form.max_applications}
                  onChange={(event) => setForm((previous) => ({ ...previous, max_applications: event.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className='company-form-section'>
            <h2 className='company-form-section-title'>Requirements</h2>
            <div className='company-form-grid'>
              <div className='company-form-group'>
                <label htmlFor='internship-min-cgpa'>Minimum CGPA</label>
                <input
                  id='internship-min-cgpa'
                  name='min_cgpa'
                  placeholder='8.00'
                  step='0.01'
                  type='number'
                  value={form.min_cgpa}
                  onChange={(event) => setForm((previous) => ({ ...previous, min_cgpa: event.target.value }))}
                />
              </div>

              <div className='company-form-group'>
                <label htmlFor='internship-min-year'>Minimum Year</label>
                <input
                  id='internship-min-year'
                  name='min_year'
                  placeholder='3'
                  type='number'
                  value={form.min_year}
                  onChange={(event) => setForm((previous) => ({ ...previous, min_year: event.target.value }))}
                />
              </div>

              <div className='company-form-group company-form-group-full'>
                <label htmlFor='internship-skills'>Skills Required</label>
                <textarea
                  id='internship-skills'
                  name='skills_required'
                  placeholder='Python, Cloud Computing, Machine Learning'
                  rows={3}
                  value={form.skills_required}
                  onChange={(event) => setForm((previous) => ({ ...previous, skills_required: event.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className='company-form-actions'>
            <button className='company-btn-secondary' type='button' onClick={resetForm}>Cancel</button>
            <button className='company-btn-primary' type='button' onClick={openConfirmationModal}>
              Create Job
            </button>
          </div>
        </form>
      </div>

      {modalState ? createPortal(
        <div className='company-post-overlay' role='dialog' aria-modal='true' aria-labelledby='company-post-title'>
          <div className='company-post-card'>
            {modalState.phase === 'confirm' ? (
              <>
                <h3 className='company-post-title' id='company-post-title'>Confirm Job Post</h3>
                <p className='company-post-message'>
                  Publish this internship opportunity now?
                </p>
                <div className='company-post-actions'>
                  <button className='company-post-cancel' type='button' onClick={closeModal} disabled={isSubmitting}>
                    cancel
                  </button>
                  <button className='company-post-confirm' type='button' onClick={createInternship} disabled={isSubmitting}>
                    {isSubmitting ? 'posting...' : 'confirm'}
                  </button>
                </div>
              </>
            ) : modalState.phase === 'success' ? (
              <>
                <h3 className='company-post-title' id='company-post-title'>Job Posted Successfully</h3>
                <p className='company-post-message'>Your internship opportunity has been created.</p>
                <p className='company-post-note'>The opportunity will now be visible to all students connected to the portal.</p>
                <div className='company-post-actions'>
                  <button className='company-post-confirm' type='button' onClick={closeModal}>close</button>
                </div>
              </>
            ) : (
              <>
                <h3 className='company-post-title' id='company-post-title'>Unable To Create Job</h3>
                <p className='company-post-message'>{modalState.message}</p>
                <div className='company-post-actions'>
                  <button className='company-post-confirm' type='button' onClick={closeModal}>close</button>
                </div>
              </>
            )}
          </div>
        </div>,
        document.body
      ) : null}
    </section>
  );
}
