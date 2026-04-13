export default function UniversityOverview({
  universityInfo,
  overviewStats,
  onAddStudent,
  onImportCsv,
}) {
  return (
    <div className="opportunities-page university-page university-overview-page">
      <div className="opportunities-list university-scroll-list university-overview-scroll">
        <div className="university-static-page-inner">
          <div className="university-page-description-bar">
            <p className="university-page-description">
              Central overview of student records, internship participation, and placement readiness.
            </p>

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
          </div>

          <div
            className="section-card university-hero-banner"
            style={{ backgroundImage: `url(${universityInfo.image})` }}
          >
            <div className="university-hero-overlay" />

            <div className="university-hero-banner-content">
              <p className="university-hero-kicker">{universityInfo.subtitle}</p>
              <h2 className="university-hero-title">{universityInfo.name}</h2>
              <p className="university-hero-description">
                {universityInfo.description}
              </p>
            </div>
          </div>

          <div className="university-stat-grid university-stat-grid-tight">
            {overviewStats.map((stat) => (
              <div key={stat.title} className="section-card university-stat-card">
                <p className="university-stat-label">{stat.title}</p>
                <h2 className="university-stat-value">{stat.value}</h2>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}