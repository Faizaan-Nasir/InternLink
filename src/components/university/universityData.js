export const UNIVERSITY_NAME = "Manipal Bangalore";

export const universityInfo = {
  name: UNIVERSITY_NAME,
  subtitle: "Central Internship and Placement Dashboard",
  description:
    "Monitor student records, application performance, placement readiness, and company participation across the university from one unified admin view.",
  image:
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
};

export const students = [
  {
    id: "stu-101",
    rno: 101,
    name: "Arnav Sinha",
    branch: "Computer Science and Engineering",
    year: 2,
    cgpa: 8.4,
    email: "arnav@example.com",
    phone: "+91 98765 43210",
    university: UNIVERSITY_NAME,
    resumeUploaded: true,
    resumeName: "Arnav_Sinha_Resume.pdf",
    skills: ["Python", "React", "SQL", "FastAPI"],
    applications: [
      {
        id: "app-1",
        company: "Google",
        role: "SDE Intern",
        status: "Applied",
        appliedAgo: "2d ago",
      },
      {
        id: "app-2",
        company: "Adobe",
        role: "Backend Intern",
        status: "Shortlisted",
        appliedAgo: "4d ago",
      },
      {
        id: "app-3",
        company: "Siemens",
        role: "Software Intern",
        status: "Rejected",
        appliedAgo: "6d ago",
      },
    ],
  },
  {
    id: "stu-102",
    rno: 102,
    name: "Riya Sharma",
    branch: "Information Science and Engineering",
    year: 3,
    cgpa: 9.1,
    email: "riya@example.com",
    phone: "+91 91234 56780",
    university: UNIVERSITY_NAME,
    resumeUploaded: true,
    resumeName: "Riya_Sharma_Resume.pdf",
    skills: ["Java", "Spring Boot", "PostgreSQL"],
    applications: [
      {
        id: "app-4",
        company: "Infosys",
        role: "Backend Intern",
        status: "Applied",
        appliedAgo: "1d ago",
      },
      {
        id: "app-5",
        company: "Microsoft",
        role: "Cloud Intern",
        status: "Selected",
        appliedAgo: "5d ago",
      },
    ],
  },
  {
    id: "stu-103",
    rno: 103,
    name: "Kabir Mehta",
    branch: "Electronics and Communication Engineering",
    year: 2,
    cgpa: 7.8,
    email: "kabir@example.com",
    phone: "+91 90000 11111",
    university: UNIVERSITY_NAME,
    resumeUploaded: false,
    resumeName: "Not uploaded",
    skills: ["C", "Embedded Systems"],
    applications: [
      {
        id: "app-6",
        company: "Texas Instruments",
        role: "Embedded Intern",
        status: "Applied",
        appliedAgo: "8h ago",
      },
    ],
  },
  {
    id: "stu-104",
    rno: 104,
    name: "Sneha Nair",
    branch: "Computer Science and Engineering",
    year: 4,
    cgpa: 8.9,
    email: "sneha@example.com",
    phone: "+91 98888 77777",
    university: UNIVERSITY_NAME,
    resumeUploaded: true,
    resumeName: "Sneha_Nair_Resume.pdf",
    skills: ["Machine Learning", "Python", "TensorFlow"],
    applications: [
      {
        id: "app-7",
        company: "Amazon",
        role: "ML Intern",
        status: "Selected",
        appliedAgo: "3d ago",
      },
      {
        id: "app-8",
        company: "NVIDIA",
        role: "AI Intern",
        status: "Shortlisted",
        appliedAgo: "1d ago",
      },
    ],
  },
  {
    id: "stu-105",
    rno: 105,
    name: "Nisha Rao",
    branch: "Computer Science and Engineering",
    year: 3,
    cgpa: 8.7,
    email: "nisha@example.com",
    phone: "+91 95555 22222",
    university: UNIVERSITY_NAME,
    resumeUploaded: true,
    resumeName: "Nisha_Rao_Resume.pdf",
    skills: ["UI/UX", "Figma", "React"],
    applications: [
      {
        id: "app-9",
        company: "Adobe",
        role: "Design Intern",
        status: "Applied",
        appliedAgo: "2d ago",
      },
      {
        id: "app-10",
        company: "Google",
        role: "Product Design Intern",
        status: "Rejected",
        appliedAgo: "9d ago",
      },
    ],
  },
];

export const companies = [
  {
    id: 1,
    name: "Google",
    sector: "Technology",
    location: "Bangalore",
    openRoles: 3,
  },
  {
    id: 2,
    name: "Adobe",
    sector: "Software",
    location: "Noida",
    openRoles: 2,
  },
  {
    id: 3,
    name: "Siemens",
    sector: "Engineering",
    location: "Pune",
    openRoles: 4,
  },
  {
    id: 4,
    name: "Microsoft",
    sector: "Technology",
    location: "Hyderabad",
    openRoles: 2,
  },
  {
    id: 5,
    name: "Amazon",
    sector: "Technology",
    location: "Bangalore",
    openRoles: 5,
  },
];

export const recentApplications = students
  .flatMap((student) =>
    student.applications.map((application) => ({
      id: application.id,
      studentName: student.name,
      company: application.company,
      role: application.role,
      status: application.status,
      appliedAgo: application.appliedAgo,
    }))
  )
  .slice(0, 10);