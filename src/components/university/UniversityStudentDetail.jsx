import { students } from "./universityData";

export default function UniversityStudentDetail() {
  const student = students[0];
  const appliedCompanies = student?.applications.map((application) => application.company) ?? [];

  if (!student) {
    return null;
  }

  return (
    <div className="university-page-content">
      <div className="university-toolbar">
        <p className="university-summary">
          Detailed profile view for a single student
        </p>
      </div>

      <hr className="university-divider university-divider-top" />

      <div className="university-scroll-area">
        <div className="university-profile-grid">
          <div className="university-panel">
            <h3 className="university-panel-title">Basic Information</h3>

            <div className="university-info-stack">
              <div className="university-info-row">
                <span className="university-info-label">Name</span>
                <span className="university-info-value">{student.name}</span>
              </div>
              <div className="university-info-row">
                <span className="university-info-label">RNO</span>
                <span className="university-info-value">{student.rno}</span>
              </div>
              <div className="university-info-row">
                <span className="university-info-label">Branch</span>
                <span className="university-info-value">{student.branch}</span>
              </div>
              <div className="university-info-row">
                <span className="university-info-label">Year</span>
                <span className="university-info-value">{student.year}</span>
              </div>
              <div className="university-info-row">
                <span className="university-info-label">CGPA</span>
                <span className="university-info-value">{student.cgpa}</span>
              </div>
              <div className="university-info-row">
                <span className="university-info-label">Email</span>
                <span className="university-info-value">{student.email}</span>
              </div>
              <div className="university-info-row">
                <span className="university-info-label">Phone</span>
                <span className="university-info-value">{student.phone}</span>
              </div>
              <div className="university-info-row">
                <span className="university-info-label">University</span>
                <span className="university-info-value">{student.university}</span>
              </div>
            </div>
          </div>

          <div className="university-panel">
            <h3 className="university-panel-title">Skills</h3>
            <div className="university-tag-wrap">
              {student.skills.map((skill) => (
                <span key={skill} className="university-tag">
                  {skill}
                </span>
              ))}
            </div>

            <h3 className="university-panel-subtitle">Resume</h3>
            <p className="university-note">
              {student.resumeUploaded ? "Resume uploaded" : "No resume uploaded"}
            </p>

            <h3 className="university-panel-subtitle">Applied Companies</h3>
            <ul className="university-list">
              {appliedCompanies.map((company) => (
                <li key={company}>{company}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
