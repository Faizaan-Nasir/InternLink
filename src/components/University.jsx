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

export default function University({ supabase }) {
  const location = useLocation();
  const [students, setStudents] = useState([]);
  const [universityCompanies, setUniversityCompanies] = useState([]);
  const [UNIVERSITY_NAME, setUNIVERSITY_NAME] = useState("Loading...");
  const [universityInfo, setUniversityInfo] = useState({
    name: "Loading...",
    subtitle: "Loading...",
    description: "Loading...",
    image: "Loading...",
    id: null
  });
  const dbClient = supabase ?? supabaseClient;

  useEffect(() => {
    const initializeStudents = async () => {
      try {
        const { data: studentsData, error: studentError } = await dbClient
          .from("Students")
          .select("*");

        if (studentError) throw studentError;

        const studentIds = (studentsData || []).map(s => s.rno);

        const { data: applicationsData, error: appError } = await dbClient
          .from("Applications")
          .select("*")
          .in("student_id", studentIds);
        console.log("Applications data:", applicationsData);
        if (appError) throw appError;

        const internshipIds = (applicationsData || []).map(a => a.internship_id);

        const { data: internshipsData, error: internshipError } = await dbClient
          .from("Internships")
          .select("id, role, company_id, Companies(name)")
          .in("id", internshipIds);

        if (internshipError) throw internshipError;

        const { data: responsesData, error: responseError } = await dbClient
          .from("Responses")
          .select("id, decision")
          .in("student_id", studentIds);

        if (responseError) throw responseError;

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
      } catch (error) {
        console.error("Error initializing students:", error);
      }
    };
    const initializeCompanies = async () => {
      try {
        const { data: companiesData, error: companiesError } = await dbClient
          .from("Companies")
          .select("*");

        if (companiesError) throw companiesError;

        setUniversityCompanies(companiesData || []);
      } catch (err) {
        console.error("Error fetching companies:", err);
      }
    };
    const initializeUniversityInfo = async () => {
      try {
        const { data, error } = await dbClient
          .from("Universities")
          .select("university_id,name,subtitle")
          .single();
        if (!error) {
          setUNIVERSITY_NAME(data?.name || "Unknown University");
          setUniversityInfo(prev => ({
            ...prev,
            name: data?.name || "Unknown University",
            subtitle: data?.subtitle || "Unknown Subtitle",
            id: data?.university_id || null
          }));
        }
        else {
          throw error;
        }
      } catch (err) {
        console.error("Error fetching university info:", err);
      }
    };

    initializeCompanies();
    initializeStudents();
    initializeUniversityInfo();
  }, [dbClient, UNIVERSITY_NAME]);

  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [studentModalMode, setStudentModalMode] = useState("add");
  const [editingStudent, setEditingStudent] = useState(null);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  const activeTab = useMemo(() => getActiveTabFromPath(location.pathname), [location.pathname]);


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
  const universityLinks = useMemo(
    () => [
      { to: "/Overview", label: "Overview" },
      { to: "/Students", label: "Students" },
      { to: "/Companies", label: "Companies" },
      { to: "/Analytics", label: "Analytics" },
    ],
    []
  );

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

  const analyticsData = useMemo(() => {
    if (!students || students.length === 0) {
      return {
        placementRate: 0,
        resumeCoverage: 0,
        eligibleProfileCompletion: 0,
        avgApplicationsPerStudent: 0,
        branchApplications: [],
        statusBreakdown: [],
        topSkills: [],
        cgpaBands: [],
      };
    }

    const totalStudents = students.length;
    const allApplications = students.flatMap(s => s.applications);

    // Placement Rate: percentage of students with at least one "Selected" application
    const studentsWithPlacement = new Set(
      allApplications
        .filter(app => app.status === "Selected")
        .map(app => {
          const student = students.find(s =>
            s.applications && s.applications.includes(app)
          );
          return student?.id;
        })
    ).size;
    const placementRate = totalStudents > 0 ? Math.round((studentsWithPlacement / totalStudents) * 100) : 0;

    // Resume Coverage: percentage of students with resume uploaded
    const studentsWithResume = students.filter(s => s.resumeUploaded).length;
    const resumeCoverage = totalStudents > 0 ? Math.round((studentsWithResume / totalStudents) * 100) : 0;

    // Eligible Profile Completion: students with resume AND CGPA >= 7.0
    const eligibleStudents = students.filter(s => s.resumeUploaded && Number(s.cgpa || 0) >= 7.0).length;
    const eligibleProfileCompletion = totalStudents > 0 ? Math.round((eligibleStudents / totalStudents) * 100) : 0;

    // Avg Applications per Student
    const avgApplicationsPerStudent = totalStudents > 0 ? (allApplications.length / totalStudents).toFixed(1) : "Undefined";

    // Branch Applications: count applications by branch
    const branchMap = {};
    students.forEach(student => {
      const branch = student.branch || "Undefined";
      if (!branchMap[branch]) branchMap[branch] = 0;
      branchMap[branch] += (student.applications?.length || 0);
    });
    const branchApplications = Object.entries(branchMap)
      .map(([branch, count]) => ({
        label: branch.split(" and ")[0] || branch, // Shorten long branch names
        value: count,
      }))
      .sort((a, b) => b.value - a.value);

    // Status Breakdown: count applications by status
    const statusMap = {};
    allApplications.forEach(app => {
      const status = app.status || "Applied";
      statusMap[status] = (statusMap[status] || 0) + 1;
    });
    const statusBreakdown = Object.entries(statusMap)
      .map(([status, count]) => ({ label: status, value: count }))
      .sort((a, b) => b.value - a.value);

    // Top Skills: count skill frequency across all students
    const skillMap = {};
    students.forEach(student => {
      (student.skills || []).forEach(skill => {
        skillMap[skill] = (skillMap[skill] || 0) + 1;
      });
    });
    const topSkills = Object.entries(skillMap)
      .map(([skill, count]) => ({ label: skill, value: count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Top 6 skills

    // CGPA Distribution: group students into CGPA bands
    const cgpaMap = {
      "7.0-7.5": 0,
      "7.5-8.0": 0,
      "8.0-8.5": 0,
      "8.5-9.0": 0,
      "9.0+": 0,
    };
    students.forEach(student => {
      const cgpa = Number(student.cgpa || 0);
      if (cgpa < 7.0) cgpaMap["7.0-7.5"]++;
      else if (cgpa < 7.5) cgpaMap["7.0-7.5"]++;
      else if (cgpa < 8.0) cgpaMap["7.5-8.0"]++;
      else if (cgpa < 8.5) cgpaMap["8.0-8.5"]++;
      else if (cgpa < 9.0) cgpaMap["8.5-9.0"]++;
      else cgpaMap["9.0+"]++;
    });
    const cgpaBands = Object.entries(cgpaMap)
      .filter(([band]) => cgpaMap[band] > 0)
      .map(([band, count]) => ({ label: band, value: count }));

    return {
      placementRate,
      resumeCoverage,
      eligibleProfileCompletion,
      avgApplicationsPerStudent,
      branchApplications: branchApplications.length > 0 ? branchApplications : [{ label: "Undefined", value: 0 }],
      statusBreakdown: statusBreakdown.length > 0 ? statusBreakdown : [{ label: "Undefined", value: 0 }],
      topSkills: topSkills.length > 0 ? topSkills : [{ label: "Undefined", value: 0 }],
      cgpaBands: cgpaBands.length > 0 ? cgpaBands : [{ label: "Undefined", value: 0 }],
    };
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
  }, [students, universityCompanies]);

  async function handleSaveStudent(studentData) {
    if (studentModalMode === "edit" && editingStudent) {
      setStudents(prev =>
        prev.map(s =>
          s.id === editingStudent.id ? { ...s, ...studentData } : s
        ));
      const { error } = await supabase.from("Students")
        .update({
          rno: studentData.rno,
          name: studentData.name,
          branch: studentData.branch,
          year: studentData.year,
          cgpa: studentData.cgpa,
          email: studentData.email,
          ph: studentData.phone,
          university: UNIVERSITY_NAME,
          university_id: universityInfo.id
        })
        .eq("rno", editingStudent.id);

      if (error) {
        console.error("Error updating student:", error);
      }
    } else {
      const newStudent = {
        id: `stu-${Date.now()}`,
        university: UNIVERSITY_NAME,
        applications: [],
        ...studentData,
      };
      console.log(universityInfo.id);
      const { error: insertError } = await supabase.from("Students").insert({
        rno: newStudent.rno,
        name: newStudent.name,
        branch: newStudent.branch,
        year: newStudent.year,
        cgpa: newStudent.cgpa,
        email: newStudent.email,
        ph: newStudent.phone,
        university: newStudent.university,
        university_id: universityInfo.id
      });
      insertError && console.error("Error inserting student:", insertError);
      setStudents(prev => [newStudent, ...prev]);
    }

    closeStudentModal();
  }

  function handleImportStudents(importedRows) {
    setStudents(prev => {
      const map = new Map(prev.map(s => [Number(s.rno), s]));

      importedRows.forEach(student => {
        const existing = map.get(Number(student.rno));

        if (existing) {
          map.set(Number(student.rno), {
            ...existing,
            ...student,
            id: existing.id,
            applications: existing.applications || [],
          });
        } else {
          map.set(Number(student.rno), {
            ...student,
            id: `stu-${Date.now()}-${student.rno}`,
            university: UNIVERSITY_NAME,
            applications: [],
          });
        }
      });

      return Array.from(map.values());
    });
  }
  function renderPage() {
    switch (activeTab) {
      case "Overview":
        return (
          <UniversityOverview
            universityInfo={universityInfo}
            overviewStats={overviewStats}
            onAddStudent={openAddStudentModal}
            onImportCsv={openCsvModal}
          />
        );
      case "Students":
        return (
          <UniversityStudents
            students={students}
            onAddStudent={openAddStudentModal}
            onImportCsv={openCsvModal}
            onEditStudent={openEditStudentModal}
          />
        );
      case "Companies":
        return <UniversityCompanies companies={companies} />;
      case "Analytics":
        return <UniversityAnalytics analyticsData={analyticsData} />;
      default:
        return null;
    }
  }

  return (
    <>
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