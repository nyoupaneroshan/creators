import React from "react";
import { ApplicationStatus, STATUS_CONFIG } from "@/lib/types";
import { Check, AlertCircle } from "lucide-react";

interface StatusTrackerProps {
  status: string;
  statusMessage?: string | null;
  viewedAt?: Date | null;
  createdAt?: Date;
}

export function StatusTracker({
  status,
  statusMessage,
  viewedAt,
}: StatusTrackerProps) {
  const steps = [
    {
      id: "PENDING_REVIEW",
      title: "Application Received",
      desc: "Profile submitted to Amora queue",
    },
    {
      id: "VIEWED",
      title: "Under Review",
      desc: viewedAt
        ? `Viewed on ${new Date(viewedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}`
        : "Portfolio sample inspection",
    },
    {
      id: "SHORTLISTED",
      title: "Shortlisted",
      desc: "Selected for weekly video batches",
    },
    {
      id: "HIRED",
      title: "Hired & Matched",
      desc: "Assigned to 15 videos/week campaign",
    },
  ];

  const getStepIndex = (st: string) => {
    switch (st) {
      case "PENDING_REVIEW":
        return 0;
      case "VIEWED":
        return 1;
      case "SHORTLISTED":
        return 2;
      case "HIRED":
        return 3;
      case "DECLINED":
        return -1;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(status);
  const isDeclined = status === "DECLINED";

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-7 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-100">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
            Application Status
          </span>
          <h2 className="text-lg font-bold text-zinc-900 mt-0.5">
            Real-time Pipeline
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {isDeclined ? (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600 border border-zinc-200 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              Not Selected
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-900 border border-zinc-200 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
              {STATUS_CONFIG[status as ApplicationStatus]?.label || "Under Review"}
            </span>
          )}
        </div>
      </div>

      {isDeclined ? (
        <div className="mt-5 p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 leading-relaxed">
          Thank you for applying to Amora. We currently do not have a matching weekly batch for your niche, but your profile remains saved in our talent directory.
        </div>
      ) : (
        <div className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {steps.map((step, idx) => {
              const isPassed = idx < currentIndex;
              const isCurrent = idx === currentIndex;

              return (
                <div
                  key={step.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isCurrent
                      ? "bg-zinc-900 border-zinc-900 text-white shadow-sm"
                      : isPassed
                      ? "bg-zinc-50/80 border-zinc-200 text-zinc-900"
                      : "bg-zinc-50/30 border-zinc-200/60 text-zinc-400"
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold border ${
                        isCurrent
                          ? "bg-white text-black border-white"
                          : isPassed
                          ? "bg-black text-white border-black"
                          : "bg-white text-zinc-400 border-zinc-300"
                      }`}
                    >
                      {isPassed ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
                    </div>
                    <span className="text-xs font-semibold truncate">
                      {step.title}
                    </span>
                  </div>
                  <p className={`text-[11px] leading-normal ${isCurrent ? "text-zinc-300" : "text-zinc-500"}`}>
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {statusMessage && (
            <div className="mt-5 p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs">
              <span className="text-zinc-500 uppercase tracking-wider text-[10px] font-semibold block mb-1">
                Admin Feedback
              </span>
              <p className="text-zinc-800 leading-relaxed font-medium">
                "{statusMessage}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
