"use client";

import { useState, useTransition } from "react";
import {
  signContractAction,
  confirmDiscordJoinedAction,
  savePayoutDetailsAction,
} from "@/app/actions/creator";
import {
  CheckCircle2,
  Circle,
  FileText,
  MessageSquare,
  CreditCard,
  FolderGit2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2,
  PartyPopper,
} from "lucide-react";

interface OnboardingConfigProps {
  welcomeTitle: string;
  welcomeMessage: string;
  requireContract: boolean;
  contractTitle: string;
  contractTerms: string;
  contractLink?: string | null;
  requireDiscord: boolean;
  discordInviteUrl: string;
  discordDescription: string;
  requirePaymentInfo: boolean;
  paymentInstructions: string;
  requireDriveAccess: boolean;
  driveUrl?: string | null;
  driveInstructions: string;
}

interface CreatorProfileProps {
  id: string;
  contractSignedAt?: Date | string | null;
  contractSignedName?: string | null;
  discordJoinedAt?: Date | string | null;
  payoutDetails?: string | null;
  onboardingComplete: boolean;
  country: string;
}

export function CreatorOnboardingChecklist({
  config,
  profile,
  userName,
}: {
  config: OnboardingConfigProps;
  profile: CreatorProfileProps;
  userName: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [legalName, setLegalName] = useState(profile.contractSignedName || userName);
  const [payoutInput, setPayoutInput] = useState(profile.payoutDetails || "");
  const [isEditingPayout, setIsEditingPayout] = useState(!profile.payoutDetails);
  const [activeStep, setActiveStep] = useState<number | null>(() => {
    if (config.requireContract && !profile.contractSignedAt) return 1;
    if (config.requireDiscord && !profile.discordJoinedAt) return 2;
    if (config.requirePaymentInfo && !profile.payoutDetails) return 3;
    return 4;
  });
  const [error, setError] = useState<string | null>(null);

  // Compute completed count
  let totalSteps = 0;
  let completedSteps = 0;

  if (config.requireContract) {
    totalSteps++;
    if (profile.contractSignedAt) completedSteps++;
  }
  if (config.requireDiscord) {
    totalSteps++;
    if (profile.discordJoinedAt) completedSteps++;
  }
  if (config.requirePaymentInfo) {
    totalSteps++;
    if (profile.payoutDetails) completedSteps++;
  }
  if (config.requireDriveAccess) {
    totalSteps++;
    completedSteps++; // Drive access is read/actionable
  }

  const isAllComplete = completedSteps >= totalSteps && totalSteps > 0;

  const handleSignContract = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!legalName.trim()) {
      setError("Please provide your legal full name.");
      return;
    }

    startTransition(async () => {
      try {
        await signContractAction(legalName);
        setActiveStep(2);
      } catch (err: any) {
        setError(err.message || "Failed to sign agreement.");
      }
    });
  };

  const handleConfirmDiscord = () => {
    setError(null);
    startTransition(async () => {
      try {
        await confirmDiscordJoinedAction();
        setActiveStep(3);
      } catch (err: any) {
        setError(err.message || "Failed to confirm Discord join.");
      }
    });
  };

  const handleSavePayout = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!payoutInput.trim()) {
      setError("Please enter your payout details.");
      return;
    }

    startTransition(async () => {
      try {
        await savePayoutDetailsAction(payoutInput);
        setIsEditingPayout(false);
        setActiveStep(4);
      } catch (err: any) {
        setError(err.message || "Failed to save payout info.");
      }
    });
  };

  return (
    <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-sm space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black text-white">
              Hired Creator Onboarding
            </span>
            {isAllComplete && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                All Steps Complete
              </span>
            )}
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-zinc-900">
            {config.welcomeTitle}
          </h2>
          <p className="text-xs text-zinc-600 mt-1 max-w-xl">
            {config.welcomeMessage}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <div className="text-xs font-semibold text-zinc-700">
            Progress: {completedSteps} / {totalSteps}
          </div>
          <div className="w-32 sm:w-40 bg-zinc-100 rounded-full h-2 mt-1 overflow-hidden border border-zinc-200">
            <div
              className="bg-black h-full rounded-full transition-all duration-300"
              style={{
                width: `${totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Steps Accordion */}
      <div className="space-y-3">
        {/* Step 1: Creator Agreement */}
        {config.requireContract && (
          <div className="border border-zinc-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setActiveStep(activeStep === 1 ? null : 1)}
              className="w-full p-4 text-left flex items-center justify-between hover:bg-zinc-50 transition"
            >
              <div className="flex items-center gap-3">
                {profile.contractSignedAt ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-zinc-300 shrink-0" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-900">
                      Step 1: Sign Creator Agreement
                    </span>
                    {profile.contractSignedAt && (
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                        Signed by {profile.contractSignedName}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    {config.contractTitle}
                  </p>
                </div>
              </div>

              <div className="text-zinc-400">
                {activeStep === 1 ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
            </button>

            {activeStep === 1 && (
              <div className="p-4 pt-0 border-t border-zinc-100 bg-zinc-50/50 space-y-3">
                <div className="p-3 rounded-lg bg-white border border-zinc-200 text-xs text-zinc-700 leading-relaxed max-h-40 overflow-y-auto">
                  <p className="font-semibold text-zinc-900 mb-1">Agreement Terms:</p>
                  <p className="whitespace-pre-line">{config.contractTerms}</p>
                </div>

                {config.contractLink && (
                  <a
                    href={config.contractLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-zinc-700 hover:text-black font-medium underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Read Complete Agreement Document
                  </a>
                )}

                {profile.contractSignedAt ? (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                    <span>
                      Digitally signed on{" "}
                      {new Date(profile.contractSignedAt).toLocaleDateString()} as{" "}
                      <strong>{profile.contractSignedName}</strong>.
                    </span>
                  </div>
                ) : (
                  <form onSubmit={handleSignContract} className="space-y-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                        Type Your Legal Full Name to Sign *
                      </label>
                      <input
                        type="text"
                        value={legalName}
                        onChange={(e) => setLegalName(e.target.value)}
                        placeholder="e.g. Aarav Sharma"
                        required
                        className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-300 bg-white focus:outline-none focus:ring-1 focus:ring-black"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isPending}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white text-xs font-medium hover:bg-zinc-800 transition disabled:opacity-50"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Signing...
                        </>
                      ) : (
                        "I Agree & Electronically Sign"
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Discord Server */}
        {config.requireDiscord && (
          <div className="border border-zinc-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setActiveStep(activeStep === 2 ? null : 2)}
              className="w-full p-4 text-left flex items-center justify-between hover:bg-zinc-50 transition"
            >
              <div className="flex items-center gap-3">
                {profile.discordJoinedAt ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-zinc-300 shrink-0" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-900">
                      Step 2: Join the Private Discord Community
                    </span>
                    {profile.discordJoinedAt && (
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                        Joined
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Connect directly with Roshan & fellow Amora creators.
                  </p>
                </div>
              </div>

              <div className="text-zinc-400">
                {activeStep === 2 ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
            </button>

            {activeStep === 2 && (
              <div className="p-4 pt-0 border-t border-zinc-100 bg-zinc-50/50 space-y-3">
                <p className="text-xs text-zinc-600 leading-relaxed">
                  {config.discordDescription}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <a
                    href={config.discordInviteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-medium transition shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Open Discord Invite
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>

                  {!profile.discordJoinedAt && (
                    <button
                      type="button"
                      onClick={handleConfirmDiscord}
                      disabled={isPending}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-black text-white text-xs font-medium hover:bg-zinc-800 transition disabled:opacity-50"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "I've Joined the Server"
                      )}
                    </button>
                  )}
                </div>

                {profile.discordJoinedAt && (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                    Discord membership confirmed on{" "}
                    {new Date(profile.discordJoinedAt).toLocaleDateString()}.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Payout Details */}
        {config.requirePaymentInfo && (
          <div className="border border-zinc-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setActiveStep(activeStep === 3 ? null : 3)}
              className="w-full p-4 text-left flex items-center justify-between hover:bg-zinc-50 transition"
            >
              <div className="flex items-center gap-3">
                {profile.payoutDetails ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-zinc-300 shrink-0" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-900">
                      Step 3: Setup Weekly Payout Details
                    </span>
                    {profile.payoutDetails && (
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                        Saved
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    {profile.country === "Nepal"
                      ? "eSewa, Khalti, or Nepali Bank Account"
                      : profile.country === "India"
                      ? "UPI ID or Indian Bank Account"
                      : "Bank Transfer, PayPal, or Wise"}
                  </p>
                </div>
              </div>

              <div className="text-zinc-400">
                {activeStep === 3 ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
            </button>

            {activeStep === 3 && (
              <div className="p-4 pt-0 border-t border-zinc-100 bg-zinc-50/50 space-y-3">
                <p className="text-xs text-zinc-600 leading-relaxed">
                  {config.paymentInstructions}
                </p>

                {profile.payoutDetails && !isEditingPayout ? (
                  <div className="p-3 rounded-lg bg-white border border-zinc-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-zinc-500 block text-[10px] uppercase font-semibold">
                        Registered Payout Method:
                      </span>
                      <span className="font-mono font-bold text-zinc-900">
                        {profile.payoutDetails}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEditingPayout(true)}
                      className="text-xs font-semibold text-zinc-700 hover:text-black underline"
                    >
                      Update
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSavePayout} className="space-y-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                        Payout Account / Digital Identifier *
                      </label>
                      <input
                        type="text"
                        value={payoutInput}
                        onChange={(e) => setPayoutInput(e.target.value)}
                        placeholder={
                          profile.country === "Nepal"
                            ? "e.g. eSewa ID: 980-1234567 or Nabil Bank Account"
                            : profile.country === "India"
                            ? "e.g. UPI ID: username@oksbi or HDFC Bank"
                            : "e.g. PayPal email: creator@email.com or Wise IBAN"
                        }
                        required
                        className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-300 bg-white focus:outline-none focus:ring-1 focus:ring-black"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={isPending}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white text-xs font-medium hover:bg-zinc-800 transition disabled:opacity-50"
                      >
                        {isPending ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Payout Details"
                        )}
                      </button>

                      {profile.payoutDetails && (
                        <button
                          type="button"
                          onClick={() => setIsEditingPayout(false)}
                          className="px-3 py-2 rounded-lg border border-zinc-200 text-xs text-zinc-600 hover:bg-zinc-100"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Creative Drive */}
        {config.requireDriveAccess && (
          <div className="border border-zinc-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setActiveStep(activeStep === 4 ? null : 4)}
              className="w-full p-4 text-left flex items-center justify-between hover:bg-zinc-50 transition"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-900">
                      Step 4: Creative Drive & Production Briefs
                    </span>
                    <span className="text-[10px] text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full font-medium">
                      Unlocked
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Access templates, sound cues, and weekly batch scripts.
                  </p>
                </div>
              </div>

              <div className="text-zinc-400">
                {activeStep === 4 ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
            </button>

            {activeStep === 4 && (
              <div className="p-4 pt-0 border-t border-zinc-100 bg-zinc-50/50 space-y-3">
                <p className="text-xs text-zinc-600 leading-relaxed">
                  {config.driveInstructions}
                </p>

                {config.driveUrl && (
                  <a
                    href={config.driveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-black text-white text-xs font-medium transition shadow-xs"
                  >
                    <FolderGit2 className="w-3.5 h-3.5" />
                    Open Creative Drive Folder
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {isAllComplete && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-3">
          <PartyPopper className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <strong className="font-bold">You are fully onboarded!</strong> Your weekly 15-video batch production is active. Your assigned manager (Roshan) will review your weekly deliverables and process your payout.
          </div>
        </div>
      )}
    </div>
  );
}
