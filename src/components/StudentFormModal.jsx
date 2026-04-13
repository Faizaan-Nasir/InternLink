import { useEffect, useState } from "react";

const emptyForm = {
  name: "",
  rno: "",
  branch: "",
  year: "",
  cgpa: "",
  email: "",
  phone: "",
  resumeUploaded: false,
  resumeName: "",
  skills: "",
};

export default function StudentFormModal({
  isOpen,
  mode,
  initialData,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setForm({
        name: initialData.name ?? "",
        rno: initialData.rno ?? "",
        branch: initialData.branch ?? "",
        year: initialData.year ?? "",
        cgpa: initialData.cgpa ?? "",
        email: initialData.email ?? "",
        phone: initialData.phone ?? "",
        resumeUploaded: initialData.resumeUploaded ?? false,
        resumeName:
          initialData.resumeName && initialData.resumeName !== "Not uploaded"
            ? initialData.resumeName
            : "",
        skills: Array.isArray(initialData.skills)
          ? initialData.skills.join(", ")
          : "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    onSave({
      ...initialData,
      name: form.name.trim(),
      rno: Number(form.rno),
      branch: form.branch.trim(),
      year: Number(form.year),
      cgpa: Number(form.cgpa),
      email: form.email.trim(),
      phone: form.phone.trim(),
      resumeUploaded: form.resumeUploaded,
      resumeName: form.resumeUploaded
        ? form.resumeName.trim() || "Resume.pdf"
        : "Not uploaded",
      skills: form.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
    });
  }

  return (
    <div className="company-post-overlay">
      <div className="company-post-card university-modal-card">
        <h3 className="profile-modal-title">
          {mode === "edit" ? "Edit Student" : "Add Student"}
        </h3>
        <p className="profile-modal-subtitle">
          Update student academic and profile details.
        </p>

        <form className="university-modal-form" onSubmit={handleSubmit}>
          <div className="university-modal-grid">
            <label className="company-form-group">
              <span>Name</span>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="profile-modal-input"
              />
            </label>

            <label className="company-form-group">
              <span>Roll Number</span>
              <input
                name="rno"
                value={form.rno}
                onChange={handleChange}
                className="profile-modal-input"
                type="number"
                required
              />
            </label>

            <label className="company-form-group">
              <span>Branch</span>
              <input
                name="branch"
                value={form.branch}
                onChange={handleChange}
                className="profile-modal-input"
                required
              />
            </label>

            <label className="company-form-group">
              <span>Year</span>
              <input
                name="year"
                value={form.year}
                onChange={handleChange}
                className="profile-modal-input"
                type="number"
                required
              />
            </label>

            <label className="company-form-group">
              <span>CGPA</span>
              <input
                name="cgpa"
                value={form.cgpa}
                onChange={handleChange}
                className="profile-modal-input"
                type="number"
                step="0.01"
                min="0"
                max="10"
                required
              />
            </label>

            <label className="company-form-group">
              <span>Email</span>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                className="profile-modal-input"
                type="email"
                required
              />
            </label>

            <label className="company-form-group">
              <span>Phone</span>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="profile-modal-input"
                required
              />
            </label>

            <label className="company-form-group">
              <span>Resume Name</span>
              <input
                name="resumeName"
                value={form.resumeName}
                onChange={handleChange}
                className="profile-modal-input"
                placeholder="Arnav_Sinha_Resume.pdf"
              />
            </label>

            <label className="company-form-group company-form-group-full">
              <span>Skills</span>
              <input
                name="skills"
                value={form.skills}
                onChange={handleChange}
                className="profile-modal-input"
                placeholder="Python, React, SQL"
              />
            </label>

            <label className="university-checkbox-row company-form-group-full">
              <input
                name="resumeUploaded"
                checked={form.resumeUploaded}
                onChange={handleChange}
                type="checkbox"
              />
              <span>Resume uploaded</span>
            </label>
          </div>

          <div className="profile-modal-actions">
            <button type="button" className="profile-modal-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="profile-modal-submit">
              {mode === "edit" ? "Save Changes" : "Add Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}