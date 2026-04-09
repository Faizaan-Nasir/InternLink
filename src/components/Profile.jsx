import { useState } from 'react';
import AcademicDetailsSection from './Profile-Components/AcademicDetailsSection';
import ContactSection from './Profile-Components/ContactSection';
import ResumeSection from './Profile-Components/ResumeSection';
import SkillsSection from './Profile-Components/SkillsSection';

const SAMPLE_STUDENT = {
  name: 'Aarav Sharma',
  email: 'aarav.sharma@iitm.ac.in',
  university: 'IIT Madras',
  branch: 'Computer Science and Engineering',
  year: '3',
  cgpa: '8.64',
  phone: '+91 98765 43210',
  resume: {
    fileName: 'Aarav_Sharma_Resume.pdf',
    url: '#',
  },
  skills: ['Python', 'React', 'Data Structures'],
};

const AVAILABLE_SKILLS = [
  'Python',
  'Java',
  'C++',
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'SQL',
  'Data Structures',
  'Machine Learning',
  'Cloud Computing',
  'Cyber Security',
];

export default function Profile() {
  const [pendingResumeName, setPendingResumeName] = useState('');
  const [resumeName, setResumeName] = useState(SAMPLE_STUDENT.resume.fileName);
  const [studentSkills, setStudentSkills] = useState(SAMPLE_STUDENT.skills);
  const [nextSkill, setNextSkill] = useState('');

  const addSkill = () => {
    if (!nextSkill || studentSkills.includes(nextSkill)) {
      return;
    }
    setStudentSkills([...studentSkills, nextSkill]);
    setNextSkill('');
  };

  const removeSkill = (skillToRemove) => {
    setStudentSkills(studentSkills.filter((skill) => skill !== skillToRemove));
  };

  const uploadPendingResume = () => {
    if (pendingResumeName) {
      setResumeName(pendingResumeName);
      setPendingResumeName('');
    }
  };

  return (
    <>
      <section className='profile-page'>
        <div className='profile-wrapper'>
          <div className='profile-header'>
            <h1 className='profile-name'>{SAMPLE_STUDENT.name}</h1>
            <p className='profile-subtext'>
              {SAMPLE_STUDENT.branch} • {SAMPLE_STUDENT.university}
            </p>
          </div>

          <div className='profile-content'>
            <div className='left-column'>
              <AcademicDetailsSection student={SAMPLE_STUDENT} />
              <ResumeSection
                onUploadResume={uploadPendingResume}
                pendingResumeName={pendingResumeName}
                resumeName={resumeName}
                resumeUrl={SAMPLE_STUDENT.resume.url}
                setPendingResumeName={setPendingResumeName}
              />
            </div>

            <div className='right-column'>
              <ContactSection student={SAMPLE_STUDENT} />
              <SkillsSection
                availableSkills={AVAILABLE_SKILLS}
                nextSkill={nextSkill}
                onAddSkill={addSkill}
                onRemoveSkill={removeSkill}
                setNextSkill={setNextSkill}
                studentSkills={studentSkills}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
