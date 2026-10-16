import { Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Teachers from "./pages/Teachers";
import PlaceholderPage from "./pages/PlaceholderPage";

const modules = [
  {
    path: "classes",
    title: "Class management",
    description: "Create class groups, assign class teachers, and organize academic years."
  },
  {
    path: "attendance",
    title: "Attendance management",
    description: "Record attendance, track absences, and review attendance reports."
  },
  {
    path: "exams",
    title: "Exam management",
    description: "Create assessments, set maximum marks, and manage exam schedules."
  },
  {
    path: "results",
    title: "Results management",
    description: "Enter marks, review grades, and prepare student report cards."
  },
  {
    path: "subjects",
    title: "Subject management",
    description: "Maintain the subject catalog and assign subjects to teachers and classes."
  },
  {
    path: "fees",
    title: "Fee structures",
    description: "Configure fees for each class, academic year, and school term."
  },
  {
    path: "payments",
    title: "Invoices and payments",
    description: "Generate student invoices, record payments, and track outstanding balances."
  },
  {
    path: "settings",
    title: "School settings",
    description: "Configure school information, academic years, user accounts, and permissions."
  }
];

export default function App() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="teachers" element={<Teachers />} />

        {modules.map((module) => (
          <Route
            key={module.path}
            path={module.path}
            element={
              <PlaceholderPage
                title={module.title}
                description={module.description}
              />
            }
          />
        ))}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}