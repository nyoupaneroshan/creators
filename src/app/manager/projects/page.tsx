import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getManagerCountries } from "@/lib/types";
import {
  removeCreatorAssignmentByManagerAction,
  assignCreatorToProjectByManagerAction,
} from "@/app/actions/manager";
import {
  ArrowLeft,
  Briefcase,
  Users,
  MapPin,
  Calendar,
  Trash2,
  PlusCircle,
  Share2,
} from "lucide-react";

export default async function ManagerProjectsPage() {
  const user = await getSessionUser();
  if (!user || (user.role !== "MANAGER" && user.role !== "ADMIN")) {
    redirect("/login");
  }

  const managerCountries = getManagerCountries(user.assignedCountry);
  if (managerCountries.length === 0) {
    managerCountries.push("Nepal");
  }

  // Fetch projects applicable to manager's assigned countries or Global
  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { country: { in: managerCountries } },
        { country: "Global" },
      ],
      status: "ACTIVE",
    },
    include: {
      assignments: {
        where: {
          creatorProfile: {
            country: { in: managerCountries },
          },
        },
        include: {
          creatorProfile: {
            include: {
              user: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // Fetch creators in manager's assigned countries
  const availableCreators = await prisma.creatorProfile.findMany({
    where: {
      country: { in: managerCountries },
    },
    include: {
      user: true,
      assignments: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-zinc-50 min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="pb-4 border-b border-zinc-200">
        <Link
          href="/manager/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-black transition mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-0.5">
              <MapPin className="w-3.5 h-3.5 text-zinc-600" />
              <span>{managerCountries.join(" & ")} Operations</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">
              Campaign Briefs & Country Deliverables
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Assign creators to country-matched briefs (e.g. Nepal briefs for Nepal creators, India briefs for India creators).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-800 shadow-2xs">
              Assigned: <strong className="text-black">{managerCountries.join(", ")}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-2xl p-10 text-center text-zinc-500 text-xs">
          <Briefcase className="w-8 h-8 mx-auto mb-2 text-zinc-400" />
          <p className="font-semibold text-zinc-800 text-sm">No active campaigns</p>
          <p className="text-zinc-500 mt-1">
            Super Admins configure campaigns with localized rates for {managerCountries.join(", ")}.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {projects.map((project) => {
            // Find creators eligible for this specific project country
            const assignedCreatorProfileIds = new Set(
              project.assignments.map((a) => a.creatorProfileId)
            );

            // Filter unassigned creators who match this project's country (or all if Global)
            const eligibleUnassigned = availableCreators.filter((c) => {
              if (assignedCreatorProfileIds.has(c.id)) return false;
              if (project.country === "Global") return true;
              return c.country.toLowerCase() === project.country.toLowerCase();
            });

            return (
              <div
                key={project.id}
                className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4 shadow-xs"
              >
                {/* Project Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-zinc-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                        {project.brand}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-black text-white">
                        {project.country}
                      </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-zinc-900">
                      {project.title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    {project.budget && (
                      <span className="text-xs font-bold text-zinc-900 px-2.5 py-1 rounded-md bg-zinc-100 border border-zinc-200">
                        {project.budget}
                      </span>
                    )}
                    {project.deadline && (
                      <span className="text-xs text-zinc-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {project.deadline}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-zinc-600 leading-relaxed">
                  {project.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                    <span className="text-zinc-500 block text-[10px] uppercase font-semibold mb-1">
                      Weekly Deliverables:
                    </span>
                    <span className="text-zinc-900 font-medium">{project.deliverables}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                    <span className="text-zinc-500 block text-[10px] uppercase font-semibold mb-1 flex items-center gap-1">
                      <Share2 className="w-3 h-3 text-zinc-400" />
                      Target Posting Platforms:
                    </span>
                    <span className="text-zinc-900 font-medium">
                      {project.targetPlatforms || "TikTok, Instagram Reels, YouTube Shorts"}
                    </span>
                  </div>
                </div>

                {/* Assigned talent */}
                <div className="pt-3 border-t border-zinc-100 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-700 font-semibold flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-zinc-500" />
                      Assigned Creators ({project.assignments.length})
                    </span>
                  </div>

                  {project.assignments.length === 0 ? (
                    <p className="text-[11px] text-zinc-400 italic">
                      No creators assigned yet to this {project.country} campaign.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {project.assignments.map((assignment) => (
                        <div
                          key={assignment.id}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs"
                        >
                          <div>
                            <Link
                              href={`/manager/creators/${assignment.creatorProfile.id}`}
                              className="font-bold text-zinc-900 hover:underline block"
                            >
                              {assignment.creatorProfile.user.name} ({assignment.creatorProfile.country})
                            </Link>
                            <span className="text-zinc-500 text-[11px]">
                              {assignment.payout || project.budget || "Standard"} &bull; {assignment.status}
                            </span>
                          </div>

                          <form
                            action={async () => {
                              "use server";
                              await removeCreatorAssignmentByManagerAction(assignment.id);
                            }}
                          >
                            <button
                              type="submit"
                              className="p-1.5 text-zinc-400 hover:text-red-500 transition rounded"
                              title="Remove creator from campaign"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </form>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Assign Matching Creator Dropdown */}
                  {eligibleUnassigned.length > 0 && (
                    <div className="pt-2">
                      <form
                        action={async (formData: FormData) => {
                          "use server";
                          const creatorId = formData.get("creatorId") as string;
                          if (creatorId) {
                            await assignCreatorToProjectByManagerAction(
                              project.id,
                              creatorId,
                              project.budget || undefined
                            );
                          }
                        }}
                        className="flex items-center gap-2"
                      >
                        <select
                          name="creatorId"
                          required
                          className="flex-1 px-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-800 focus:outline-none focus:border-black"
                        >
                          <option value="">
                            Assign an eligible {project.country === "Global" ? "" : project.country} creator...
                          </option>
                          {eligibleUnassigned.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.user.name} ({c.country}) — {c.status}
                            </option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          className="px-3.5 py-1.5 bg-black hover:bg-zinc-800 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition shadow-2xs"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          Assign Creator
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
