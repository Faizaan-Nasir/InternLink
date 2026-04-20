export default function UniversityAnalytics({ analyticsData }) {
  return (
    <div className="opportunities-page university-page university-overview-page university-analytics-page">
      <div className="opportunities-list university-scroll-list university-overview-scroll university-analytics-scroll">
        <div className="university-stat-grid">
          <div className="section-card university-stat-card">
            <p className="university-stat-label">Placement Rate</p>
            <h2 className="university-stat-value">{analyticsData.placementRate}%</h2>
          </div>
          <div className="section-card university-stat-card">
            <p className="university-stat-label">Resume Coverage</p>
            <h2 className="university-stat-value">{analyticsData.resumeCoverage}%</h2>
          </div>
          <div className="section-card university-stat-card">
            <p className="university-stat-label">Profile Completion</p>
            <h2 className="university-stat-value">
              {analyticsData.eligibleProfileCompletion}%
            </h2>
          </div>
          <div className="section-card university-stat-card">
            <p className="university-stat-label">Avg Applications / Student</p>
            <h2 className="university-stat-value">
              {analyticsData.avgApplicationsPerStudent}
            </h2>
          </div>
        </div>

        <div className="university-analytics-grid">
          <div className="section-card university-section-card">
            <h3 className="section-title">Applications by Branch</h3>
            <MetricBars data={analyticsData.branchApplications} />
          </div>

          <div className="section-card university-section-card">
            <h3 className="section-title">Status Breakdown</h3>
            <MetricBars data={analyticsData.statusBreakdown} />
          </div>

          <div className="section-card university-section-card">
            <h3 className="section-title">Most Common Skills</h3>
            <MetricBars data={analyticsData.topSkills} />
          </div>

          <div className="section-card university-section-card">
            <h3 className="section-title">CGPA Distribution</h3>
            <MetricBars data={analyticsData.cgpaBands} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricBars({ data }) {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="university-metric-list">
      {data.map((item) => (
        <div key={item.label} className="university-metric-row">
          <div className="university-metric-top">
            <span className="university-metric-label">{item.label}</span>
            <span className="university-metric-value">{item.value}</span>
          </div>
          <div className="university-metric-track">
            <div
              className="university-metric-fill"
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
