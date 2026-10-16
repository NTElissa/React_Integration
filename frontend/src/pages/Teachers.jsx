import { useEffect, useState } from "react";
import { GraduationCap, RefreshCw } from "lucide-react";
import DataTable from "../components/DataTable";
import { apiRequest, getErrorMessage } from "../services/api";

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadTeachers() {
    setLoading(true);
    setError("");

    try {
      const response = await apiRequest("/teachers");
      setTeachers(response.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTeachers();
  }, []);

  const filtered = teachers.filter((teacher) =>
    [
      teacher.employeeCode,
      teacher.firstName,
      teacher.lastName,
      teacher.email
    ].some((value) =>
      String(value || "").toLowerCase().includes(search.toLowerCase())
    )
  );

  const columns = [
    {
      key: "employeeCode",
      label: "Teacher",
      render: (teacher) => (
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
            <GraduationCap size={20} />
          </div>
          <div>
            <p className="font-semibold text-slate-800">
              {teacher.firstName} {teacher.lastName}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {teacher.employeeCode}
            </p>
          </div>
        </div>
      )
    },
    {
      key: "email",
      label: "Email",
      render: (teacher) => teacher.email || "—"
    },
    {
      key: "phone",
      label: "Phone",
      render: (teacher) => teacher.phone || "—"
    },
    {
      key: "qualification",
      label: "Qualification",
      render: (teacher) => teacher.qualification || "—"
    },
    {
      key: "isActive",
      label: "Status",
      render: (teacher) => (
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
          teacher.isActive
            ? "bg-emerald-50 text-emerald-700"
            : "bg-slate-100 text-slate-500"
        }`}>
          {teacher.isActive ? "Active" : "Inactive"}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Teachers</h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage your teaching staff and their profiles.
          </p>
        </div>
        <button
          onClick={loadTeachers}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      <DataTable
        columns={columns}
        rows={filtered}
        search={search}
        onSearch={setSearch}
        loading={loading}
        emptyMessage="No teachers found."
      />
    </div>
  );
}