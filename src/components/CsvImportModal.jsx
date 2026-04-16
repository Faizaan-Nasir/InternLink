import { useState } from "react";

export default function CsvImportModal({ isOpen, onClose, onImport }) {
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  function resetState() {
    setRows([]);
    setFileName("");
    setError("");
  }

  function handleClose() {
    resetState();
    onClose();
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError("");

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = String(event.target?.result ?? "");
        const parsed = parseCsvText(text);
        const normalized = normalizeCsvRows(parsed);

        if (!normalized.length) {
          setError("No valid rows found in the CSV.");
          setRows([]);
          return;
        }

        setRows(normalized);
      } catch (err) {
        setError(err.message || "Unable to parse CSV.");
        setRows([]);
      }
    };

    reader.readAsText(file);
  }

  function handleImport() {
    if (!rows.length) return;
    onImport(rows);
    handleClose();
  }

  return (
    <div className="company-post-overlay">
      <div className="company-post-card university-modal-card">
        <h3 className="profile-modal-title">Import Students from CSV</h3>
        <p className="profile-modal-subtitle">
          Use headers: name, rno, branch, year, cgpa, email, phone, skills
        </p>

        <div className="university-csv-upload-wrap">
          <input
            type="file"
            accept=".csv"
            className="profile-modal-input"
            onChange={handleFileChange}
          />
        </div>

        {fileName ? (
          <p className="university-csv-meta">
            Loaded file: <strong>{fileName}</strong>
          </p>
        ) : null}

        {error ? <p className="university-inline-error">{error}</p> : null}

        {rows.length ? (
          <div className="university-csv-preview">
            <h4 className="university-csv-preview-title">
              Preview ({rows.length} students)
            </h4>

            <div className="university-table-wrap">
              <table className="university-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>RNO</th>
                    <th>Branch</th>
                    <th>Year</th>
                    <th>CGPA</th>
                    <th>Skills</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 5).map((row, index) => (
                    <tr key={`${row.rno}-${index}`}>
                      <td>{row.name}</td>
                      <td>{row.rno}</td>
                      <td>{row.branch}</td>
                      <td>{row.year}</td>
                      <td>{row.cgpa}</td>
                      <td>{row.skills.join(", ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {rows.length > 5 ? (
              <p className="university-csv-meta">Showing first 5 rows only.</p>
            ) : null}
          </div>
        ) : null}

        <div className="profile-modal-actions">
          <button type="button" className="profile-modal-cancel" onClick={handleClose}>
            Cancel
          </button>
          <button
            type="button"
            className="profile-modal-submit"
            onClick={handleImport}
            disabled={!rows.length}
          >
            Import Students
          </button>
        </div>
      </div>
    </div>
  );
}

function parseCsvText(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error("CSV must include a header row and at least one data row.");
  }

  const headers = parseCsvLine(lines[0]).map((header) => header.trim().toLowerCase());

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index]?.trim() ?? "";
    });

    return row;
  });
}

function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

function normalizeCsvRows(rows) {
  return rows
    .map((row, index) => ({
      id: `csv-${Date.now()}-${index}`,
      name: row.name || "",
      rno: Number(row.rno),
      branch: row.branch || "",
      year: Number(row.year),
      cgpa: Number(row.cgpa),
      email: row.email || "",
      phone: row.phone || "",
      university: row.university || "",
      skills: (row.skills || "")
        .split(/[;,]/)
        .map((skill) => skill.trim())
        .filter(Boolean),
      applications: [],
    }))
    .filter(
      (row) =>
        row.name &&
        row.rno &&
        row.branch &&
        row.year &&
        !Number.isNaN(row.cgpa)
    );
}