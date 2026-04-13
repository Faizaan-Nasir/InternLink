import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import Logo from "../assets/Logo.png";
import Navbar from "./Navbar";
import UniversityOverview from "./UniversityOverview";
import UniversityStudents from "./UniversityStudents";
import UniversityCompanies from "./UniversityCompanies";
import UniversityAnalytics from "./UniversityAnalytics";
import StudentFormModal from "./StudentFormModal";
import CsvImportModal from "./CsvImportModal";
import { supabase } from "../../utils/supabase";
import {
  UNIVERSITY_NAME,
  companies as universityCompanies,
  students as universityStudents,
  universityInfo,
} from "./universityData";

export default function University() {
  const location = useLocation();
  const [students, setStudents] = useState(() => initializeStudents(universityStudents));

  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [studentModalMode, setStudentModalMode] = useState("add");
  const [editingStudent, setEditingStudent] = useState(null);

  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  const activeTab = useMemo(() => getActiveTabFromPath(location.pathname), [location.pathname]);

  const universityLinks = useMemo(
    () => [
      { to: "/university/overview", label: "Overview" },
      { to: "/university/students", label: "Students" },
      { to: "/university/companies", label: "Companies" },
      { to: "/university/analytics", label: "Analytics" },
    ],
    []
  );

  const overviewStats = useMemo(() => {
    const totalStudents = students.length;
    const allApplications = students.flatMap((student) => student.applications);
    const selectedCount = allApplications.filter(
      (application) => application.status === "Selected"
    ).length;

    const avgCgpa =
      totalStudents > 0
        ? (
          students.reduce((sum, student) => sum + Number(student.cgpa || 0), 0) /
          totalStudents
        ).toFixed(2)
        : "0.00";

    return [
      { title: "Total Students", value: totalStudents },
      { title: "Total Applications", value: allApplications.length },
      { title: "Selected", value: selectedCount },
      { title: "Avg CGPA", value: avgCgpa },
    ];
  }, [students]);

  const companies = useMemo(() => {
    return universityCompanies.map((company) => {
      const applications = students.flatMap((student) =>
        student.applications
          .filter((application) => application.company === company.name)
          .map((application) => ({
            ...application,
            studentName: student.name,
          }))
      );

      const uniqueStudentsApplied = new Set(
        applications.map((application) => application.studentName)
      ).size;

      return {
        ...company,
        studentsApplied: uniqueStudentsApplied,
        applications,
      };
    });
  }, [students]);

  const analyticsData = useMemo(() => {
    const allApplications = students.flatMap((student) => student.applications);

    const placementRate = students.length
      ? Math.round(
        (allApplications.filter((application) => application.status === "Selected").length /
          students.length) *
        100
      )
      : 0;

    const resumeCoverage = students.length
      ? Math.round(
        (students.filter((student) => student.resumeUploaded).length / students.length) *
        100
      )
      : 0;

    const eligibleProfileCompletion = students.length
      ? Math.round(
        (students.filter(
          (student) =>
            student.email &&
            student.skills.length &&
            student.resumeUploaded
        ).length /
          students.length) *
        100
      )
      : 0;

    const avgApplicationsPerStudent = students.length
      ? (allApplications.length / students.length).toFixed(1)
      : "0.0";

    const branchMap = {};
    const statusMap = { Applied: 0, Shortlisted: 0, Selected: 0, Rejected: 0 };
    const skillMap = {};
    const cgpaBands = {
      "9.0+": 0,
      "8.0 - 8.99": 0,
      "7.0 - 7.99": 0,
      "< 7.0": 0,
    };

    students.forEach((student) => {
      const branchShort = student.branch.includes("Computer")
        ? "CSE"
        : student.branch.includes("Information")
          ? "ISE"
          : student.branch.includes("Electronics")
            ? "ECE"
            : "Other";

      branchMap[branchShort] = (branchMap[branchShort] || 0) + student.applications.length;

      student.skills.forEach((skill) => {
        skillMap[skill] = (skillMap[skill] || 0) + 1;
      });

      const cgpa = Number(student.cgpa);
      if (cgpa >= 9) cgpaBands["9.0+"] += 1;
      else if (cgpa >= 8) cgpaBands["8.0 - 8.99"] += 1;
      else if (cgpa >= 7) cgpaBands["7.0 - 7.99"] += 1;
      else cgpaBands["< 7.0"] += 1;
    });

    allApplications.forEach((application) => {
      if (statusMap[application.status] !== undefined) {
        statusMap[application.status] += 1;
      }
    });

    return {
      placementRate,
      resumeCoverage,
      eligibleProfileCompletion,
      avgApplicationsPerStudent,
      branchApplications: Object.entries(branchMap).map(([label, value]) => ({
        label,
        value,
      })),
      statusBreakdown: Object.entries(statusMap).map(([label, value]) => ({
        label,
        value,
      })),
      topSkills: Object.entries(skillMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([label, value]) => ({
          label,
          value,
        })),
      cgpaBands: Object.entries(cgpaBands).map(([label, value]) => ({
        label,
        value,
      })),
    };
  }, [students]);

  function openAddStudentModal() {
    setStudentModalMode("add");
    setEditingStudent(null);
    setIsStudentModalOpen(true);
  }

  function openEditStudentModal(student) {
    setStudentModalMode("edit");
    setEditingStudent(student);
    setIsStudentModalOpen(true);
  }

  function closeStudentModal() {
    setIsStudentModalOpen(false);
    setEditingStudent(null);
  }

  function openCsvModal() {
    setIsCsvModalOpen(true);
  }

  function closeCsvModal() {
    setIsCsvModalOpen(false);
  }

  function handleSaveStudent(studentData) {
    if (studentModalMode === "edit" && editingStudent) {
      setStudents((prev) =>
        prev.map((student) =>
          student.id === editingStudent.id
            ? {
              ...student,
              ...studentData,
            }
            : student
        )
      );
    } else {
      const newStudent = {
        id: `stu-${Date.now()}`,
        university: UNIVERSITY_NAME,
        applications: [],
        ...studentData,
      };

      setStudents((prev) => [newStudent, ...prev]);
    }

    closeStudentModal();
  }

  function handleImportStudents(importedRows) {
    setStudents((prev) => {
      const byRno = new Map(prev.map((student) => [Number(student.rno), student]));

      importedRows.forEach((student) => {
        const existing = byRno.get(Number(student.rno));

        if (existing) {
          byRno.set(Number(student.rno), {
            ...existing,
            ...student,
            id: existing.id,
            applications: existing.applications || [],
          });
        } else {
          byRno.set(Number(student.rno), {
            ...student,
            id: student.id || `stu-${Date.now()}-${student.rno}`,
            university: student.university || UNIVERSITY_NAME,
            applications: student.applications || [],
          });
        }
      });

      return Array.from(byRno.values());
    });
  }

  function renderPage() {
    switch (activeTab) {
      case "overview":
        return (
          <UniversityOverview
            universityInfo={universityInfo}
            overviewStats={overviewStats}
            onAddStudent={openAddStudentModal}
            onImportCsv={openCsvModal}
          />
        );
      case "students":
        return (
          <UniversityStudents
            students={students}
            onAddStudent={openAddStudentModal}
            onEditStudent={openEditStudentModal}
            onImportCsv={openCsvModal}
          />
        );
      case "companies":
        return <UniversityCompanies companies={companies} />;
      case "analytics":
        return <UniversityAnalytics analyticsData={analyticsData} />;
      default:
        return (
          <UniversityOverview
            universityInfo={universityInfo}
            overviewStats={overviewStats}
            onAddStudent={openAddStudentModal}
            onImportCsv={openCsvModal}
          />
        );
    }
  }

  return (
    <>
      <div className="main-content">
        <img
          src={Logo}
          alt="InternLink logo"
          className="logo"
          onClick={() => supabase.auth.signOut()}
        />

        <h1 className="title">University Dashboard</h1>
        <div className="title-underline" />

        <Navbar
          links={universityLinks}
          className="navbar"
        />

        {renderPage()}
      </div>

      <StudentFormModal
        isOpen={isStudentModalOpen}
        mode={studentModalMode}
        initialData={editingStudent}
        onClose={closeStudentModal}
        onSave={handleSaveStudent}
      />

      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={closeCsvModal}
        onImport={handleImportStudents}
      />
    </>
  );
}

function initializeStudents(seedStudents) {
  return (seedStudents || []).map((student, index) => ({
    id: student.id || `stu-${student.rno || index + 1}`,
    rno: student.rno || index + 1,
    name: student.name || "",
    branch: student.branch || "",
    year: Number(student.year) || 1,
    cgpa: Number(student.cgpa) || 0,
    email: student.email || "",
    phone: student.phone || "",
    university: student.university || UNIVERSITY_NAME,
    resumeUploaded: Boolean(student.resumeUploaded),
    resumeName: student.resumeName || "Not uploaded",
    skills: Array.isArray(student.skills) ? student.skills : [],
    applications: Array.isArray(student.applications)
      ? student.applications.map((application, applicationIndex) => ({
        id: application.id || `app-${student.rno || index + 1}-${applicationIndex + 1}`,
        company: application.company || "Unknown Company",
        role: application.role || "Internship Role",
        status: normalizeApplicationStatus(application.status),
        appliedAgo: application.appliedAgo || "Recently",
      }))
      : [],
  }));
}

function getActiveTabFromPath(pathname) {
  const lastSegment = pathname.split("/").filter(Boolean).pop() || "overview";
  const allowedTabs = new Set(["overview", "students", "companies", "analytics"]);

  if (allowedTabs.has(lastSegment.toLowerCase())) {
    return lastSegment.toLowerCase();
  }

  return "overview";
}

function normalizeApplicationStatus(status) {
  const value = String(status || "").toLowerCase();

  if (value === "selected") return "Selected";
  if (value === "shortlisted") return "Shortlisted";
  if (value === "rejected") return "Rejected";
  return "Applied";
}