export type Role = "CREATOR" | "MANAGER" | "ADMIN";

export type ApplicationStatus =
  | "PENDING_REVIEW"
  | "VIEWED"
  | "SHORTLISTED"
  | "HIRED"
  | "DECLINED";

export type AssignmentStatus =
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "APPROVED";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  assignedCountry?: string | null;
  creatorProfileId?: string | null;
}

export const COUNTRIES = [
  "Nepal",
  "India",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "Global",
] as const;

export type CountryName = (typeof COUNTRIES)[number] | string;

/**
 * Parses comma-separated assigned countries for managers (e.g. "Nepal, India" -> ["Nepal", "India"])
 */
export function getManagerCountries(assignedCountry?: string | null): string[] {
  if (!assignedCountry) return [];
  return assignedCountry
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
}

/**
 * Checks if a manager has jurisdiction over a given country
 */
export function isManagerForCountry(
  assignedCountry: string | null | undefined,
  targetCountry: string
): boolean {
  if (!assignedCountry) return false;
  const list = getManagerCountries(assignedCountry);
  if (list.includes("Global") || list.includes("All")) return true;
  return list.some(
    (c) => c.toLowerCase() === targetCountry.toLowerCase()
  );
}

export const SUPPORTED_PLATFORMS = [
  "TikTok",
  "Instagram Reels",
  "YouTube Shorts",
  "Facebook Reels",
] as const;

export const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; dot: string; bg: string; text: string; border: string; description: string }
> = {
  PENDING_REVIEW: {
    label: "Application Received",
    dot: "bg-zinc-400",
    bg: "bg-zinc-100",
    text: "text-zinc-700",
    border: "border-zinc-200",
    description: "Your application has been received and is queued for your country talent manager.",
  },
  VIEWED: {
    label: "Under Review",
    dot: "bg-zinc-700",
    bg: "bg-zinc-100",
    text: "text-zinc-800",
    border: "border-zinc-300",
    description: "Your location talent manager has opened your profile and is reviewing your sample videos.",
  },
  SHORTLISTED: {
    label: "Shortlisted",
    dot: "bg-white",
    bg: "bg-zinc-900",
    text: "text-white",
    border: "border-zinc-900",
    description: "Congratulations! You made the shortlist for upcoming weekly video production.",
  },
  HIRED: {
    label: "Hired & Active",
    dot: "bg-white",
    bg: "bg-black text-white font-semibold",
    text: "text-white",
    border: "border-black",
    description: "You are hired! You are assigned to active weekly video projects in your country.",
  },
  DECLINED: {
    label: "Not Selected",
    dot: "bg-zinc-400",
    bg: "bg-zinc-100",
    text: "text-zinc-500",
    border: "border-zinc-200",
    description: "Thank you for applying. Your info remains in our roster for future briefs.",
  },
};
