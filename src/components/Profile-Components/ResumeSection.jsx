export default function ResumeSection({
  resumeUrl,
  resumeName,
  pendingResumeName,
  setPendingResumeName,
  onUploadResume,
}) {
  return (
    <section className='section-card section-bottom-card resume-bottom-card'>
      <h2 className='section-title'>Resume</h2>

      <a className='resume-file' href={resumeUrl} target='_blank' rel='noreferrer'>
        {resumeName}
      </a>

      <form
        className='resume-inline-editor'
        onSubmit={(event) => {
          event.preventDefault();
          onUploadResume();
        }}
      >
        <div className='resume-picker-shell'>
          <input
            className='resume-hidden-input'
            id='resume-upload-input'
            type='file'
            accept='.pdf,.doc,.docx'
            onChange={(event) => {
              const pickedFile = event.target.files?.[0];
              setPendingResumeName(pickedFile ? pickedFile.name : '');
            }}
          />
          <span className='resume-picker-field'>
            <span className='resume-picker-text'>{pendingResumeName || 'no new file selected...'}</span>
          </span>
          <label className='resume-browse-btn' htmlFor='resume-upload-input'>
            browse
          </label>
        </div>

        <p className='resume-helper'>Accepted formats: PDF, DOC, DOCX</p>

        <div className='resume-inline-actions'>
          <button
            className='profile-modal-cancel'
            type='button'
            onClick={() => setPendingResumeName('')}
          >
            cancel
          </button>
          <button className='profile-modal-submit' type='submit'>
            upload
          </button>
        </div>
      </form>
    </section>
  );
}
