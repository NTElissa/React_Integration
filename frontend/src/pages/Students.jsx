import { useCallback, useEffect, useState } from "react";
import { Plus, RefreshCw, UserRound, X } from "lucide-react";
import DataTable from "../components/DataTable";
import { apiRequest, getErrorMessage } from "../services/api";

const initialForm = {
  studentCode: "",
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "",
  email: "",
  phone: "",
  guardianName: "",
  guardianPhone: ""
};

export default function Students() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const query = new URLSearchParams({
        page: String(page),
        limit: "10",
        ...(search.trim() ? { search: search.trim() } : "")
      });

      const response = await apiRequest(`/students?${query}`);

      setStudents(response.data || []);
      setPagination(response.pagination || {
        total: response.data?.length || 0,
        totalPages: 1
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  function changeField(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const {
        guardianName,
        guardianPhone,
        ...studentFields
      } = form;

      const payload = {
        ...studentFields,
        ...(form.dateOfBirth
          ? { dateOfBirth: form.dateOfBirth }
          : {}),
        ...(guardianName.trim() || guardianPhone.trim()
          ? {
              guardian: {
                name: guardianName.trim(),
                phone: guardianPhone.trim()
              }
            }
          : {})
      };

      // Remove empty optional strings.
      for (const key of Object.keys(payload)) {
        if (payload[key] === "") delete payload[key];
      }

      await apiRequest("/students", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      setModalOpen(false);
      setForm(initialForm);
      setPage(1);
      setNotice("Student registered successfully.");

      // Fetch the current search results after saving.
      const query = new URLSearchParams({
        page: "1",
        limit: "10",
        ...(search.trim() ? { search: search.trim() } : "")
      });

      const response = await apiRequest(`/students?${query}`);
      setStudents(response.data || []);
      setPagination(response.pagination || {
        total: response.data?.length || 0,
        totalPages: 1
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(student) {
    const confirmed = window.confirm(
      `Deactivate ${student.firstName} ${student.lastName}?`
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      await apiRequest(`/students/${student._id}/deactivate`, {
        method: "PATCH"
      });

      setNotice("Student deactivated successfully.");
      await loadStudents();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  const columns = [
    {
      key: "studentCode",
      label: "Student",
      render: (student) => (
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-700">
            <UserRound size={19} />
          </div>
          <div>
            <p className="font-semibold text-slate-800">
              {student.firstName} {student.lastName}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {student.studentCode}
            </p>
          </div>
        </div>
      )
    },
    {
      key: "email",
      label: "Email",
      render: (student) => student.email || "—"
    },
    {
      key: "phone",
      label: "Phone",
      render: (student) => student.phone || "—"
    },
    {
      key: "isActive",
      label: "Status",
      render: (student) => (
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
          student.isActive
            ? "bg-emerald-50 text-emerald-700"
            : "bg-slate-100 text-slate-600"
        }`}>
          {student.isActive ? "Active" : "Inactive"}
        </span>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (student) => student.isActive ? (
        <button
          onClick={() => handleDeactivate(student)}
          className="text-xs font-semibold text-rose-600 hover:text-rose-800"
        >
          Deactivate
        </button>
      ) : (
        <span className="text-xs text-slate-400">No actions</span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Student directory
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {pagination.total} registered student records
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadStudents}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw size={16} /> Refresh
          </button>
          <button
            onClick={() => {
              setError("");
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            <Plus size={17} /> Add student
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {notice && (
        <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {notice}
        </div>
      )}

      <DataTable
        columns={columns}
        rows={students}
        search={search}
        onSearch={(value) => {
          setSearch(value);
          setPage(1);
        }}
        loading={loading}
        emptyMessage="No students found. Register your first student."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          Page {page} of {Math.max(1, pagination.totalPages)}
        </p>
        <div className="flex gap-2">
          <button
            disabled={page <= 1 || loading}
            onClick={() => setPage((current) => current - 1)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            Previous
          </button>
          <button
            disabled={loading || page >= pagination.totalPages}
            onClick={() => setPage((current) => current + 1)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setModalOpen(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="student-form-title"
            className="my-auto w-full max-w-2xl rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6">
              <div>
                <h3 id="student-form-title" className="text-lg font-bold text-slate-900">
                  Register a student
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Enter the student's details below.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                disabled={saving}
                aria-label="Close form"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { name: "studentCode", label: "Student code", required: true },
                  { name: "firstName", label: "First name", required: true },
                  { name: "lastName", label: "Last name", required: true },
                  { name: "dateOfBirth", label: "Date of birth", type: "date" },
                  { name: "email", label: "Email", type: "email" },
                  { name: "phone", label: "Phone" }
                ].map((field) => (
                  <label key={field.name} className="space-y-1.5">
                    <span className="text-sm font-medium text-slate-700">
                      {field.label}
                      {field.required && <span className="text-rose-500"> *</span>}
                    </span>
                    <input
                      name={field.name}
                      type={field.type || "text"}
                      value={form[field.name]}
                      onChange={changeField}
                      required={field.required}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    />
                  </label>
                ))}

                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">Gender</span>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={changeField}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </label>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <h4 className="font-semibold text-slate-800">Parent or guardian</h4>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1.5">
                    <span className="text-sm font-medium text-slate-700">Guardian name</span>
                    <input
                      name="guardianName"
                      value={form.guardianName}
                      onChange={changeField}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500"
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-sm font-medium text-slate-700">Guardian phone</span>
                    <input
                      name="guardianPhone"
                      value={form.guardianPhone}
                      onChange={changeField}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500"
                    />
                  </label>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  {saving ? "Saving..." : "Register student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}