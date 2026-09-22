"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  updateCreatorStatusByManagerAction,
  assignCreatorToProjectByManagerAction,
} from "@/app/actions/manager";
import { StatusBadge } from "./StatusBadge";
import { VideoEmbedPlayer } from "./VideoEmbedPlayer";
import {
  Search,
  MapPin,
  Video,
  CheckCircle,
  Briefcase,
  XCircle,
  ChevronRight,
  Loader2,
  Share2,
  X,
} from "lucide-react";

export interface ManagerCreatorItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  country: string;
  location: string | null;
  status: string;
  statusMessage: string | null;
  adminRating: number | null;
  createdAt: Date | string;
  instagramHandle: string | null;
  tiktokHandle: string | null;
  rateExpectation: string | null;
  sampleVideos: Array<{
    id: string;
    title: string;
    url: string;
    description: string | null;
  }>;
  currentProjectTitle?: string | null;
  currentPayout?: string | null;
}

export interface ManagerProjectOption {
  id: string;
  title: string;
  country: string;
  budget: string | null;
  deliverables: string;
}

interface ManagerCreatorPipelineProps {
  creators: ManagerCreatorItem[];
  availableProjects: ManagerProjectOption[];
  managerCountries: string[];
}

export function ManagerCreatorPipeline({
  creators,
  availableProjects,
  managerCountries,
}: ManagerCreatorPipelineProps) {
  const [selectedCountry, setSelectedCountry] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Video modal preview
  const [previewVideo, setPreviewVideo] = useState<{ url: string; title: string } | null>(null);

  // Assign project modal
  const [assigningCreator, setAssigningCreator] = useState<ManagerCreatorItem | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Filter creators
  const filteredCreators = useMemo(() => {
    return creators.filter((c) => {
      const matchCountry =
        selectedCountry === "ALL" || c.country.toLowerCase() === selectedCountry.toLowerCase();

      const matchStatus =
        statusFilter === "ALL" || c.status === statusFilter;

      const matchSearch =
        searchTerm === "" ||
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.phone && c.phone.includes(searchTerm)) ||
        (c.instagramHandle && c.instagramHandle.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.tiktokHandle && c.tiktokHandle.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchCountry && matchStatus && matchSearch;
    });
  }, [creators, selectedCountry, statusFilter, searchTerm]);

  const handleStatusChange = async (creatorId: string, newStatus: string) => {
    try {
      setIsSubmitting(true);
      await updateCreatorStatusByManagerAction(creatorId, newStatus);
      setActionSuccess(`Creator updated to ${newStatus}`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningCreator || !selectedProjectId) return;

    try {
      setIsSubmitting(true);
      const proj = availableProjects.find((p) => p.id === selectedProjectId);
      await assignCreatorToProjectByManagerAction(
        selectedProjectId,
        assigningCreator.id,
        proj?.budget || undefined
      );
      setActionSuccess(`Hired ${assigningCreator.name} for ${proj?.title}!`);
      setAssigningCreator(null);
      setSelectedProjectId("");
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to assign project");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Projects eligible for currently selected creator
  const eligibleProjectsForCreator = useMemo(() => {
    if (!assigningCreator) return [];
    return availableProjects.filter(
      (p) =>
        p.country === "Global" ||
        p.country.toLowerCase() === assigningCreator.country.toLowerCase()
    );
  }, [assigningCreator, availableProjects]);

  return (
    <div className="space-y-4">
      {actionSuccess && (
        <div className="p-3 bg-zinc-900 text-white text-xs font-semibold rounded-xl flex items-center justify-between shadow-xs">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Country Switcher (If manager has multiple countries, e.g. Nepal & India) */}
      {managerCountries.length > 1 && (
        <div className="flex items-center gap-1.5 p-1 bg-white border border-zinc-200 rounded-xl overflow-x-auto shadow-2xs">
          <span className="text-[11px] font-bold text-zinc-500 uppercase px-3 py-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-zinc-500" />
            Location:
          </span>
          <button
            type="button"
            onClick={() => setSelectedCountry("ALL")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              selectedCountry === "ALL"
                ? "bg-black text-white"
                : "text-zinc-600 hover:text-black hover:bg-zinc-100"
            }`}
          >
            All Assigned ({managerCountries.join(" & ")})
          </button>
          {managerCountries.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setSelectedCountry(c)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                selectedCountry === c
                  ? "bg-black text-white"
                  : "text-zinc-600 hover:text-black hover:bg-zinc-100"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Stage Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { key: "ALL", label: "All Talent" },
            { key: "PENDING_REVIEW", label: "New Applicants" },
            { key: "SHORTLISTED", label: "Shortlisted" },
            { key: "HIRED", label: "Hired (Active)" },
          ].map((tab) => {
            const count =
              tab.key === "ALL"
                ? creators.length
                : creators.filter((c) => c.status === tab.key).length;
            const isActive = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 border whitespace-nowrap ${
                  isActive
                    ? "bg-black text-white border-black shadow-2xs"
                    : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? "bg-zinc-800 text-white" : "bg-zinc-100 text-zinc-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search creator name, phone..."
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black shadow-2xs"
          />
        </div>
      </div>

      {/* Creator Cards Grid */}
      {filteredCreators.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-2xl p-10 text-center text-zinc-400 text-xs">
          <p className="font-semibold text-zinc-700">No creators found</p>
          <p className="mt-1">Try switching country or clearing the search filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredCreators.map((creator) => {
            const hasVideo = creator.sampleVideos.length > 0;
            const firstVideo = creator.sampleVideos[0];

            return (
              <div
                key={creator.id}
                className="bg-white border border-zinc-200 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs hover:border-zinc-300 transition"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-900 font-bold text-sm flex items-center justify-center flex-shrink-0">
                      {creator.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/manager/creators/${creator.id}`}
                          className="font-bold text-sm text-zinc-900 hover:underline"
                        >
                          {creator.name}
                        </Link>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
                          {creator.country}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">
                        {creator.email} {creator.phone ? `• ${creator.phone}` : ""}
                      </div>
                    </div>
                  </div>

                  <StatusBadge status={creator.status} size="sm" />
                </div>

                {/* Handles & Rate Info */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/70 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-zinc-500 text-[10px] uppercase font-semibold block">
                      Target Rate
                    </span>
                    <span className="font-bold text-zinc-900">
                      {creator.rateExpectation || "$75 / week"}
                    </span>
                  </div>

                  {(creator.instagramHandle || creator.tiktokHandle) && (
                    <div className="space-y-0.5 text-right">
                      <span className="text-zinc-500 text-[10px] uppercase font-semibold block">
                        Social Handle
                      </span>
                      <span className="font-medium text-zinc-800">
                        {creator.tiktokHandle ? `@${creator.tiktokHandle}` : `@${creator.instagramHandle}`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Active Project Pill if Hired */}
                {creator.currentProjectTitle && (
                  <div className="p-2 rounded-lg bg-zinc-100 text-xs flex items-center justify-between">
                    <span className="text-zinc-700 font-medium truncate max-w-[220px]">
                      {creator.currentProjectTitle}
                    </span>
                    <span className="font-bold text-zinc-900">
                      {creator.currentPayout || "Active"}
                    </span>
                  </div>
                )}

                {/* Video & Actions */}
                <div className="pt-2 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-2">
                  {hasVideo ? (
                    <button
                      type="button"
                      onClick={() => setPreviewVideo({ url: firstVideo.url, title: firstVideo.title })}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium flex items-center gap-1.5 transition border border-zinc-200"
                    >
                      <Video className="w-3.5 h-3.5 text-zinc-600" />
                      Watch Video ({creator.sampleVideos.length})
                    </button>
                  ) : (
                    <span className="text-[11px] text-zinc-400 italic">No video attached</span>
                  )}

                  {/* One-click Action Buttons */}
                  <div className="flex items-center gap-1.5">
                    {creator.status !== "SHORTLISTED" && creator.status !== "HIRED" && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(creator.id, "SHORTLISTED")}
                        disabled={isSubmitting}
                        className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-zinc-100 border border-zinc-300 text-zinc-800 text-xs font-semibold transition"
                      >
                        Shortlist
                      </button>
                    )}

                    {creator.status !== "HIRED" && (
                      <button
                        type="button"
                        onClick={() => setAssigningCreator(creator)}
                        className="px-3 py-1.5 rounded-lg bg-black hover:bg-zinc-800 text-white text-xs font-semibold flex items-center gap-1 transition shadow-xs"
                      >
                        <Briefcase className="w-3 h-3" />
                        Hire & Assign
                      </button>
                    )}

                    <Link
                      href={`/manager/creators/${creator.id}`}
                      className="p-1.5 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-lg transition"
                      title="View Full Profile"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Video Modal Preview */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 space-y-3 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <h4 className="text-xs font-bold text-zinc-900 truncate">
                {previewVideo.title}
              </h4>
              <button
                type="button"
                onClick={() => setPreviewVideo(null)}
                className="p-1 text-zinc-400 hover:text-black rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <VideoEmbedPlayer url={previewVideo.url} title={previewVideo.title} />
          </div>
        </div>
      )}

      {/* Quick Hire & Assign Project Modal */}
      {assigningCreator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <div>
                <span className="text-[10px] font-bold uppercase text-zinc-400">
                  Assign Project & Hire
                </span>
                <h3 className="text-sm font-bold text-zinc-900">
                  {assigningCreator.name} ({assigningCreator.country})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAssigningCreator(null)}
                className="p-1 text-zinc-400 hover:text-black rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignProject} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Select {assigningCreator.country} Campaign:
                </label>
                {eligibleProjectsForCreator.length === 0 ? (
                  <p className="text-xs text-red-500">
                    No active campaigns found specifically for {assigningCreator.country}. Create one in admin or choose Global.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {eligibleProjectsForCreator.map((proj) => (
                      <label
                        key={proj.id}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition ${
                          selectedProjectId === proj.id
                            ? "bg-zinc-100 border-black font-semibold text-zinc-900"
                            : "bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300"
                        }`}
                      >
                        <div>
                          <div className="font-bold">{proj.title}</div>
                          <div className="text-[11px] text-zinc-500">{proj.deliverables}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-900">{proj.budget}</span>
                          <input
                            type="radio"
                            name="projectId"
                            value={proj.id}
                            checked={selectedProjectId === proj.id}
                            onChange={() => setSelectedProjectId(proj.id)}
                            className="w-4 h-4 text-black focus:ring-black"
                          />
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAssigningCreator(null)}
                  className="px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-medium text-zinc-600 hover:text-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedProjectId || isSubmitting}
                  className="px-4 py-1.5 rounded-lg bg-black hover:bg-zinc-800 text-white text-xs font-bold transition disabled:opacity-50 flex items-center gap-1 shadow-xs"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle className="w-3.5 h-3.5" />
                  )}
                  Confirm Hire & Brief
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
