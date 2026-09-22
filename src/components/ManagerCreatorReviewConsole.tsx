"use client";

import React, { useState } from "react";
import {
  updateCreatorStatusByManagerAction,
  saveManagerReviewAction,
  assignCreatorToProjectByManagerAction,
  removeCreatorAssignmentByManagerAction,
} from "@/app/actions/manager";
import { StarRating } from "./StarRating";
import {
  Check,
  Save,
  Briefcase,
  Trash2,
  Send,
  Loader2,
  Award,
} from "lucide-react";

interface ProjectOption {
  id: string;
  title: string;
  brand: string;
  deliverables: string;
  budget: string | null;
}

interface CurrentAssignment {
  id: string;
  projectId: string;
  projectTitle: string;
  projectBrand: string;
  status: string;
  payout: string | null;
  notes: string | null;
}

interface ManagerCreatorReviewConsoleProps {
  creatorId: string;
  initialStatus: string;
  initialStatusMessage: string | null;
  initialRating: number | null;
  initialNotes: string | null;
  availableProjects: ProjectOption[];
  currentAssignments: CurrentAssignment[];
}

export function ManagerCreatorReviewConsole({
  creatorId,
  initialStatus,
  initialStatusMessage,
  initialRating,
  initialNotes,
  availableProjects,
  currentAssignments,
}: ManagerCreatorReviewConsoleProps) {
  const [status, setStatus] = useState(initialStatus);
  const [statusMessage, setStatusMessage] = useState(initialStatusMessage || "");
  const [rating, setRating] = useState<number | null>(initialRating);
  const [notes, setNotes] = useState(initialNotes || "");

  const [selectedProjectId, setSelectedProjectId] = useState(
    availableProjects[0]?.id || ""
  );
  const [payout, setPayout] = useState("");
  const [assignmentNotes, setAssignmentNotes] = useState("");

  const [savingStatus, setSavingStatus] = useState(false);
  const [savingReview, setSavingReview] = useState(false);
  const [assigningProject, setAssigningProject] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      setSavingStatus(true);
      setStatus(newStatus);
      await updateCreatorStatusByManagerAction(creatorId, newStatus, statusMessage);
      showNotification(`Status updated to ${newStatus}`);
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    } finally {
      setSavingStatus(false);
    }
  };

  const handleSaveStatusMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingStatus(true);
      await updateCreatorStatusByManagerAction(creatorId, status, statusMessage);
      showNotification("Status note sent to creator");
    } catch (err: any) {
      alert(err.message || "Failed to send message");
    } finally {
      setSavingStatus(false);
    }
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingReview(true);
      await saveManagerReviewAction(creatorId, rating, notes);
      showNotification("Manager notes saved");
    } catch (err: any) {
      alert(err.message || "Failed to save review");
    } finally {
      setSavingReview(false);
    }
  };

  const handleAssignProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) return;
    try {
      setAssigningProject(true);
      const proj = availableProjects.find((p) => p.id === selectedProjectId);
      await assignCreatorToProjectByManagerAction(
        selectedProjectId,
        creatorId,
        payout || proj?.budget || undefined,
        assignmentNotes || undefined
      );
      setStatus("HIRED");
      showNotification("Creator hired & assigned to project!");
    } catch (err: any) {
      alert(err.message || "Failed to assign project");
    } finally {
      setAssigningProject(false);
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    try {
      await removeCreatorAssignmentByManagerAction(assignmentId);
      showNotification("Assignment removed");
    } catch (err: any) {
      alert(err.message || "Failed to remove assignment");
    }
  };

  return (
    <div className="space-y-4">
      {successMsg && (
        <div className="p-3 bg-zinc-900 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs">
          <Check className="w-3.5 h-3.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 1. Quick Status Control */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-3 shadow-xs">
        <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
          Application Stage
        </h3>

        <div className="grid grid-cols-2 gap-2">
          {["PENDING_REVIEW", "SHORTLISTED", "HIRED", "DECLINED"].map((s) => {
            const isCurrent = status === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => handleUpdateStatus(s)}
                disabled={savingStatus}
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition border text-center ${
                  isCurrent
                    ? "bg-black text-white border-black shadow-xs"
                    : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300"
                }`}
              >
                {s === "PENDING_REVIEW"
                  ? "Pending"
                  : s === "SHORTLISTED"
                  ? "Shortlisted"
                  : s === "HIRED"
                  ? "Hired"
                  : "Declined"}
              </button>
            );
          })}
        </div>

        {/* Message to Creator */}
        <form onSubmit={handleSaveStatusMessage} className="pt-2 border-t border-zinc-100 space-y-2">
          <label className="block text-[11px] font-semibold text-zinc-500">
            Note visible to Creator:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={statusMessage}
              onChange={(e) => setStatusMessage(e.target.value)}
              placeholder="e.g. Your video pacing looks great, shortlisting for next batch!"
              className="flex-1 px-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black"
            />
            <button
              type="submit"
              disabled={savingStatus}
              className="px-3 py-1.5 bg-black hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition shadow-xs disabled:opacity-50"
            >
              <Send className="w-3 h-3" />
              Update
            </button>
          </div>
        </form>
      </div>

      {/* 2. Assign to Project */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-3 shadow-xs">
        <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5 text-zinc-600" />
          Assign Weekly Campaign
        </h3>

        {/* Active Assignments */}
        {currentAssignments.length > 0 && (
          <div className="space-y-1.5 pb-2 border-b border-zinc-100">
            {currentAssignments.map((a) => (
              <div
                key={a.id}
                className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-zinc-900 block">{a.projectTitle}</span>
                  <span className="text-[11px] text-zinc-500">
                    {a.payout || "Standard"} &bull; {a.status}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveAssignment(a.id)}
                  className="p-1 text-zinc-400 hover:text-red-500"
                  title="Remove from campaign"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {availableProjects.length === 0 ? (
          <p className="text-xs text-zinc-400 italic">No matching campaigns active.</p>
        ) : (
          <form onSubmit={handleAssignProject} className="space-y-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                Select Campaign Brief:
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-900 focus:outline-none focus:border-black"
              >
                {availableProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.budget || "Weekly"})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={assigningProject || !selectedProjectId}
              className="w-full py-2 bg-black hover:bg-zinc-800 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              {assigningProject ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Briefcase className="w-3.5 h-3.5" />
              )}
              Hire & Assign Project
            </button>
          </form>
        )}
      </div>

      {/* 3. Internal Manager Evaluation */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-3 shadow-xs">
        <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-zinc-600" />
          Manager Internal Notes
        </h3>

        <form onSubmit={handleSaveReview} className="space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
              Quality Rating (1-5):
            </label>
            <StarRating
              value={rating || 0}
              onChange={(newRating) => setRating(newRating)}
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
              Private Notes (Internal only):
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Good hook, fast turnarounds. Ready for 15 videos/week batch."
              className="w-full px-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={savingReview}
            className="w-full py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            Save Notes
          </button>
        </form>
      </div>
    </div>
  );
}
