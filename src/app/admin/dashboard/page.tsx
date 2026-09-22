import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AdminCreatorDirectory } from "@/components/AdminCreatorDirectory";
import {
  Briefcase,
  Shield,
  Users,
  MapPin,
  Globe,
  ClipboardCheck,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const user = await getSessionUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  const [
    totalCreators,
    pendingCount,
    viewedCount,
    shortlistedCount,
    hiredCount,
    activeProjectsCount,
    managersCount,
    creators,
  ] = await Promise.all([
    prisma.creatorProfile.count(),
    prisma.creatorProfile.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.creatorProfile.count({ where: { status: "VIEWED" } }),
    prisma.creatorProfile.count({ where: { status: "SHORTLISTED" } }),
    prisma.creatorProfile.count({ where: { status: "HIRED" } }),
    prisma.project.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({ where: { role: "MANAGER" } }),
    prisma.creatorProfile.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        sampleVideos: {
          select: { id: true },
        },
        assignments: {
          select: { id: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Country metrics aggregation
  const countryCounts: { [country: string]: number } = {};
  creators.forEach((c) => {
    countryCounts[c.country] = (countryCounts[c.country] || 0) + 1;
  });

  const serializedCreators = creators.map((c) => ({
    id: c.id,
    name: c.user.name,
    email: c.user.email,
    phone: c.phone,
    country: c.country,
    location: c.location,
    niches: c.niches,
    platforms: c.platforms || undefined,
    rateExpectation: c.rateExpectation,
    status: c.status,
    statusMessage: c.statusMessage,
    adminRating: c.adminRating,
    viewedAt: c.viewedAt,
    createdAt: c.createdAt,
    instagramHandle: c.instagramHandle,
    instagramFollowers: c.instagramFollowers,
    tiktokHandle: c.tiktokHandle,
    tiktokFollowers: c.tiktokFollowers,
    youtubeHandle: c.youtubeHandle,
    youtubeSubscribers: c.youtubeSubscribers,
    sampleVideosCount: c.sampleVideos.length,
    assignmentsCount: c.assignments.length,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 bg-zinc-50 min-h-[calc(100vh-4rem)]">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-0.5">
            <Shield className="w-3.5 h-3.5 text-zinc-500" />
            <span>Super Admin Central</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">
            Global Talent Pipeline & Operations
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Review incoming creator applicants across all countries, manage weekly briefs, and delegate to local managers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/countries"
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-800 text-xs font-medium flex items-center gap-1.5 transition shadow-2xs"
          >
            <Globe className="w-3.5 h-3.5 text-zinc-600" />
            Countries
          </Link>
          <Link
            href="/admin/onboarding"
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-800 text-xs font-medium flex items-center gap-1.5 transition shadow-2xs"
          >
            <ClipboardCheck className="w-3.5 h-3.5 text-zinc-600" />
            Onboarding Flow
          </Link>
          <Link
            href="/admin/managers"
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-800 text-xs font-medium flex items-center gap-1.5 transition shadow-2xs"
          >
            <Users className="w-3.5 h-3.5 text-zinc-600" />
            Managers ({managersCount})
          </Link>
          <Link
            href="/admin/projects"
            className="px-3.5 py-1.5 rounded-lg bg-black hover:bg-zinc-800 text-white text-xs font-medium flex items-center gap-1.5 transition shadow-2xs"
          >
            <Briefcase className="w-3.5 h-3.5" />
            Projects ({activeProjectsCount})
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-zinc-200 p-3.5 rounded-xl shadow-xs">
          <span className="text-[11px] font-medium text-zinc-500 block">Total Talent</span>
          <span className="text-xl font-bold text-zinc-900 mt-1 block">{totalCreators}</span>
        </div>

        <div className="bg-white border border-zinc-200 p-3.5 rounded-xl shadow-xs">
          <span className="text-[11px] font-medium text-zinc-500 block">Pending Review</span>
          <span className="text-xl font-bold text-zinc-900 mt-1 block">{pendingCount}</span>
        </div>

        <div className="bg-white border border-zinc-200 p-3.5 rounded-xl shadow-xs">
          <span className="text-[11px] font-medium text-zinc-500 block">Under Review</span>
          <span className="text-xl font-bold text-zinc-900 mt-1 block">{viewedCount}</span>
        </div>

        <div className="bg-white border border-zinc-200 p-3.5 rounded-xl shadow-xs">
          <span className="text-[11px] font-medium text-zinc-500 block">Shortlisted</span>
          <span className="text-xl font-bold text-zinc-900 mt-1 block">{shortlistedCount}</span>
        </div>

        <div className="bg-white border border-zinc-200 p-3.5 rounded-xl shadow-xs">
          <span className="text-[11px] font-medium text-zinc-500 block">Hired Active</span>
          <span className="text-xl font-bold text-zinc-900 mt-1 block">{hiredCount}</span>
        </div>

        <div className="bg-white border border-zinc-200 p-3.5 rounded-xl shadow-xs">
          <span className="text-[11px] font-medium text-zinc-500 block">Location Managers</span>
          <span className="text-xl font-bold text-zinc-900 mt-1 block">{managersCount}</span>
        </div>
      </div>

      {/* Country Distribution Overview */}
      <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-zinc-600" />
          <span className="text-xs font-semibold text-zinc-900">Talent Distribution by Country:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(countryCounts).map(([country, count]) => (
            <span
              key={country}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-100 border border-zinc-200 text-xs font-medium text-zinc-800"
            >
              <span>{country}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-zinc-200 text-zinc-800 text-[10px] font-bold">
                {count}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Directory */}
      <AdminCreatorDirectory creators={serializedCreators} />
    </div>
  );
}
