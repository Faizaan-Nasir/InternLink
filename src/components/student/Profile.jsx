import { useState, useEffect } from 'react';
import AcademicDetailsSection from './Profile-Components/AcademicDetailsSection';
import ContactSection from './Profile-Components/ContactSection';
import ResumeSection from './Profile-Components/ResumeSection';
import SkillsSection from './Profile-Components/SkillsSection';

const SAMPLE_STUDENT = {
  name: 'Loading...',
  email: 'Loading...',
  university: 'Loading...',
  branch: 'Loading...',
  year: 'Loading...',
  cgpa: 'Loading...',
  phone: 'Loading...',
  resume: {
    fileName: 'Aarav_Sharma_Resume.pdf',
    url: '#',
  },
  skills: ['Python', 'React', 'Data Structures'],
  rno: 0
};

export default function Profile({ supabase }) {
  const [pendingResumeName, setPendingResumeName] = useState('');
  const [resumeName, setResumeName] = useState(SAMPLE_STUDENT.resume.fileName);
  const [studentSkills, setStudentSkills] = useState([]);
  const [nextSkill, setNextSkill] = useState('');
  const [student, setStudent] = useState(SAMPLE_STUDENT);
  const [AVAILABLE_SKILLS, setAVAILABLE_SKILLS] = useState([
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
  ]);

  useEffect(() => {
    const getAvailableSkills = async () => {
      const { data, error } = await supabase.from('Skills').select('name');
      if (error) {
        console.error('Error fetching available skills:', error);
      } else {
        setAVAILABLE_SKILLS(data.map((item) => item.name));
      }
    };
    const fetchStudentData = async () => {
      const { data, error } = await supabase.from('Students').select('*').single();
      if (error) {
        console.error('Error fetching student data:', error);
      } else {
        data.email = await supabase.auth.getUser().then(({ data }) => data?.user?.email) || null;
        data.phone = data.ph;
        data.resume = {
          fileName: 'Faizaan_Nasir_Resume.pdf',
          url: '#',
        };
        setResumeName('Faizaan_Nasir_Resume.pdf');
        data.skills = await supabase.from('Student_Skills').select('Skills(name)').then(({ data }) => data.map((item) => item.Skills.name)) || [];
        setStudentSkills(data.skills);
        setStudent(data);
      }
    };
    getAvailableSkills();
    fetchStudentData();
  }, [supabase]);


  const addSkill = async () => {
    if (!nextSkill || studentSkills.includes(nextSkill)) {
      return;
    }
    const { data: skillData, error: skillError } = await supabase.from('Skills').select('skid,name').eq('name', nextSkill).single();
    if (skillError) {
      console.error('Error fetching skill data:', skillError);
      return;
    }
    const { error: insertError } = await supabase.from('Student_Skills').insert({ sid: student.rno, skid: skillData.skid });
    if (insertError) {
      console.error('Error inserting student skill:', insertError);
    } else {
      setStudentSkills([...studentSkills, nextSkill]);
      setNextSkill('');
    }
  };

  const removeSkill = async (skillToRemove) => {
    const { data: skillData, error: skillError } = await supabase.from('Skills').select('skid,name').eq('name', skillToRemove).single();
    if (skillError) {
      console.error('Error fetching skill data:', skillError);
      return;
    }
    const { error: deleteError } = await supabase.from('Student_Skills').delete().eq('sid', student.rno).eq('skid', skillData.skid);
    if (deleteError) {
      console.error('Error deleting student skill:', deleteError);
    }
    else {
      setStudentSkills(studentSkills.filter((skill) => skill !== skillToRemove));
    }
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
        <div className='profile-scroll'>
          <div className='profile-wrapper'>
            <div className='profile-header'>
              <h1 className='profile-name'>{student.name}</h1>
              <p className='profile-subtext'>
                {student.branch} • {student.university}
              </p>
            </div>

            <div className='profile-content'>
              <div className='left-column'>
                <AcademicDetailsSection student={student} />
                <ResumeSection
                  onUploadResume={uploadPendingResume}
                  pendingResumeName={pendingResumeName}
                  resumeName={resumeName}
                  resumeUrl={student.resume.url}
                  setPendingResumeName={setPendingResumeName}
                />
              </div>

              <div className='right-column'>
                <ContactSection student={student} />
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
        </div>
      </section>
    </>
  );
}
