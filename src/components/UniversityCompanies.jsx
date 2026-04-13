import { useMemo, useState } from "react";
import SearchBar from "./SearchBar";

export default function UniversityCompanies({ companies }) {
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("All");

  const sectors = ["All", ...new Set(companies.map((company) => company.sector))];

  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      const matchesSearch =
        company.name.toLowerCase().includes(search.toLowerCase()) ||
        company.location.toLowerCase().includes(search.toLowerCase());

      const matchesSector =
        sectorFilter === "All" || company.sector === sectorFilter;

      return matchesSearch && matchesSector;
    });
  }, [companies, search, sectorFilter]);

  return (
    <div className="opportunities-page university-page university-overview-page university-companies-page">
      <div className="opportunities-toolbar university-toolbar-split">
        <select
          className="university-filter-select university-company-filter"
          value={sectorFilter}
          onChange={(e) => setSectorFilter(e.target.value)}
        >
          {sectors.map((sector) => (
            <option key={sector}>{sector}</option>
          ))}
        </select>

        <SearchBar
          id="university-company-search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="search company or location"
          className="opportunities-search university-shared-search university-compact-search"
        />
      </div>

      <div className="opportunities-list university-scroll-list university-overview-scroll university-companies-scroll">
        <div className="university-company-grid">
          {filteredCompanies.map((company) => (
            <div
              key={company.id}
              className="section-card university-section-card university-company-card-enhanced"
            >
              <div className="university-company-card-top">
                <div>
                  <h3 className="section-title university-section-title-tight">
                    {company.name}
                  </h3>
                  <p className="university-row-subtext">
                    {company.sector} • {company.location}
                  </p>
                </div>

                <div className="university-company-count">
                  <span>{company.studentsApplied}</span>
                  <small>students applied</small>
                </div>
              </div>

              <div className="info-row">
                <span className="info-label">Open Roles</span>
                <span className="info-value">{company.openRoles}</span>
              </div>

              <div className="info-row">
                <span className="info-label">Applications</span>
                <span className="info-value">{company.applications.length}</span>
              </div>

              <div className="info-row">
                <span className="info-label">Latest Interest</span>
                <span className="info-value">
                  {company.applications[0]?.studentName ?? "No applications yet"}
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredCompanies.length === 0 && (
          <div className="opportunities-empty">No companies match the current filters.</div>
        )}
      </div>
    </div>
  );
}
