import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  createCountryAction,
  deleteCountryAction,
  toggleCountryActiveAction,
} from "@/app/actions/admin";
import { Globe, Plus, Trash2, CheckCircle2, DollarSign, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminCountriesPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  const [countries, creatorsCountByCountry, projectsCountByCountry] = await Promise.all([
    prisma.country.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.creatorProfile.groupBy({
      by: ["country"],
      _count: { id: true },
    }),
    prisma.project.groupBy({
      by: ["country"],
      _count: { id: true },
    }),
  ]);

  const creatorCounts = Object.fromEntries(
    creatorsCountByCountry.map((c) => [c.country, c._count.id])
  );
  const projectCounts = Object.fromEntries(
    projectsCountByCountry.map((p) => [p.country, p._count.id])
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-black transition mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Global Pipeline
        </Link>
        <div className="flex items-center gap-2 mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          <Globe className="w-3.5 h-3.5" />
          <span>Global Expansion &amp; Regional Control</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
          Operating Countries & Pay Rates
        </h1>
        <p className="text-sm text-zinc-600 mt-1 max-w-2xl">
          Add and manage the geographic territories where Amora operates. These countries populate creator registration, manager jurisdictional scoping (e.g. Roshan managing Nepal & India), and campaign budgets.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Add Country Form */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm sticky top-24">
            <div className="flex items-center gap-2 pb-4 mb-4 border-b border-zinc-100">
              <Plus className="w-4 h-4 text-zinc-900" />
              <h2 className="text-sm font-semibold text-zinc-900">Add Operating Country</h2>
            </div>

            <form action={createCountryAction} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Country Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Nepal, Japan, Brazil"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Country Code
                  </label>
                  <input
                    type="text"
                    name="code"
                    maxLength={3}
                    placeholder="e.g. NP, JP"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Currency
                  </label>
                  <input
                    type="text"
                    name="currency"
                    maxLength={4}
                    placeholder="e.g. NPR, USD"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Default Pay Rate (Weekly Batch)
                </label>
                <input
                  type="text"
                  name="defaultRate"
                  placeholder="e.g. $75 / week or $100 / week"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
                />
                <span className="text-[11px] text-zinc-400 mt-1 block">
                  e.g., $75 for Nepal & India, $100 for Global & US.
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-lg bg-black text-white text-xs font-medium hover:bg-zinc-800 transition shadow-sm"
              >
                Add Country
              </button>
            </form>
          </div>
        </div>

        {/* Right: Existing Countries List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900">
              Configured Countries ({countries.length})
            </h2>
            <span className="text-xs text-zinc-500">
              Active in manager assignments & campaigns
            </span>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm divide-y divide-zinc-100">
            {countries.map((country) => {
              const numCreators = creatorCounts[country.name] || 0;
              const numProjects = projectCounts[country.name] || 0;

              return (
                <div
                  key={country.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50/60 transition"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-zinc-100 text-zinc-700 font-bold text-xs flex items-center justify-center shrink-0 border border-zinc-200 uppercase">
                      {country.code || country.name.slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-zinc-900">
                          {country.name}
                        </span>
                        {country.isActive ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            Active
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500 border border-zinc-200">
                            Inactive
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 mt-1">
                        {country.currency && (
                          <span className="font-mono">{country.currency}</span>
                        )}
                        {country.defaultRate && (
                          <span className="inline-flex items-center gap-1 font-medium text-zinc-700">
                            <DollarSign className="w-3 h-3 text-zinc-400" />
                            Standard Rate: {country.defaultRate}
                          </span>
                        )}
                        <span className="text-zinc-400">&bull;</span>
                        <span>{numCreators} creators</span>
                        <span className="text-zinc-400">&bull;</span>
                        <span>{numProjects} projects</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {/* Only allow deleting if not Global */}
                    {country.name !== "Global" && (
                      <form
                        action={async () => {
                          "use server";
                          await deleteCountryAction(country.id);
                        }}
                      >
                        <button
                          type="submit"
                          title="Delete country"
                          className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              );
            })}

            {countries.length === 0 && (
              <div className="p-8 text-center text-xs text-zinc-500">
                No countries added yet. Add one using the form.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
