import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createProjectAction, removeCreatorAssignmentAction } from "@/app/actions/admin";
import { COUNTRIES } from "@/lib/types";
import { EditProjectModal } from "./EditProjectModal";
import {
  Plus,
  ArrowLeft,
  Users,
  Calendar,
  Trash2,
  Globe,
  Share2,
} from "lucide-react";

export default async function AdminProjectsPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  const [projects, dbCountries] = await Promise.all([
    prisma.project.findMany({
      include: {
        assignments: {
          include: {
            creatorProfile: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.country.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const countryNames =
    dbCountries.length > 0 ? dbCountries.map((c) => c.name) : Array.from(COUNTRIES);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 bg-zinc-50 min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="pb-4 border-b border-zinc-200">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-black transition mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Pipeline
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">
          Country Projects & Weekly Briefs
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Configure country-specific campaigns with localized pay rates (e.g. 15 videos weekly at $75 for Nepal & $100 for Amora Global) and target posting platforms.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Campaign Form */}
        <div>
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-3 shadow-xs">
            <h2 className="text-sm font-semibold text-zinc-900 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-zinc-500" />
              <span>New Campaign Brief</span>
            </h2>

            <form action={createProjectAction} className="space-y-3 pt-1">
              <div>
                <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                  Brand Name *
                </label>
                <input
                  type="text"
                  name="brand"
                  required
                  defaultValue="Amora"
                  placeholder="e.g. Amora"
                  className="w-full px-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Amora — 15 Videos Weekly"
                  className="w-full px-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                    Country *
                  </label>
                  <select
                    name="country"
                    required
                    defaultValue="Nepal"
                    className="w-full px-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-900 focus:outline-none focus:border-black"
                  >
                    <option value="Global">Global (All Locations)</option>
                    {countryNames
                      .filter((c) => c !== "Global")
                      .map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                    Payout Rate
                  </label>
                  <input
                    type="text"
                    name="budget"
                    placeholder="e.g. $75 / week or $100 / week"
                    className="w-full px-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                  Target Posting Platforms
                </label>
                <input
                  type="text"
                  name="targetPlatforms"
                  defaultValue="TikTok, Instagram Reels, YouTube Shorts"
                  placeholder="TikTok, Instagram Reels, YouTube Shorts, Facebook"
                  className="w-full px-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                    Cadence / Due
                  </label>
                  <input
                    type="text"
                    name="deadline"
                    defaultValue="Weekly Ongoing"
                    placeholder="e.g. Weekly Ongoing"
                    className="w-full px-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                    Target Niches
                  </label>
                  <input
                    type="text"
                    name="niches"
                    defaultValue="UGC, Lifestyle, Creator"
                    placeholder="e.g. UGC, Lifestyle"
                    className="w-full px-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                  Required Deliverables *
                </label>
                <textarea
                  name="deliverables"
                  required
                  rows={2}
                  defaultValue="15 short-form videos weekly (15-60s) with clear hook, product pacing, and vertical format."
                  placeholder="e.g. 15x Short-form videos weekly (15-60s)"
                  className="w-full px-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                  Creative Brief / Guidelines
                </label>
                <textarea
                  name="description"
                  rows={2}
                  defaultValue="Produce 15 high-converting vertical videos weekly. Fast turnaround, natural hook within first 2 seconds, high lighting quality."
                  placeholder="Guidelines on hooks, pacing, formatting..."
                  className="w-full px-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-black hover:bg-zinc-800 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Publish Campaign
              </button>
            </form>
          </div>
        </div>

        {/* Existing Projects List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900">
              Active Campaigns ({projects.length})
            </h2>
          </div>

          <div className="space-y-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-3 shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                        {project.brand}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-white flex items-center gap-1">
                        <Globe className="w-2.5 h-2.5" />
                        {project.country}
                      </span>
                      {project.status !== "ACTIVE" && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          {project.status}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-zinc-900">
                      {project.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {project.budget && (
                      <span className="text-xs font-bold text-zinc-900 px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200">
                        {project.budget}
                      </span>
                    )}
                    {project.deadline && (
                      <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {project.deadline}
                      </span>
                    )}

                    <EditProjectModal
                      project={project}
                      countries={countryNames.filter((c) => c !== "Global")}
                    />
                  </div>
                </div>

                <p className="text-xs text-zinc-600 leading-relaxed">
                  {project.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200">
                    <span className="text-zinc-500 block text-[10px] uppercase font-semibold mb-0.5">
                      Deliverables:
                    </span>
                    <span className="text-zinc-800 font-medium">{project.deliverables}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200">
                    <span className="text-zinc-500 block text-[10px] uppercase font-semibold mb-0.5 flex items-center gap-1">
                      <Share2 className="w-3 h-3 text-zinc-400" />
                      Platforms:
                    </span>
                    <span className="text-zinc-800 font-medium">{project.targetPlatforms || "TikTok, Instagram Reels"}</span>
                  </div>
                </div>

                {/* Assigned talent */}
                <div className="pt-2 border-t border-zinc-100">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-zinc-600 font-medium flex items-center gap-1">
                      <Users className="w-3 h-3 text-zinc-500" />
                      Assigned Creators ({project.assignments.length})
                    </span>
                  </div>

                  {project.assignments.length === 0 ? (
                    <p className="text-[11px] text-zinc-400 italic">
                      No creators assigned yet. Country managers can assign matching creators from their dashboard.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {project.assignments.map((assignment) => (
                        <div
                          key={assignment.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-zinc-200 text-xs"
                        >
                          <div>
                            <Link
                              href={`/admin/creators/${assignment.creatorProfile.id}`}
                              className="font-medium text-zinc-900 hover:underline"
                            >
                              {assignment.creatorProfile.user.name}
                            </Link>
                            <span className="text-zinc-500 text-[11px] ml-2">
                              {assignment.creatorProfile.country} &bull; {assignment.payout || "Standard"} &bull; {assignment.status}
                            </span>
                          </div>

                          <form
                            action={async () => {
                              "use server";
                              await removeCreatorAssignmentAction(assignment.id);
                            }}
                          >
                            <button
                              type="submit"
                              className="p-1 text-zinc-400 hover:text-red-500"
                              title="Remove assignment"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </form>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
