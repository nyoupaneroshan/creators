import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getManagerCountries } from "@/lib/types";
import { ManagerCreatorPipeline } from "@/components/ManagerCreatorPipeline";
import {
  MapPin,
  Briefcase,
  Users,
} from "lucide-react";

export default async function ManagerDashboardPage() {
  const user = await getSessionUser();

  if (!user || (user.role !== "MANAGER" && user.role !== "ADMIN")) {
    redirect("/login");
  }

  const managerCountries = getManagerCountries(user.assignedCountry);
  if (managerCountries.length === 0) {
    managerCountries.push("Nepal");
  }

  // Scoped query: creators strictly in the manager's assigned countries
  const [creators, projects, otherManagersCount] = await Promise.all([
    prisma.creatorProfile.findMany({
      where: {
        country: { in: managerCountries },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        sampleVideos: {
          select: {
            id: true,
            title: true,
            url: true,
            description: true,
          },
        },
        assignments: {
          include: {
            project: {
              select: {
                id: true,
                title: true,
                brand: true,
                country: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),

    // Projects available for manager's assigned countries or Global
    prisma.project.findMany({
      where: {
        OR: [{ country: { in: managerCountries } }, { country: "Global" }],
        status: "ACTIVE",
      },
      orderBy: { createdAt: "asc" },
    }),

    prisma.user.count({
      where: {
        role: "MANAGER",
      },
    }),
  ]);

  const serializedCreators = creators.map((c) => ({
    id: c.id,
    name: c.user.name,
    email: c.user.email,
    phone: c.phone,
    country: c.country,
    location: c.location,
    status: c.status,
    statusMessage: c.statusMessage,
    adminRating: c.adminRating,
    createdAt: c.createdAt,
    instagramHandle: c.instagramHandle,
    tiktokHandle: c.tiktokHandle,
    rateExpectation: c.rateExpectation,
    sampleVideos: c.sampleVideos,
    currentProjectTitle: c.assignments[0]?.project.title || null,
    currentPayout: c.assignments[0]?.payout || null,
  }));

  const serializedProjects = projects.map((p) => ({
    id: p.id,
    title: p.title,
    country: p.country,
    budget: p.budget,
    deliverables: p.deliverables,
  }));

  const pendingCount = creators.filter((c) => c.status === "PENDING_REVIEW").length;
  const shortlistedCount = creators.filter((c) => c.status === "SHORTLISTED").length;
  const hiredCount = creators.filter((c) => c.status === "HIRED").length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-zinc-50 min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-0.5">
            <MapPin className="w-3.5 h-3.5 text-zinc-700" />
            <span>Talent Management Hub</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">
            {user.name} • {managerCountries.join(" & ")} Pipeline
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Evaluate incoming creator video submissions and match them with country-specific weekly briefs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/manager/projects"
            className="px-3.5 py-1.5 rounded-lg bg-black hover:bg-zinc-800 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
          >
            <Briefcase className="w-3.5 h-3.5" />
            View Active Briefs ({projects.length})
          </Link>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-zinc-200 p-3.5 rounded-xl shadow-xs">
          <span className="text-[11px] font-medium text-zinc-500 block">Total Talent</span>
          <span className="text-xl font-bold text-zinc-900 mt-0.5 block">{creators.length}</span>
        </div>

        <div className="bg-white border border-zinc-200 p-3.5 rounded-xl shadow-xs">
          <span className="text-[11px] font-medium text-zinc-500 block">New Applicants</span>
          <span className="text-xl font-bold text-zinc-900 mt-0.5 block">{pendingCount}</span>
        </div>

        <div className="bg-white border border-zinc-200 p-3.5 rounded-xl shadow-xs">
          <span className="text-[11px] font-medium text-zinc-500 block">Shortlisted</span>
          <span className="text-xl font-bold text-zinc-900 mt-0.5 block">{shortlistedCount}</span>
        </div>

        <div className="bg-white border border-zinc-200 p-3.5 rounded-xl shadow-xs">
          <span className="text-[11px] font-medium text-zinc-500 block">Hired & Active</span>
          <span className="text-xl font-bold text-zinc-900 mt-0.5 block">{hiredCount}</span>
        </div>
      </div>

      {/* Main Interactive Creator Pipeline */}
      <ManagerCreatorPipeline
        creators={serializedCreators}
        availableProjects={serializedProjects}
        managerCountries={managerCountries}
      />
    </div>
  );
}
