import { Construction } from "lucide-react";

export default function PlaceholderPage({ title, description }) {
  return (
    <div className="grid min-h-[55vh] place-items-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <div className="max-w-md">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
          <Construction size={30} />
        </div>
        <h2 className="mt-5 text-xl font-bold text-slate-900">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
        <p className="mt-4 text-xs font-medium text-indigo-600">
          Module ready for integration
        </p>
      </div>
    </div>
  );
}