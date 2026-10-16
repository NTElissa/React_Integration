import { useEffect, useState } from "react";
import {
  Users,
  GraduationCap,
  School,
  CalendarCheck,
  ArrowRight,
  CircleDollarSign
} from "lucide-react";
import { Link } from "react-router-dom";
import StatCard from "../components/StatCard";
import { apiRequest, getErrorMessage } from "../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState({
    students: null,
    teachers: null,
    classes: null
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        setError("");

        const [students, teachers, classes] = await Promise.all([
          apiRequest("/students?limit=1"),
          apiRequest("/teachers"),
          apiRequest("/classes")
        ]);

        if (active) {
          setStats({
            students: students.pagination?.total ?? students.data?.length ?? 0,
            teachers: teachers.data?.length ?? 0,
            classes: classes.data?.length ?? 0
          });
        }
      } catch (err) {
        if (active) setError(getErrorMessage(err));
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const format = (value) =>
    loading ? "…" : value === null ? "—" : value.toLocaleString();

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 p-6 text-white sm:p-8">
        <div className="relative z-10 max-w-xl">
          <p className="text-sm font-medium text-indigo-100">
            SCHOOL ADMINISTRATION
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome to your school dashboard
          </h2>
          <p className="mt-3 text-sm leading-6 text-indigo-100 sm:text-base">
            Manage student records, organize classes, monitor attendance,
            and keep academic and financial records together.
          </p>

          <Link
            to="/students"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
          >
            Manage students <ArrowRight size={17} />
          </Link>
        </div>

        <School
          className="absolute -bottom-8 -right-4 h-48 w-48 text-white/10 sm:right-10"
          strokeWidth={1}
        />
      </section>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
        >
          <p className="font-semibold">Could not load dashboard data</p>
          <p className="mt-1">{error}</p>
          <p className="mt-1">
            Check that your backend is running and its API routes are registered.
          </p>
        </div>
      )}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              School overview
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Current records from your backend
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total students"
            value={format(stats.students)}
            subtitle="Registered student records"
            icon={Users}
            color="indigo"
          />
          <StatCard
            title="Total teachers"
            value={format(stats.teachers)}
            subtitle="Teacher records"
            icon={GraduationCap}
            color="emerald"
          />
          <StatCard
            title="Total classes"
            value={format(stats.classes)}
            subtitle="Class records"
            icon={School}
            color="violet"
          />
          <StatCard
            title="Attendance"
            value="—"
            subtitle="Attendance summary not connected"
            icon={CalendarCheck}
            color="amber"
          />
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900">Quick actions</h3>
              <p className="mt-1 text-sm text-slate-500">
                Common school administration tasks
              </p>
            </div>
            <School size={22} className="text-indigo-600" />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              { title: "Register student", desc: "Add a new student profile", to: "/students", icon: Users },
              { title: "Manage teachers", desc: "View teaching staff", to: "/teachers", icon: GraduationCap },
              { title: "Manage classes", desc: "Organize class groups", to: "/classes", icon: School },
              { title: "Record attendance", desc: "Open attendance records", to: "/attendance", icon: CalendarCheck }
            ].map(({ title, desc, to, icon: Icon }) => (
              <Link
                key={title}
                to={to}
                className="group flex items-center gap-3 rounded-xl border border-slate-100 p-4 transition hover:border-indigo-200 hover:bg-indigo-50/50"
              >
                <div className="rounded-xl bg-slate-100 p-3 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-700">
                  <Icon size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800">
                    {title}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{desc}</p>
                </div>
                <ArrowRight size={16} className="text-slate-400" />
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <CircleDollarSign size={23} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">School finances</h3>
              <p className="text-xs text-slate-500">Fees and payments</p>
            </div>
          </div>

          <p className="mt-5 text-sm leading-6 text-slate-600">
            Review fee structures, create invoices, and record payments
            from the finance section.
          </p>

          <Link
            to="/fees"
            className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Open finance <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}