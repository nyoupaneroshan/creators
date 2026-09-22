import { CheckCircle2, Clock, FileText, MessageSquare, CreditCard } from "lucide-react";

interface ProfileOnboardingProps {
  status: string;
  contractSignedAt?: Date | string | null;
  contractSignedName?: string | null;
  discordJoinedAt?: Date | string | null;
  payoutDetails?: string | null;
  onboardingComplete: boolean;
}

export function CreatorOnboardingStatusSummary({
  profile,
}: {
  profile: ProfileOnboardingProps;
}) {
  if (profile.status !== "HIRED") return null;

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
            Post-Hiring Onboarding Status
          </span>
          {profile.onboardingComplete ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-2.5 h-2.5" />
              Onboarding Complete
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              <Clock className="w-2.5 h-2.5" />
              In Progress
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        {/* Contract */}
        <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200/80">
          <div className="flex items-center gap-1.5 text-zinc-500 font-semibold text-[10px] uppercase mb-1">
            <FileText className="w-3 h-3" />
            <span>Service Agreement</span>
          </div>
          {profile.contractSignedAt ? (
            <div className="text-emerald-700 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Signed by {profile.contractSignedName || "Creator"}</span>
            </div>
          ) : (
            <div className="text-amber-600 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>Pending Signature</span>
            </div>
          )}
        </div>

        {/* Discord */}
        <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200/80">
          <div className="flex items-center gap-1.5 text-zinc-500 font-semibold text-[10px] uppercase mb-1">
            <MessageSquare className="w-3 h-3" />
            <span>Discord Hub</span>
          </div>
          {profile.discordJoinedAt ? (
            <div className="text-emerald-700 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Community Joined</span>
            </div>
          ) : (
            <div className="text-amber-600 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>Not Joined Yet</span>
            </div>
          )}
        </div>

        {/* Payout Details */}
        <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200/80">
          <div className="flex items-center gap-1.5 text-zinc-500 font-semibold text-[10px] uppercase mb-1">
            <CreditCard className="w-3 h-3" />
            <span>Weekly Payout Info</span>
          </div>
          {profile.payoutDetails ? (
            <div className="text-zinc-900 font-mono font-medium truncate" title={profile.payoutDetails}>
              {profile.payoutDetails}
            </div>
          ) : (
            <div className="text-amber-600 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>Pending Setup</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
