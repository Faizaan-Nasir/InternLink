import { useEffect, useMemo, useState } from "react";
import SearchBar from "./SearchBar";

export default function UniversityStudents({
  students,
  onAddStudent,
  onEditStudent,
  onImportCsv,
}) {
  const [search, setSearch] = useState("");
  const [applicationFilter, setApplicationFilter] = useState("All");
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id ?? null);
  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return students;

    return students.filter((student) => {
      return (
        student.name.toLowerCase().includes(query) ||
        student.branch.toLowerCase().includes(query) ||
        String(student.rno).includes(query) ||
        student.skills.some((skill) => skill.toLowerCase().includes(query))
      );
    });
  }, [students, search]);

  useEffect(() => {
    if (!filteredStudents.length) {
      setSelectedStudentId(null);
      return;
    }

    const stillExists = filteredStudents.some(
      (student) => student.id === selectedStudentId
    );

    if (!stillExists) {
      setSelectedStudentId(filteredStudents[0].id);
    }
  }, [filteredStudents, selectedStudentId]);

  const selectedStudent =
    filteredStudents.find((student) => student.id === selectedStudentId) ||
    students.find((student) => student.id === selectedStudentId) ||
    filteredStudents[0] ||
    null;

  const selectedApplications = useMemo(() => {
    if (!selectedStudent) return [];

    if (applicationFilter === "All") return selectedStudent.applications;

    return selectedStudent.applications.filter(
      (application) => application.status === applicationFilter
    );
  }, [selectedStudent, applicationFilter]);

  return (
    <div className="company-applicants-page university-students-page">
      <div className="company-applicants-top university-topbar university-topbar-students">
        <div className="university-page-actions">
          <button
            type="button"
            className="primary-btn university-action-btn"
            onClick={onAddStudent}
          >
            Add Student
          </button>

          <button
            type="button"
            className="login-secondary university-secondary-btn"
            onClick={onImportCsv}
          >
            Import CSV
          </button>
        </div>

        <SearchBar
          id="university-student-search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="search by name, roll no, branch, or skill"
          className="opportunities-search university-shared-search"
        />
      </div>

      <div className="company-applicants-layout university-students-layout">
        <div className="jobs-panel university-surface-default">
          <div className="university-panel-header">
            <h3 className="university-panel-heading">
              Students ({filteredStudents.length})
            </h3>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="panel-empty">No students match your search</div>
          ) : (
            filteredStudents.map((student) => (
              <button
                key={student.id}
                type="button"
                className={`panel-row applicants-row ${selectedStudent?.id === student.id ? "panel-row-selected" : ""
                  }`}
                onClick={() => setSelectedStudentId(student.id)}
              >
                <span className="applicants-row-name">{student.name}</span>
                <span className="applicants-row-meta">
                  {student.branch} • Year {student.year} • CGPA {student.cgpa}
                </span>
                <span className="university-mini-meta">
                  RNO {student.rno} • {student.resumeUploaded ? "Resume" : "No Resume"}
                </span>
              </button>
            ))
          )}
        </div>

        <div className="details-panel university-surface-default">
          {!selectedStudent ? (
            <div className="panel-empty">Select a student to view details</div>
          ) : (
            <div className="details-content">
              <div className="details-scroll">
                <div className="university-details-top">
                  <div>
                    <h3 className="details-name">{selectedStudent.name}</h3>
                    <p className="details-subtext">
                      {selectedStudent.branch} • Year {selectedStudent.year}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="primary-btn university-edit-btn"
                    onClick={() => onEditStudent(selectedStudent)}
                  >
                    Edit Info
                  </button>
                </div>

                <div className="details-row">
                  <span className="details-label">Roll Number</span>
                  <span className="details-value">{selectedStudent.rno}</span>
                </div>

                <div className="details-row">
                  <span className="details-label">CGPA</span>
                  <span className="details-value">{selectedStudent.cgpa}</span>
                </div>

                <div className="details-row">
                  <span className="details-label">Email</span>
                  <span className="details-value">{selectedStudent.email}</span>
                </div>

                <div className="details-row">
                  <span className="details-label">Phone</span>
                  <span className="details-value">
                    {selectedStudent.phone || "—"}
                  </span>
                </div>

                <div className="details-row">
                  <span className="details-label">Resume</span>
                  <span className="details-value">
                    {selectedStudent.resumeUploaded
                      ? selectedStudent.resumeName
                      : "Not uploaded"}
                  </span>
                </div>

                <div className="details-row university-details-block">
                  <span className="details-label">Skills</span>
                  <span className="details-value university-skills-wrap">
                    {selectedStudent.skills.map((skill) => (
                      <span key={skill} className="skills-pill">
                        {skill}
                      </span>
                    ))}
                  </span>
                </div>

                <div className="university-student-quickstats">
                  <div className="university-quickstat-card">
                    <span className="university-quickstat-label">Applications</span>
                    <strong>{selectedStudent.applications.length}</strong>
                  </div>
                  <div className="university-quickstat-card">
                    <span className="university-quickstat-label">Selected</span>
                    <strong>
                      {
                        selectedStudent.applications.filter(
                          (application) => application.status === "Selected"
                        ).length
                      }
                    </strong>
                  </div>
                  <div className="university-quickstat-card">
                    <span className="university-quickstat-label">Resume</span>
                    <strong>{selectedStudent.resumeUploaded ? "Yes" : "No"}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="applicants-panel university-surface-default">
          <div className="university-panel-header university-panel-header-split">
            <h3 className="university-panel-heading">
              {selectedStudent ? `${selectedStudent.name}'s Applications` : "Applications"}
            </h3>

            <select
              className="university-filter-select"
              value={applicationFilter}
              onChange={(e) => setApplicationFilter(e.target.value)}
            >
              <option>All</option>
              <option>Applied</option>
              <option>Accepted</option>
              <option>Waitlist</option>
              <option>Rejected</option>
            </select>
          </div>

          {!selectedStudent ? (
            <div className="panel-empty">Select a student to view applications</div>
          ) : selectedApplications.length === 0 ? (
            <div className="panel-empty">No applications for this filter</div>
          ) : (
            selectedApplications.map((application) => (
              <div key={application.id} className="panel-row applicants-row university-app-row">
                <span className="applicants-row-name">{application.company}</span>
                <span className="applicants-row-meta">
                  {application.role} • {application.appliedAgo}
                </span>
                <div className="university-inline-status">
                  <span
                    className={`job-status-pill university-small-pill ${getStatusClass(
                      application.status
                    )}`}
                  >
                    {application.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function getStatusClass(status) {
  const normalized = status.toLowerCase();

  if (normalized === "accepted") return "job-status-accepted";
  if (normalized === "rejected") return "job-status-rejected";
  if (normalized === "waitlist") return "job-status-waitlist";
  return "job-status-waitlist";
}
