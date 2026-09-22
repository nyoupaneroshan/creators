import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createManagerAction, deleteManagerAction } from "@/app/actions/admin";
import { COUNTRIES, getManagerCountries } from "@/lib/types";
import {
  ArrowLeft,
  Users,
  UserPlus,
  Shield,
  MapPin,
  Trash2,
  Mail,
  Calendar,
} from "lucide-react";

export default async function AdminManagersPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  const [managers, dbCountries] = await Promise.all([
    prisma.user.findMany({
      where: { role: "MANAGER" },
      orderBy: [{ name: "asc" }],
    }),
    prisma.country.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const countryNames =
    dbCountries.length > 0 ? dbCountries.map((c) => c.name) : Array.from(COUNTRIES);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-zinc-50 min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="pb-4 border-b border-zinc-200">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-black transition mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Global Pipeline
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-0.5">
              <Shield className="w-3.5 h-3.5 text-zinc-600" />
              <span>Talent Leadership</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">
              Country Managers
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Assign managers to look after one or multiple countries (e.g. Roshan managing Nepal & India).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-800 shadow-2xs">
              Active Managers: <strong className="text-black">{managers.length}</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Manager Form */}
        <div>
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">
              <UserPlus className="w-4 h-4 text-zinc-500" />
              <h2 className="text-sm font-bold text-zinc-900">
                Add Country Manager
              </h2>
            </div>

            <form action={createManagerAction} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                  Manager Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Roshan Nyoupane"
                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="roshan@amora.io"
                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1.5">
                  Assigned Countries * (Select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-1.5 p-2 rounded-xl bg-zinc-50 border border-zinc-200">
                  {countryNames.map((c) => (
                    <label
                      key={c}
                      className="flex items-center gap-1.5 text-xs text-zinc-800 cursor-pointer p-1 rounded hover:bg-zinc-100"
                    >
                      <input
                        type="checkbox"
                        name="assignedCountries"
                        value={c}
                        defaultChecked={c === "Nepal"}
                        className="rounded text-black focus:ring-black"
                      />
                      <span>{c}</span>
                    </label>
                  ))}
                </div>
                <p className="text-[10px] text-zinc-400 mt-1">
                  Managers will strictly only see and manage creators in their selected countries.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-black hover:bg-zinc-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs mt-2"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Create Manager Account
              </button>
            </form>
          </div>
        </div>

        {/* Existing Managers List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-zinc-500" />
            Active Managers ({managers.length})
          </h2>

          {managers.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-2xl p-10 text-center text-zinc-400 text-xs">
              <Users className="w-8 h-8 mx-auto mb-2 text-zinc-400" />
              <p className="font-semibold text-zinc-700">No managers created yet</p>
              <p className="mt-1">Add managers using the form on the left.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {managers.map((m) => {
                const assignedList = getManagerCountries(m.assignedCountry);

                return (
                  <div
                    key={m.id}
                    className="bg-white border border-zinc-200 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-xs"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-zinc-900">{m.name}</span>
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-zinc-100 text-zinc-600 font-semibold border border-zinc-200">
                          MANAGER
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-zinc-500 text-xs">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-zinc-400" />
                          {m.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                          {new Date(m.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Country Badges */}
                      <div className="flex flex-wrap items-center gap-1 pt-1">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase">
                          Locations:
                        </span>
                        {assignedList.map((country) => (
                          <span
                            key={country}
                            className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-200"
                          >
                            <MapPin className="w-2.5 h-2.5 text-zinc-500" />
                            {country}
                          </span>
                        ))}
                      </div>
                    </div>

                    <form
                      action={async () => {
                        "use server";
                        await deleteManagerAction(m.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-zinc-50 rounded-xl transition"
                        title="Remove manager"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
