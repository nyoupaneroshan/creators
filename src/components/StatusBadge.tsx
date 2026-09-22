import React from "react";
import { ApplicationStatus, STATUS_CONFIG } from "@/lib/types";

interface StatusBadgeProps {
  status: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function StatusBadge({ status, className = "", size = "md" }: StatusBadgeProps) {
  const config =
    STATUS_CONFIG[status as ApplicationStatus] || STATUS_CONFIG.PENDING_REVIEW;

  const sizeClasses = {
    sm: "text-[11px] px-2 py-0.5 gap-1.5",
    md: "text-xs px-2.5 py-1 gap-1.5 font-medium",
    lg: "text-xs px-3 py-1.5 gap-2 font-semibold",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-xs ${sizeClasses[size]} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
}
