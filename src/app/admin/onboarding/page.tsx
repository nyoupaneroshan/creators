import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateOnboardingConfigAction } from "@/app/actions/admin";
import {
  ClipboardCheck,
  FileText,
  MessageSquare,
  CreditCard,
  FolderGit2,
  Save,
  CheckCircle2,
  Users,
  ArrowLeft,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminOnboardingConfigPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  // Load config (or default)
  let config = await prisma.onboardingConfig.findUnique({
    where: { id: "default" },
  });

  if (!config) {
    config = await prisma.onboardingConfig.create({
      data: {
        id: "default",
        country: "Global",
        welcomeTitle: "Welcome to the Amora Creator Team!",
        welcomeMessage:
          "Congratulations on being hired! Complete this quick 4-step checklist to receive your project briefs and begin your weekly video batches.",
        requireContract: true,
        contractTitle: "Amora Creator Service Agreement (15 Videos Weekly)",
        contractTerms:
          "By signing below, you agree to deliver 15 high-retention vertical short-form videos weekly according to the provided briefs. Content must be original, high resolution (1080p+), and delivered on schedule. Payouts are issued weekly upon batch approval.",
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
      },
    });
  }

  // Hired creator stats
  const hiredCreators = await prisma.creatorProfile.findMany({
    where: { status: "HIRED" },
    select: {
      id: true,
      contractSignedAt: true,
      discordJoinedAt: true,
      payoutDetails: true,
      onboardingComplete: true,
    },
  });

  const totalHired = hiredCreators.length;
  const totalCompleted = hiredCreators.filter((c) => c.onboardingComplete).length;
  const totalContracts = hiredCreators.filter((c) => Boolean(c.contractSignedAt)).length;
  const totalDiscord = hiredCreators.filter((c) => Boolean(c.discordJoinedAt)).length;
  const totalPayoutInfo = hiredCreators.filter((c) => Boolean(c.payoutDetails)).length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
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
          <ClipboardCheck className="w-3.5 h-3.5" />
          <span>Post-Hiring Workflow Customizer</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
          Creator Onboarding Process
        </h1>
        <p className="text-sm text-zinc-600 mt-1 max-w-2xl">
          Customize the post-hiring onboarding steps for creators. You can modify contract terms, Discord invite links, payout instructions, and toggle mandatory milestones.
        </p>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white border border-zinc-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500 font-medium">Hired Creators</span>
            <Users className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-xl font-bold text-zinc-900 mt-1">{totalHired}</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-zinc-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500 font-medium">Contracts Signed</span>
            <FileText className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-xl font-bold text-zinc-900 mt-1">
            {totalContracts} <span className="text-xs text-zinc-400 font-normal">/ {totalHired}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-zinc-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500 font-medium">Discord Joined</span>
            <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-xl font-bold text-zinc-900 mt-1">
            {totalDiscord} <span className="text-xs text-zinc-400 font-normal">/ {totalHired}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-zinc-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500 font-medium">100% Onboarded</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-zinc-900 mt-1">
            {totalCompleted} <span className="text-xs text-zinc-400 font-normal">/ {totalHired}</span>
          </div>
        </div>
      </div>

      {/* Configuration Form */}
      <form action={updateOnboardingConfigAction} className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-zinc-900">
            1. Welcome Header & Instructions
          </h2>
          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1">
              Welcome Title
            </label>
            <input
              type="text"
              name="welcomeTitle"
              defaultValue={config.welcomeTitle}
              required
              className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1">
              Welcome Message / Subtitle
            </label>
            <textarea
              name="welcomeMessage"
              rows={2}
              defaultValue={config.welcomeMessage}
              className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black resize-none"
            />
          </div>
        </div>

        {/* Contract Section */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-zinc-900" />
              <h2 className="text-sm font-semibold text-zinc-900">
                2. Creator Service Agreement (Digital Signature)
              </h2>
            </div>
            <label className="flex items-center gap-2 text-xs text-zinc-700 cursor-pointer font-medium">
              <input
                type="checkbox"
                name="requireContract"
                value="true"
                defaultChecked={config.requireContract}
                className="rounded text-black focus:ring-black"
              />
              Require Contract Step
            </label>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Agreement Title
              </label>
              <input
                type="text"
                name="contractTitle"
                defaultValue={config.contractTitle}
                className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Agreement Terms & Deliverables Description
              </label>
              <textarea
                name="contractTerms"
                rows={4}
                defaultValue={config.contractTerms}
                placeholder="Enter contract clause or deliverables expectations here..."
                className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
              />
              <span className="text-[11px] text-zinc-400 mt-1 block">
                Creators will review these terms and sign with their legal name before starting production.
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                External Contract Document Link (Optional)
              </label>
              <input
                type="url"
                name="contractLink"
                defaultValue={config.contractLink || ""}
                placeholder="https://docs.google.com/document/d/... or DocuSign URL"
                className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>
        </div>

        {/* Discord Section */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-zinc-900" />
              <h2 className="text-sm font-semibold text-zinc-900">
                3. Discord Community Hub
              </h2>
            </div>
            <label className="flex items-center gap-2 text-xs text-zinc-700 cursor-pointer font-medium">
              <input
                type="checkbox"
                name="requireDiscord"
                value="true"
                defaultChecked={config.requireDiscord}
                className="rounded text-black focus:ring-black"
              />
              Require Discord Step
            </label>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Discord Server Invite URL
              </label>
              <input
                type="url"
                name="discordInviteUrl"
                defaultValue={config.discordInviteUrl}
                required
                placeholder="https://discord.gg/your-community"
                className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Discord Community Instructions
              </label>
              <textarea
                name="discordDescription"
                rows={2}
                defaultValue={config.discordDescription}
                className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black resize-none"
              />
            </div>
          </div>
        </div>

        {/* Payout Details Section */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-zinc-900" />
              <h2 className="text-sm font-semibold text-zinc-900">
                4. Creator Payout & Banking Setup
              </h2>
            </div>
            <label className="flex items-center gap-2 text-xs text-zinc-700 cursor-pointer font-medium">
              <input
                type="checkbox"
                name="requirePaymentInfo"
                value="true"
                defaultChecked={config.requirePaymentInfo}
                className="rounded text-black focus:ring-black"
              />
              Require Payout Info Step
            </label>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Payout Guidance & Instructions
              </label>
              <textarea
                name="paymentInstructions"
                rows={3}
                defaultValue={config.paymentInstructions}
                className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
              />
              <span className="text-[11px] text-zinc-400 mt-1 block">
                Guide creators on acceptable formats (e.g. eSewa / Khalti phone numbers for Nepal, UPI IDs for India, PayPal or Bank IBAN for Global).
              </span>
            </div>
          </div>
        </div>

        {/* Creative Drive Section */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-zinc-900" />
              <h2 className="text-sm font-semibold text-zinc-900">
                5. Creative Drive & Brand Assets
              </h2>
            </div>
            <label className="flex items-center gap-2 text-xs text-zinc-700 cursor-pointer font-medium">
              <input
                type="checkbox"
                name="requireDriveAccess"
                value="true"
                defaultChecked={config.requireDriveAccess}
                className="rounded text-black focus:ring-black"
              />
              Enable Creative Drive Step
            </label>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Drive / Notion Guidelines Folder URL
              </label>
              <input
                type="url"
                name="driveUrl"
                defaultValue={config.driveUrl || ""}
                placeholder="https://drive.google.com/drive/folders/..."
                className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Drive Instructions & Guidelines
              </label>
              <textarea
                name="driveInstructions"
                rows={2}
                defaultValue={config.driveInstructions}
                className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black resize-none"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md border border-zinc-200 rounded-xl p-4 shadow-lg flex items-center justify-between">
          <div className="text-xs text-zinc-500">
            Changes will take effect immediately across all hired creators&apos; onboarding portals.
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-black text-white text-xs font-medium hover:bg-zinc-800 transition shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            Save Onboarding Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
