"use client";

import { useState, useTransition } from "react";
import { updateProjectAction, deleteProjectAction } from "@/app/actions/admin";
import { Edit2, Trash2, X, AlertCircle, Loader2 } from "lucide-react";

interface Project {
  id: string;
  title: string;
  brand: string;
  description: string;
  deliverables: string;
  country: string;
  targetPlatforms: string;
  budget: string | null;
  deadline: string | null;
  status: string;
  niches: string;
}

export function EditProjectModal({
  project,
  countries,
}: {
  project: Project;
  countries: string[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await updateProjectAction(project.id, formData);
        setIsOpen(false);
      } catch (err: any) {
        setError(err.message || "Failed to update project.");
      }
    });
  };

  const handleDelete = () => {
    if (
      !confirm(
        `Are you sure you want to delete "${project.title}"? All creator assignments for this project will also be removed.`
      )
    ) {
      return;
    }

    startTransition(async () => {
      try {
        await deleteProjectAction(project.id);
        setIsOpen(false);
      } catch (err: any) {
        setError(err.message || "Failed to delete project.");
      }
    });
  };

  return (
    <>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded-lg transition"
        >
          <Edit2 className="w-3 h-3 text-zinc-500" />
          Edit
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
          title="Delete campaign"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div
            className="bg-white border border-zinc-200 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div>
                <h3 className="text-base font-bold text-zinc-900">
                  Edit Campaign Brief
                </h3>
                <p className="text-xs text-zinc-500">
                  Update deliverables, pay rate, country scope, or status.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    name="brand"
                    required
                    defaultValue={project.brand}
                    className="w-full px-3 py-1.5 bg-zinc-50 focus:bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                    Status *
                  </label>
                  <select
                    name="status"
                    defaultValue={project.status}
                    className="w-full px-3 py-1.5 bg-zinc-50 focus:bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-black"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  defaultValue={project.title}
                  className="w-full px-3 py-1.5 bg-zinc-50 focus:bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                    Country Scope *
                  </label>
                  <select
                    name="country"
                    defaultValue={project.country}
                    className="w-full px-3 py-1.5 bg-zinc-50 focus:bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-black"
                  >
                    <option value="Global">Global (All Locations)</option>
                    {countries.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                    Weekly Pay Rate
                  </label>
                  <input
                    type="text"
                    name="budget"
                    defaultValue={project.budget || ""}
                    placeholder="e.g. $75 / week or $100 / week"
                    className="w-full px-3 py-1.5 bg-zinc-50 focus:bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                  Target Posting Platforms
                </label>
                <input
                  type="text"
                  name="targetPlatforms"
                  defaultValue={project.targetPlatforms}
                  placeholder="TikTok, Instagram Reels, YouTube Shorts"
                  className="w-full px-3 py-1.5 bg-zinc-50 focus:bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                    Cadence / Deadline
                  </label>
                  <input
                    type="text"
                    name="deadline"
                    defaultValue={project.deadline || ""}
                    placeholder="Weekly Ongoing"
                    className="w-full px-3 py-1.5 bg-zinc-50 focus:bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                    Target Niches
                  </label>
                  <input
                    type="text"
                    name="niches"
                    defaultValue={project.niches}
                    className="w-full px-3 py-1.5 bg-zinc-50 focus:bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                  Required Deliverables *
                </label>
                <textarea
                  name="deliverables"
                  required
                  rows={2}
                  defaultValue={project.deliverables}
                  className="w-full px-3 py-1.5 bg-zinc-50 focus:bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-black resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                  Creative Brief & Instructions
                </label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={project.description}
                  className="w-full px-3 py-1.5 bg-zinc-50 focus:bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-black resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isPending}
                  className="text-xs text-red-600 hover:text-red-700 hover:underline font-medium"
                >
                  Delete Campaign
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-3.5 py-1.5 rounded-lg border border-zinc-200 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-black hover:bg-zinc-800 text-white text-xs font-medium transition shadow-xs disabled:opacity-50"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
