import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { StatusTracker } from "@/components/StatusTracker";
import { VideoEmbedPlayer } from "@/components/VideoEmbedPlayer";
import { CreatorOnboardingChecklist } from "@/components/CreatorOnboardingChecklist";
import {
  MapPin,
  Phone,
  Mail,
  DollarSign,
  Instagram,
  Globe,
  Plus,
  Briefcase,
  Clock,
  Edit3,
  Video,
  Share2,
  Calendar,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default async function CreatorDashboardPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role === "ADMIN") {
    redirect("/admin/dashboard");
  } else if (user.role === "MANAGER") {
    redirect("/manager/dashboard");
  }

  const [profile, onboardingConfig] = await Promise.all([
    prisma.creatorProfile.findUnique({
      where: { userId: user.id },
      include: {
        sampleVideos: {
          orderBy: { createdAt: "desc" },
        },
        assignments: {
          include: {
            project: true,
          },
          orderBy: { assignedAt: "desc" },
        },
      },
    }),
    prisma.onboardingConfig.findUnique({
      where: { id: "default" },
    }),
  ]);

  if (!profile) {
    redirect("/register");
  }

  // Active projects available for this creator's country
  const locationProjects = await prisma.project.findMany({
    where: {
      OR: [{ country: profile.country }, { country: "Global" }],
      status: "ACTIVE",
    },
    orderBy: { createdAt: "asc" },
  });

  const activeAssignment = profile.assignments[0];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-zinc-50 min-h-[calc(100vh-4rem)]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Creator Hub
            </span>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-black text-white flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5" />
              {profile.country}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">
            Hi, {user.name}
          </h1>
          <p className="text-xs text-zinc-600 mt-0.5">
            Your weekly production quotas, campaign briefs, and evaluation status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/creator/profile/edit"
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-800 text-xs font-medium flex items-center gap-1.5 transition shadow-2xs"
          >
            <Edit3 className="w-3.5 h-3.5 text-zinc-500" />
            Edit Profile
          </Link>
        </div>
      </div>

      {/* 1. Real-time Status Tracker */}
      <StatusTracker
        status={profile.status}
        statusMessage={profile.statusMessage}
        viewedAt={profile.viewedAt}
        createdAt={profile.createdAt}
      />

      {/* 2. Post-Hiring Onboarding Checklist */}
      {(profile.status === "HIRED" || activeAssignment) && (
        <CreatorOnboardingChecklist
          config={
            onboardingConfig || {
              welcomeTitle: "Welcome to the Amora Creator Team!",
              welcomeMessage:
                "Congratulations on being hired! Complete this quick checklist to receive your project briefs and begin your weekly video batches.",
              requireContract: true,
              contractTitle: "Amora Creator Service Agreement (15 Videos Weekly)",
              contractTerms:
                "By signing below, you agree to deliver 15 high-retention vertical short-form videos weekly according to the provided briefs. Content must be original, high resolution (1080p+), and delivered on schedule. Payouts are issued weekly upon batch approval.",
              contractLink: null,
              requireDiscord: true,
              discordInviteUrl: "https://discord.gg/amora-creators",
              discordDescription:
                "Join our private Discord community to sync with Roshan, access weekly viral hooks and sound libraries, and receive real-time editing feedback.",
              requirePaymentInfo: true,
              paymentInstructions:
                "Provide your bank account details or digital wallet identifier (e.g. eSewa or Khalti in Nepal, UPI in India, or PayPal/Wise globally) to receive your weekly payments.",
              requireDriveAccess: true,
              driveUrl: "https://drive.google.com/drive/folders/amora-creator-assets",
              driveInstructions:
                "Access brand guidelines, overlay graphics, color grading LUTs, and script templates.",
            }
          }
          profile={profile}
          userName={user.name}
        />
      )}

      {/* 3. Main Active Campaign Highlight if Hired */}
      {activeAssignment ? (
        <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
                  {activeAssignment.project.brand}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black text-white">
                  Active Weekly Campaign
                </span>
              </div>
              <h2 className="text-lg font-bold text-zinc-900">
                {activeAssignment.project.title}
              </h2>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-sm font-extrabold text-zinc-900 px-3 py-1 rounded-lg bg-zinc-100 border border-zinc-200 block">
                {activeAssignment.payout || activeAssignment.project.budget}
              </span>
              <span className="text-[11px] text-zinc-500 mt-0.5 block">
                Guaranteed Weekly Pay
              </span>
            </div>
          </div>

          <p className="text-xs text-zinc-600 leading-relaxed">
            {activeAssignment.project.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
              <span className="text-[10px] font-semibold text-zinc-400 uppercase block mb-0.5">
                Weekly Deliverables
              </span>
              <span className="font-bold text-zinc-900">
                {activeAssignment.project.deliverables}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
              <span className="text-[10px] font-semibold text-zinc-400 uppercase block mb-0.5">
                Target Platforms
              </span>
              <span className="font-bold text-zinc-900">
                {activeAssignment.project.targetPlatforms}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
              <span className="text-[10px] font-semibold text-zinc-400 uppercase block mb-0.5">
                Cadence / Deadline
              </span>
              <span className="font-bold text-zinc-900">
                {activeAssignment.project.deadline || "Weekly Ongoing"}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs text-center space-y-2">
          <Clock className="w-7 h-7 mx-auto text-zinc-400" />
          <h3 className="text-sm font-bold text-zinc-900">
            Application Under Review
          </h3>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            Your manager is reviewing your portfolio. Once shortlisted, your weekly campaign brief ({profile.country === "Nepal" || profile.country === "India" ? "$75/week" : "$100/week"}) will appear right here!
          </p>
        </div>
      )}

      {/* 3. Grid: Details & Sample Videos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Your Profile Summary */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-3.5 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
              Profile Summary
            </h3>
            <Link
              href="/creator/profile/edit"
              className="text-xs text-zinc-500 hover:text-black font-medium"
            >
              Edit
            </Link>
          </div>

          <div className="space-y-2 text-xs text-zinc-700">
            <div className="flex items-center gap-2 text-zinc-600">
              <MapPin className="w-3.5 h-3.5 text-zinc-400" />
              <span>Location: <strong className="text-zinc-900">{profile.country}</strong> {profile.location ? `(${profile.location})` : ""}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-600">
              <Mail className="w-3.5 h-3.5 text-zinc-400" />
              <span>{user.email}</span>
            </div>
            {profile.phone && (
              <div className="flex items-center gap-2 text-zinc-600">
                <Phone className="w-3.5 h-3.5 text-zinc-400" />
                <span>{profile.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-zinc-600">
              <DollarSign className="w-3.5 h-3.5 text-zinc-400" />
              <span>Target: <strong className="text-zinc-900">{profile.rateExpectation || "$75 / week"}</strong></span>
            </div>
          </div>

          {/* Social Handle */}
          {(profile.instagramHandle || profile.tiktokHandle || profile.youtubeHandle) && (
            <div className="pt-2 border-t border-zinc-100 text-xs space-y-1.5">
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                Connected Handles
              </span>
              {profile.instagramHandle && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-zinc-200/80">
                  <span className="text-zinc-700">Instagram: @{profile.instagramHandle}</span>
                  <span className="font-semibold text-zinc-900">{profile.instagramFollowers || "Active"}</span>
                </div>
              )}
              {profile.tiktokHandle && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-zinc-200/80">
                  <span className="text-zinc-700">TikTok: @{profile.tiktokHandle}</span>
                  <span className="font-semibold text-zinc-900">{profile.tiktokFollowers || "Active"}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Sample Videos */}
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-zinc-600" />
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                Submitted Sample Videos ({profile.sampleVideos.length})
              </h3>
            </div>
            <Link
              href="/creator/profile/edit"
              className="text-xs text-black font-semibold flex items-center gap-1 hover:underline"
            >
              <Plus className="w-3 h-3" />
              Add Sample
            </Link>
          </div>

          {profile.sampleVideos.length === 0 ? (
            <div className="py-6 text-center text-zinc-400 text-xs">
              <p>No sample videos submitted yet.</p>
              <Link href="/creator/profile/edit" className="underline mt-1 block text-black font-medium">
                Add video link &rarr;
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profile.sampleVideos.map((v) => (
                <VideoEmbedPlayer
                  key={v.id}
                  url={v.url}
                  title={v.title}
                  description={v.description}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
