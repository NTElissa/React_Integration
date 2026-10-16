import {
  LayoutDashboard,
  Users,
  GraduationCap,
  School,
  CalendarCheck,
  ClipboardList,
  ChartNoAxesColumn,
  Wallet,
  CreditCard,
  BookOpen,
  Settings,
  X
} from "lucide-react";

const groups = [
  {
    title: "MAIN MENU",
    items: [
      { label: "Dashboard", path: "/", icon: LayoutDashboard },
      { label: "Students", path: "/students", icon: Users },
      { label: "Teachers", path: "/teachers", icon: GraduationCap },
      { label: "Classes", path: "/classes", icon: School }
    ]
  },
  {
    title: "ACADEMICS",
    items: [
      { label: "Attendance", path: "/attendance", icon: CalendarCheck },
      { label: "Exams", path: "/exams", icon: ClipboardList },
      { label: "Results", path: "/results", icon: ChartNoAxesColumn },
      { label: "Subjects", path: "/subjects", icon: BookOpen }
    ]
  },
  {
    title: "FINANCE",
    items: [
      { label: "Fee structures", path: "/fees", icon: Wallet },
      { label: "Invoices & payments", path: "/payments", icon: CreditCard }
    ]
  }
];

export default function Sidebar({ pathname, open, onClose }) {
  return (
    <>
      {open && (
        <button
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-white">
              <School size={23} />
            </div>
            <div>
              <h1 className="font-bold tracking-tight text-slate-900">
                EduManage
              </h1>
              <p className="text-xs text-slate-500">School administration</p>
            </div>
          </div>

          <button
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={19} />
          </button>
        </div>

        <nav className="flex-1 space-y-7 overflow-y-auto px-4 py-6">
          {groups.map((group) => (
            <section key={group.title}>
              <p className="mb-3 px-3 text-[10px] font-bold tracking-[0.16em] text-slate-400">
                {group.title}
              </p>

              <div className="space-y-1">
                {group.items.map(({ label, path, icon: Icon }) => {
                  const active = pathname === path;

                  return (
                    <a
                      key={path}
                      href={path}
                      onClick={onClose}
                      className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                        active
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <Icon size={19} strokeWidth={active ? 2.4 : 1.8} />
                      {label}
                      {active && (
                        <span className="ml-auto h-5 w-1 rounded-full bg-indigo-600" />
                      )}
                    </a>
                  );
                })}
              </div>
            </section>
          ))}
        </nav>

        <div className="border-t border-slate-100 p-4">
          <a
            href="/settings"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-600 hover:bg-slate-50"
          >
            <Settings size={19} />
            Settings
          </a>
          <div className="mt-3 rounded-xl bg-slate-50 p-3">
            <p className="text-xs font-semibold text-slate-800">
              School Management
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Primary & Secondary
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}