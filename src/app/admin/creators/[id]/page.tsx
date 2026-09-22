import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { markCreatorAsViewedAction } from "@/app/actions/admin";
import { StatusBadge } from "@/components/StatusBadge";
import { VideoEmbedPlayer } from "@/components/VideoEmbedPlayer";
import { AdminCreatorReviewConsole } from "@/components/AdminCreatorReviewConsole";
import { CreatorOnboardingStatusSummary } from "@/components/CreatorOnboardingStatusSummary";
import {
  ArrowLeft,
  Film,
  Eye,
} from "lucide-react";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function AdminCreatorReviewPage({ params }: PageProps) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  const profile = await prisma.creatorProfile.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      sampleVideos: {
        orderBy: { createdAt: "desc" },
      },
      assignments: {
        include: {
          project: true,
        },
      },
    },
  });

  if (!profile) {
    notFound();
  }

  if (profile.status === "PENDING_REVIEW" || !profile.viewedAt) {
    await markCreatorAsViewedAction(profile.id);
  }

  const activeProjects = await prisma.project.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "asc" },
  });

  const nichesList = profile.niches
    ? profile.niches.split(",").map((n) => n.trim())
    : [];

  const currentAssignments = profile.assignments.map((a) => ({
    id: a.id,
    projectId: a.projectId,
    projectTitle: a.project.title,
    projectBrand: a.project.brand,
    status: a.status,
    payout: a.payout,
    notes: a.notes,
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 bg-zinc-50 min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-black transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Pipeline
        </Link>

        <div className="flex items-center gap-2.5">
          <StatusBadge status={profile.status} size="md" />
          {profile.viewedAt && (
            <span className="text-[11px] text-zinc-500 flex items-center gap-1">
              <Eye className="w-3 h-3 text-zinc-400" />
              Viewed {new Date(profile.viewedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Onboarding Milestone Progress (if hired) */}
      <CreatorOnboardingStatusSummary profile={profile} />

      {/* Creator Dossier Card */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-zinc-100">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-900 font-bold text-lg flex items-center justify-center flex-shrink-0">
              {profile.user.name.charAt(0)}
            </div>

            <div>
              <h1 className="text-xl font-bold text-zinc-900">
                {profile.user.name}
              </h1>
              <p className="text-xs text-zinc-600 mt-0.5 max-w-xl">
                {profile.bio || "No biography provided."}
              </p>

              <div className="flex flex-wrap gap-1 mt-2.5">
                {nichesList.map((niche) => (
                  <span
                    key={niche}
                    className="px-2 py-0.5 rounded text-[11px] bg-zinc-100 text-zinc-700 border border-zinc-200 font-medium"
                  >
                    {niche}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {profile.rateExpectation && (
            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-right flex-shrink-0">
              <span className="text-[10px] uppercase font-semibold text-zinc-500 block">
                Target Rate
              </span>
              <span className="text-sm font-bold text-zinc-900 mt-0.5 block">
                {profile.rateExpectation}
              </span>
            </div>
          )}
        </div>

        {/* Contact Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200/80">
            <span className="text-zinc-500 block mb-0.5 text-[10px] uppercase font-semibold">
              Email
            </span>
            <a
              href={`mailto:${profile.user.email}`}
              className="text-zinc-900 font-medium hover:underline truncate block"
            >
              {profile.user.email}
            </a>
          </div>

          <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200/80">
            <span className="text-zinc-500 block mb-0.5 text-[10px] uppercase font-semibold">
              Phone
            </span>
            <span className="text-zinc-900 font-medium block truncate">
              {profile.phone || "—"}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200/80">
            <span className="text-zinc-500 block mb-0.5 text-[10px] uppercase font-semibold">
              Location
            </span>
            <span className="text-zinc-900 font-medium block truncate">
              {profile.location || "Worldwide"}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200/80">
            <span className="text-zinc-500 block mb-0.5 text-[10px] uppercase font-semibold">
              Portfolio
            </span>
            {profile.portfolioUrl ? (
              <a
                href={profile.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-900 font-medium hover:underline truncate block"
              >
                Visit Site &rarr;
              </a>
            ) : (
              <span className="text-zinc-400">—</span>
            )}
          </div>
        </div>

        {/* Social Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
          <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200/80 flex items-center justify-between">
            <span className="text-zinc-500">Instagram:</span>
            <span className="font-semibold text-zinc-900">
              {profile.instagramHandle ? `@${profile.instagramHandle} (${profile.instagramFollowers || "N/A"})` : "—"}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200/80 flex items-center justify-between">
            <span className="text-zinc-500">TikTok:</span>
            <span className="font-semibold text-zinc-900">
              {profile.tiktokHandle ? `@${profile.tiktokHandle} (${profile.tiktokFollowers || "N/A"})` : "—"}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200/80 flex items-center justify-between">
            <span className="text-zinc-500">YouTube:</span>
            <span className="font-semibold text-zinc-900">
              {profile.youtubeHandle ? `${profile.youtubeHandle} (${profile.youtubeSubscribers || "N/A"})` : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Sample Videos & Review Console */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sample Videos */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 mb-4">
              <Film className="w-4 h-4 text-zinc-500" />
              <h3 className="text-sm font-semibold text-zinc-900">
                Submitted Sample Videos ({profile.sampleVideos.length})
              </h3>
            </div>

            {profile.sampleVideos.length === 0 ? (
              <div className="text-center py-8 text-zinc-400 text-xs">
                No sample videos submitted by this applicant.
              </div>
            ) : (
              <div className="space-y-4">
                {profile.sampleVideos.map((video) => (
                  <VideoEmbedPlayer
                    key={video.id}
                    url={video.url}
                    title={video.title}
                    description={video.description}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Review Console */}
        <div>
          <AdminCreatorReviewConsole
            creatorId={profile.id}
            initialStatus={profile.status}
            initialStatusMessage={profile.statusMessage}
            initialRating={profile.adminRating}
            initialNotes={profile.adminNotes}
            availableProjects={activeProjects}
            currentAssignments={currentAssignments}
          />
        </div>
      </div>
    </div>
  );
}
