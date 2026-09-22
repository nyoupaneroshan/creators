"use client";

import React, { useState } from "react";
import {
  updateCreatorStatusAction,
  saveAdminReviewAction,
  assignCreatorToProjectAction,
  removeCreatorAssignmentAction,
} from "@/app/actions/admin";
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

interface AdminCreatorReviewConsoleProps {
  creatorId: string;
  initialStatus: string;
  initialStatusMessage: string | null;
  initialRating: number | null;
  initialNotes: string | null;
  availableProjects: ProjectOption[];
  currentAssignments: CurrentAssignment[];
}

export function AdminCreatorReviewConsole({
  creatorId,
  initialStatus,
  initialStatusMessage,
  initialRating,
  initialNotes,
  availableProjects,
  currentAssignments,
}: AdminCreatorReviewConsoleProps) {
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
      await updateCreatorStatusAction(creatorId, newStatus, statusMessage);
      showNotification(`Status updated to ${newStatus}`);
    } finally {
      setSavingStatus(false);
    }
  };

  const handleSaveStatusMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingStatus(true);
      await updateCreatorStatusAction(creatorId, status, statusMessage);
      showNotification("Status note sent to creator");
    } finally {
      setSavingStatus(false);
    }
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingReview(true);
      await saveAdminReviewAction(creatorId, rating, notes);
      showNotification("Private evaluation saved");
    } finally {
      setSavingReview(false);
    }
  };

  const handleAssignProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) return;
    try {
      setAssigningProject(true);
      await assignCreatorToProjectAction(
        selectedProjectId,
        creatorId,
        payout,
        assignmentNotes
      );
      setStatus("HIRED");
      setPayout("");
      setAssignmentNotes("");
      showNotification("Assigned to project and marked as Hired");
    } finally {
      setAssigningProject(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast */}
      {successMsg && (
        <div className="p-3 rounded-lg bg-zinc-900 text-white text-xs flex items-center gap-2 shadow-xs">
          <Check className="w-3.5 h-3.5 text-white" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 1. Status Selection */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
            Pipeline Stage
          </h3>
          <span className="text-[11px] text-zinc-500">Current: {status}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
          <button
            type="button"
            onClick={() => handleUpdateStatus("PENDING_REVIEW")}
            disabled={savingStatus}
            className={`px-2 py-1.5 rounded-lg text-xs font-medium transition border ${
              status === "PENDING_REVIEW"
                ? "bg-black text-white border-black"
                : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-100"
            }`}
          >
            Pending
          </button>

          <button
            type="button"
            onClick={() => handleUpdateStatus("VIEWED")}
            disabled={savingStatus}
            className={`px-2 py-1.5 rounded-lg text-xs font-medium transition border ${
              status === "VIEWED"
                ? "bg-black text-white border-black"
                : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-100"
            }`}
          >
            Under Review
          </button>

          <button
            type="button"
            onClick={() => handleUpdateStatus("SHORTLISTED")}
            disabled={savingStatus}
            className={`px-2 py-1.5 rounded-lg text-xs font-medium transition border ${
              status === "SHORTLISTED"
                ? "bg-black text-white border-black"
                : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-100"
            }`}
          >
            Shortlist
          </button>

          <button
            type="button"
            onClick={() => handleUpdateStatus("HIRED")}
            disabled={savingStatus}
            className={`px-2 py-1.5 rounded-lg text-xs font-medium transition border ${
              status === "HIRED"
                ? "bg-black text-white border-black"
                : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-100"
            }`}
          >
            Hire
          </button>

          <button
            type="button"
            onClick={() => handleUpdateStatus("DECLINED")}
            disabled={savingStatus}
            className={`px-2 py-1.5 rounded-lg text-xs font-medium transition border ${
              status === "DECLINED"
                ? "bg-black text-white border-black"
                : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-100"
            }`}
          >
            Decline
          </button>
        </div>

        {/* Status Message */}
        <form onSubmit={handleSaveStatusMessage} className="pt-3 border-t border-zinc-100 space-y-1.5">
          <label className="block text-[11px] font-medium text-zinc-700">
            Note for Creator (Visible on their portal)
          </label>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={statusMessage}
              onChange={(e) => setStatusMessage(e.target.value)}
              placeholder="e.g. Shortlisted for 15 videos/week batch"
              className="flex-1 px-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black"
            />
            <button
              type="submit"
              disabled={savingStatus}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-black text-white rounded-lg text-xs font-medium flex items-center gap-1 transition shadow-xs"
            >
              {savingStatus ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
              Send
            </button>
          </div>
        </form>
      </div>

      {/* 2. Admin Evaluation (Private) */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
            Private Rating & Notes
          </h3>
          <span className="text-[10px] text-zinc-400">Admin Only</span>
        </div>

        <form onSubmit={handleSaveReview} className="space-y-3">
          <div>
            <label className="block text-[11px] text-zinc-600 mb-1">
              Rating (1 to 5)
            </label>
            <StarRating
              value={rating}
              onChange={(val) => setRating(val)}
              size="md"
            />
          </div>

          <div>
            <label className="block text-[11px] text-zinc-600 mb-1">
              Internal Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Fast turnaround, clean voice clarity, suitable for 15 videos weekly..."
              className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black resize-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingReview}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-black text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition shadow-xs"
            >
              <Save className="w-3 h-3" />
              Save Evaluation
            </button>
          </div>
        </form>
      </div>

      {/* 3. Assign to Project */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-zinc-500" />
            <span>Weekly Project Matching</span>
          </h3>
          <span className="text-[11px] text-zinc-500">{currentAssignments.length} Assigned</span>
        </div>

        {currentAssignments.length > 0 && (
          <div className="space-y-1.5 mb-3">
            {currentAssignments.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs"
              >
                <div>
                  <span className="text-zinc-900 font-semibold block">{a.projectTitle}</span>
                  <span className="text-zinc-500 text-[11px]">{a.payout || "Agreed rate"} &bull; {a.status}</span>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    await removeCreatorAssignmentAction(a.id);
                    showNotification("Assignment removed");
                  }}
                  className="p-1 text-zinc-400 hover:text-red-500"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {availableProjects.length > 0 && (
          <form onSubmit={handleAssignProject} className="space-y-2 pt-2 border-t border-zinc-100">
            <div>
              <label className="block text-[11px] text-zinc-600 mb-1">
                Select Project / Batch
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-900 focus:outline-none focus:border-black"
              >
                {availableProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.budget || "Budget flexible"})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={payout}
                onChange={(e) => setPayout(e.target.value)}
                placeholder="Payout (e.g. $75/wk or $100/wk)"
                className="px-2.5 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black"
              />
              <input
                type="text"
                value={assignmentNotes}
                onChange={(e) => setAssignmentNotes(e.target.value)}
                placeholder="Weekly quota instructions"
                className="px-2.5 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black"
              />
            </div>

            <button
              type="submit"
              disabled={assigningProject}
              className="w-full py-2 bg-black hover:bg-zinc-800 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition shadow-xs disabled:opacity-50"
            >
              <Award className="w-3.5 h-3.5" />
              Assign & Mark as Hired
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
