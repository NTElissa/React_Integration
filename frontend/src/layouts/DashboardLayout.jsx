import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const titles = {
  "/": "Dashboard",
  "/students": "Students",
  "/teachers": "Teachers",
  "/classes": "Classes",
  "/attendance": "Attendance",
  "/exams": "Exams",
  "/results": "Results",
  "/subjects": "Subjects",
  "/fees": "Fee structures",
  "/payments": "Invoices & payments",
  "/settings": "Settings"
};

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <Sidebar
        pathname={pathname}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="min-h-screen lg:pl-64">
        <Topbar
          title={titles[pathname] || "School Management"}
          onMenu={() => setSidebarOpen(true)}
        />

        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-7 lg:p-8">
          <Outlet />
        </main>

        <footer className="border-t border-slate-200/70 px-5 py-5 text-center text-xs text-slate-500 sm:px-8">
          School Management System · Academic administration
        </footer>
      </div>
    </div>
  );
}