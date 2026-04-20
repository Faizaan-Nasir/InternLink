import { recentApplications } from "./universityData";

export default function UniversityApplications() {
  return (
    <div className="university-page">
      <div className="university-page-header">
        <div>
          <h1>Applications</h1>
          <p>Track all student internship applications.</p>
        </div>
      </div>

      <div className="university-panel">
        <div className="university-table-wrap">
          <table className="university-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Student</th>
                <th>Company</th>
                <th>Role</th>
                <th>Status</th>
                <th>Applied</th>
              </tr>
            </thead>
            <tbody>
              {recentApplications.map((app) => (
                <tr key={app.id}>
                  <td>{app.id}</td>
                  <td>{app.studentName}</td>
                  <td>{app.company}</td>
                  <td>{app.role}</td>
                  <td>{app.status}</td>
                  <td>{app.appliedAgo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
