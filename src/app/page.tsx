import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  ArrowRight,
  Check,
  Globe,
  Film,
  Sparkles,
  Users,
} from "lucide-react";

export default async function HomePage() {
  const user = await getSessionUser();

  const [totalCreators, totalProjects, hiredCount, projects] = await Promise.all([
    prisma.creatorProfile.count(),
    prisma.project.count(),
    prisma.creatorProfile.count({ where: { status: "HIRED" } }),
    prisma.project.findMany({
      where: { status: "ACTIVE" },
      take: 2,
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-white">
      {/* Hero Section */}
      <section className="pt-20 pb-20 sm:pt-28 sm:pb-28 border-b border-zinc-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
            Amora Creator Talent &amp; Campaign Management Platform
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-zinc-950 max-w-3xl mx-auto leading-tight">
            Create 15 videos weekly. Get paid every week.
          </h1>

          <p className="mt-5 text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed">
            Amora onboards content creators for recurring weekly video production. Share your info, submit sample reels, and track your hiring pipeline.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            {user ? (
              <Link
                href={
                  user.role === "ADMIN"
                    ? "/admin/dashboard"
                    : user.role === "MANAGER"
                    ? "/manager/dashboard"
                    : "/creator/dashboard"
                }
                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-black hover:bg-zinc-800 text-white font-medium text-xs flex items-center justify-center gap-2 transition shadow-sm"
              >
                Go to{" "}
                {user.role === "ADMIN"
                  ? "Admin Console"
                  : user.role === "MANAGER"
                  ? "Manager Pipeline"
                  : "Creator Dashboard"}
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-6 py-3 rounded-lg bg-black hover:bg-zinc-800 text-white font-medium text-xs flex items-center justify-center gap-2 transition shadow-sm"
                >
                  Apply as Creator
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/login"
                  className="w-full sm:w-auto px-6 py-3 rounded-lg bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 font-medium text-xs flex items-center justify-center gap-2 transition shadow-xs"
                >
                  Portal Sign In
                </Link>
              </>
            )}
          </div>

          {/* Value highlights */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-zinc-600">
            <span className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-zinc-900" /> 15 Videos Weekly Quota
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-zinc-900" /> $75/wk (Nepal &amp; India) &bull; $100/wk (Global)
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-zinc-900" /> In-App Sample Video Review
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-zinc-900" /> Live Application Status
            </span>
          </div>
        </div>
      </section>

      {/* Featured Weekly Creator Opportunities */}
      <section className="py-16 border-b border-zinc-200 bg-zinc-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                Active Creator Opportunities
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 mt-1">
                Featured Weekly Campaigns
              </h2>
            </div>
            <span className="text-xs text-zinc-500">
              Weekly ongoing contracts &bull; Payout upon batch delivery
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-xs flex flex-col justify-between hover:border-zinc-300 transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200 flex items-center gap-1">
                      <Globe className="w-2.5 h-2.5" />
                      {project.country === "Global" ? "Amora Global" : `${project.country} Creators`}
                    </span>
                    <span className="text-base font-bold text-zinc-900">
                      {project.budget || "Competitive Pay"}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-zinc-900">
                    {project.title}
                  </h3>
                  <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                    {project.description}
                  </p>

                  <div className="mt-4 pt-4 border-t border-zinc-100 text-xs space-y-1.5 text-zinc-700">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Deliverables:</span>
                      <span className="font-medium text-zinc-900">{project.deliverables}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Region:</span>
                      <span className="font-medium text-zinc-900">{project.country}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Cadence:</span>
                      <span className="font-medium text-zinc-900">{project.deadline || "Ongoing Weekly"}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Link
                    href="/register"
                    className="w-full py-2.5 rounded-lg bg-zinc-900 hover:bg-black text-white text-xs font-medium flex items-center justify-center gap-1.5 transition"
                  >
                    Apply for this campaign &rarr;
                  </Link>
                </div>
              </div>
            ))}

            {projects.length === 0 && (
              <div className="col-span-2 p-12 text-center text-xs text-zinc-400 bg-white border border-zinc-200 rounded-2xl">
                New campaign briefs are being prepared. Check back shortly.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Two Portals Overview */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Creator Portal Card */}
            <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 block mb-1">
                  For Creators
                </span>
                <h3 className="text-lg font-semibold text-zinc-900">Creator Portal</h3>
                <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                  Apply in minutes, add your social channels and sample video links. Follow your application status live through every pipeline stage.
                </p>

                <div className="mt-4 space-y-2 text-xs text-zinc-700">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-zinc-900" />
                    <span>Real-time status: Submitted &rarr; Viewed &rarr; Shortlisted &rarr; Hired</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-zinc-900" />
                    <span>In-app video portfolio manager</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-zinc-900" />
                    <span>Post-hiring onboarding: contract signing &amp; payout setup</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href="/register"
                  className="text-xs font-semibold text-zinc-900 hover:underline inline-flex items-center gap-1"
                >
                  Register creator profile &rarr;
                </Link>
              </div>
            </div>

            {/* Manager & Admin Console Card */}
            <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 block mb-1">
                  For Talent Leads &amp; Operations
                </span>
                <h3 className="text-lg font-semibold text-zinc-900">Manager &amp; Admin Command Center</h3>
                <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                  Review applicant profiles, watch submitted sample videos directly in the dashboard, shortlist candidates, and manage weekly project batches by location.
                </p>

                <div className="mt-4 space-y-2 text-xs text-zinc-700">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-zinc-900" />
                    <span>Multi-country jurisdiction scoping (e.g. Nepal &amp; India)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-zinc-900" />
                    <span>Watch sample video reels in-app with zero delay</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-zinc-900" />
                    <span>Customize onboarding contracts &amp; Discord community</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href="/login"
                  className="text-xs font-semibold text-zinc-900 hover:underline inline-flex items-center gap-1"
                >
                  Sign in to Operations Console &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
