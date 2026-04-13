import { useMemo, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Logo from "../assets/Logo.png";
import Navbar from "./Navbar";
import UniversityOverview from "./UniversityOverview";
import UniversityStudents from "./UniversityStudents";
import UniversityCompanies from "./UniversityCompanies";
import UniversityAnalytics from "./UniversityAnalytics";
import StudentFormModal from "./StudentFormModal";
import CsvImportModal from "./CsvImportModal";
import { supabase as supabaseClient } from "../../utils/supabase";
import {
  UNIVERSITY_NAME,
  companies as universityCompanies,
  universityInfo,
} from "./universityData";

export default function University({ supabase }) {
  const location = useLocation();
  const [students, setStudents] = useState([]);
  const dbClient = supabase ?? supabaseClient;

  useEffect(() => {
    const initializeStudents = async () => {
      try {
        // ---------------------------
        // 1. STUDENTS
        // ---------------------------
        const { data: studentsData, error: studentError } = await dbClient
          .from("Students")
          .select("*");

        if (studentError) throw studentError;

        const studentIds = (studentsData || []).map(s => s.rno);

        // ---------------------------
        // 2. APPLICATIONS
        // ---------------------------
        const { data: applicationsData, error: appError } = await dbClient
          .from("Applications")
          .select("*")
          .in("student_id", studentIds);
        console.log("Applications data:", applicationsData);
        if (appError) throw appError;

        const internshipIds = (applicationsData || []).map(a => a.internship_id);

        // ---------------------------
        // 3. INTERNSHIPS + COMPANIES
        // ---------------------------
        const { data: internshipsData, error: internshipError } = await dbClient
          .from("Internships")
          .select("id, role, company_id, Companies(name)")
          .in("id", internshipIds);

        if (internshipError) throw internshipError;

        // ---------------------------
        // 4. RESPONSES
        // ---------------------------
        const { data: responsesData, error: responseError } = await dbClient
          .from("Responses")
          .select("id, decision")
          .in("student_id", studentIds);

        if (responseError) throw responseError;

        // ---------------------------
        // MAPS (FAST LOOKUPS)
        // ---------------------------
        const internshipMap = new Map(
          (internshipsData || []).map(i => [i.id, i])
        );

        const responseMap = new Map(
          (responsesData || []).map(r => [r.id, r])
        );

        const applicationsByStudent = new Map();

        (applicationsData || []).forEach(app => {
          if (!applicationsByStudent.has(app.student_id)) {
            applicationsByStudent.set(app.student_id, []);
          }
          applicationsByStudent.get(app.student_id).push(app);
        });

        // ---------------------------
        // FINAL STRUCTURE
        // ---------------------------
        const formattedStudents = (studentsData || []).map((student, index) => {
          const studentApps = applicationsByStudent.get(student.rno) || [];

          return {
            id: student.rno || `stu-${index + 1}`,
            rno: student.rno,
            name: student.name || "",
            branch: student.branch || "",
            year: Number(student.year) || 1,
            cgpa: Number(student.cgpa) || 0,
            email: student.email || "",
            phone: student.ph || "",
            university: UNIVERSITY_NAME,
            resumeUploaded: Boolean(student.resumeUploaded),
            resumeName: student.resumeName || "Not uploaded",
            skills: Array.isArray(student.skills) ? student.skills : [],

            applications: studentApps.map((app, appIndex) => {
              const internship = internshipMap.get(app.internship_id);
              const response = responseMap.get(app.id);

              return {
                id: app.id || `app-${student.rno}-${appIndex + 1}`,
                company: internship?.Companies?.name || "Unknown Company",
                role: internship?.role || "Internship Role",
                status: normalizeApplicationStatus(response?.decision),
                appliedAgo: app.appliedAgo || "Recently",
              };
            }),
          };
        });

        setStudents(formattedStudents);
      } catch (err) {
        console.error("Error fetching students:", err);
      }
    };

    initializeStudents();
  }, [dbClient]);

  // ---------------------------
  // UI STATE (UNCHANGED)
  // ---------------------------
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [studentModalMode, setStudentModalMode] = useState("add");
  const [editingStudent, setEditingStudent] = useState(null);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  const activeTab = useMemo(() => getActiveTabFromPath(location.pathname), [location.pathname]);

  const universityLinks = useMemo(
    () => [
      { to: "/Overview", label: "Overview" },
      { to: "/Students", label: "Students" },
      { to: "/Companies", label: "Companies" },
      { to: "/Analytics", label: "Analytics" },
    ],
    []
  );

  // ---------------------------
  // OVERVIEW + ANALYTICS
  // ---------------------------
  const overviewStats = useMemo(() => {
    const totalStudents = students.length;
    const allApplications = students.flatMap(s => s.applications);

    const selectedCount = allApplications.filter(a => a.status === "Selected").length;

    const avgCgpa =
      totalStudents > 0
        ? (
          students.reduce((sum, s) => sum + Number(s.cgpa || 0), 0) /
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
    return universityCompanies.map(company => {
      const apps = students.flatMap(student =>
        student.applications
          .filter(app => app.company === company.name)
          .map(app => ({
            ...app,
            studentName: student.name,
          }))
      );

      return {
        ...company,
        studentsApplied: new Set(apps.map(a => a.studentName)).size,
        applications: apps,
      };
    });
  }, [students]);

  // ---------------------------
  // RENDER
  // ---------------------------
  function renderPage() {
    switch (activeTab) {
      case "Overview":
        return (
          <UniversityOverview
            universityInfo={universityInfo}
            overviewStats={overviewStats}
            onAddStudent={() => setIsStudentModalOpen(true)}
            onImportCsv={() => setIsCsvModalOpen(true)}
          />
        );
      case "Students":
        return (
          <UniversityStudents
            students={students}
            onAddStudent={() => setIsStudentModalOpen(true)}
          />
        );
      case "Companies":
        return <UniversityCompanies companies={companies} />;
      case "Analytics":
        return <UniversityAnalytics analyticsData={{}} />;
      default:
        return null;
    }
  }

  return (
    <div className="main-content">
      <img
        src={Logo}
        alt="InternLink logo"
        className="logo"
        onClick={() => dbClient.auth.signOut()}
      />

      <h1 className="title">University Dashboard</h1>
      <Navbar links={universityLinks} />

      {renderPage()}
    </div>
  );
}

function getActiveTabFromPath(pathname) {
  const last = pathname.split("/").filter(Boolean).pop() || "overview";
  return ["Overview", "Students", "Companies", "Analytics"].includes(last)
    ? last
    : "Overview";
}

function normalizeApplicationStatus(status) {
  const value = String(status || "").toLowerCase();
  if (value === "selected") return "Selected";
  if (value === "shortlisted") return "Shortlisted";
  if (value === "rejected") return "Rejected";
  return "Applied";
}