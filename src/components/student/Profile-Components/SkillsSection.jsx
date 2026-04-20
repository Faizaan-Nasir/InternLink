export default function SkillsSection({
  studentSkills,
  nextSkill,
  setNextSkill,
  availableSkills,
  onAddSkill,
  onRemoveSkill,
}) {
  return (
    <section className='section-card section-bottom-card'>
      <h2 className='section-title'>Skills</h2>

      {studentSkills.length ? (
        <div className='skills-list'>
          {studentSkills.map((skill) => (
            <span className='skills-pill' key={skill}>
              {skill}
              <button
                aria-label={`Remove ${skill}`}
                className='skills-pill-remove'
                onClick={() => onRemoveSkill(skill)}
                type='button'
              >
                ×
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className='skills-empty'>No skills added yet.</p>
      )}

      <div className='skills-controls'>
        <select
          className='skills-select'
          onChange={(event) => setNextSkill(event.target.value)}
          value={nextSkill}
        >
          <option value=''>Select a skill</option>
          {availableSkills.map((skill) => (
            <option disabled={studentSkills.includes(skill)} key={skill} value={skill}>
              {skill}
            </option>
          ))}
        </select>
        <button className='primary-btn skills-add-btn' onClick={onAddSkill} type='button'>
          Add Skill
        </button>
      </div>

      <p className='skills-helper'>Skill selection is limited to the approved list.</p>
    </section>
  );
}
