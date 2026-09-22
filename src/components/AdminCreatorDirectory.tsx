"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { StatusBadge } from "./StatusBadge";
import { updateCreatorStatusAction } from "@/app/actions/admin";
import {
  Search,
  Filter,
  Eye,
  ChevronRight,
  Star,
  Video,
  MapPin,
  Share2,
} from "lucide-react";

interface CreatorItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  country: string;
  location: string | null;
  niches: string;
  platforms?: string;
  rateExpectation: string | null;
  status: string;
  statusMessage: string | null;
  adminRating: number | null;
  viewedAt: Date | string | null;
  createdAt: Date | string;
  instagramHandle: string | null;
  instagramFollowers: string | null;
  tiktokHandle: string | null;
  tiktokFollowers: string | null;
  youtubeHandle: string | null;
  youtubeSubscribers: string | null;
  sampleVideosCount: number;
  assignmentsCount: number;
}

interface AdminCreatorDirectoryProps {
  creators: CreatorItem[];
}

export function AdminCreatorDirectory({ creators }: AdminCreatorDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [countryFilter, setCountryFilter] = useState("ALL");
  const [nicheFilter, setNicheFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Extract unique countries
  const allCountries = useMemo(() => {
    const set = new Set<string>();
    creators.forEach((c) => {
      if (c.country) set.add(c.country);
    });
    return Array.from(set).sort();
  }, [creators]);

  // Extract unique niches
  const allNiches = useMemo(() => {
    const set = new Set<string>();
    creators.forEach((c) => {
      c.niches.split(",").forEach((n) => {
        const trimmed = n.trim();
        if (trimmed) set.add(trimmed);
      });
    });
    return Array.from(set);
  }, [creators]);

  // Filtered Creators
  const filteredCreators = useMemo(() => {
    return creators.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.instagramHandle && c.instagramHandle.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.location && c.location.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus =
        statusFilter === "ALL" || c.status === statusFilter;

      const matchesCountry =
        countryFilter === "ALL" || c.country === countryFilter;

      const matchesNiche =
        nicheFilter === "ALL" ||
        c.niches.toLowerCase().includes(nicheFilter.toLowerCase());

      return matchesSearch && matchesStatus && matchesCountry && matchesNiche;
    });
  }, [creators, searchTerm, statusFilter, countryFilter, nicheFilter]);

  const handleQuickStatusChange = async (creatorId: string, newStatus: string) => {
    try {
      setUpdatingId(creatorId);
      await updateCreatorStatusAction(creatorId, newStatus);
    } finally {
      setUpdatingId(null);
    }
  };

  const statusTabs = [
    { key: "ALL", label: "All Applicants", count: creators.length },
    {
      key: "PENDING_REVIEW",
      label: "Pending",
      count: creators.filter((c) => c.status === "PENDING_REVIEW").length,
    },
    {
      key: "VIEWED",
      label: "Under Review",
      count: creators.filter((c) => c.status === "VIEWED").length,
    },
    {
      key: "SHORTLISTED",
      label: "Shortlisted",
      count: creators.filter((c) => c.status === "SHORTLISTED").length,
    },
    {
      key: "HIRED",
      label: "Hired",
      count: creators.filter((c) => c.status === "HIRED").length,
    },
    {
      key: "DECLINED",
      label: "Declined",
      count: creators.filter((c) => c.status === "DECLINED").length,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {statusTabs.map((tab) => {
          const isActive = statusFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition flex items-center gap-1.5 border ${
                isActive
                  ? "bg-black text-white border-black shadow-xs"
                  : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:text-zinc-900"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive
                    ? "bg-zinc-800 text-white"
                    : "bg-zinc-100 text-zinc-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search and Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, country, handle, location..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black shadow-2xs"
          />
        </div>

        {/* Country Filter */}
        <div className="relative">
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            aria-label="Filter by country"
            className="px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-700 focus:outline-none focus:border-black appearance-none pr-8 cursor-pointer shadow-2xs"
          >
            <option value="ALL">All Countries</option>
            {allCountries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <MapPin className="w-3 h-3 text-zinc-400 absolute right-2.5 top-3 pointer-events-none" />
        </div>

        {/* Niche Filter */}
        <div className="relative">
          <select
            value={nicheFilter}
            onChange={(e) => setNicheFilter(e.target.value)}
            aria-label="Filter by niche"
            className="px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-700 focus:outline-none focus:border-black appearance-none pr-8 cursor-pointer shadow-2xs"
          >
            <option value="ALL">All Niches</option>
            {allNiches.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <Filter className="w-3 h-3 text-zinc-400 absolute right-2.5 top-3 pointer-events-none" />
        </div>
      </div>

      {/* Creators Table */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
        {filteredCreators.length === 0 ? (
          <div className="p-10 text-center text-zinc-400 text-xs">
            <Eye className="w-6 h-6 mx-auto mb-2 text-zinc-400" />
            <p className="font-semibold text-zinc-700">No applicants found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/80 text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
                  <th className="py-3 px-5">Creator</th>
                  <th className="py-3 px-4">Country & Contact</th>
                  <th className="py-3 px-4">Rate & Platforms</th>
                  <th className="py-3 px-4">Videos</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs">
                {filteredCreators.map((creator) => (
                  <tr
                    key={creator.id}
                    className="hover:bg-zinc-50/80 transition-colors group"
                  >
                    {/* Name & Niches */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-900 font-bold flex items-center justify-center text-xs flex-shrink-0">
                          {creator.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/creators/${creator.id}`}
                            className="font-semibold text-xs text-zinc-900 hover:underline flex items-center gap-1"
                          >
                            <span>{creator.name}</span>
                            <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400" />
                          </Link>
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {creator.niches.split(",").slice(0, 2).map((n) => (
                              <span
                                key={n}
                                className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600 border border-zinc-200/60"
                              >
                                {n.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Country & Contact */}
                    <td className="py-3.5 px-4 text-zinc-600">
                      <div className="space-y-0.5 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-800 border border-zinc-200 text-[10px]">
                            {creator.country}
                          </span>
                          <span className="text-zinc-500 truncate max-w-[110px]">{creator.location || ""}</span>
                        </div>
                        <div className="text-zinc-900 font-medium truncate max-w-[130px]">{creator.email}</div>
                      </div>
                    </td>

                    {/* Rate & Platforms */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5 text-[11px]">
                        {creator.rateExpectation && (
                          <div className="text-zinc-900 font-semibold">
                            {creator.rateExpectation}
                          </div>
                        )}
                        {creator.platforms && (
                          <div className="text-zinc-500 truncate max-w-[160px] flex items-center gap-1">
                            <Share2 className="w-2.5 h-2.5 text-zinc-400" />
                            {creator.platforms}
                          </div>
                        )}
                        {creator.instagramHandle && (
                          <div className="text-zinc-400 text-[10px]">
                            IG: @{creator.instagramHandle} ({creator.instagramFollowers || "N/A"})
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Videos count */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 text-[11px] font-medium border border-zinc-200">
                        <Video className="w-3 h-3 text-zinc-500" />
                        {creator.sampleVideosCount}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <StatusBadge status={creator.status} size="sm" />
                    </td>

                    {/* Rating */}
                    <td className="py-3.5 px-4">
                      {creator.adminRating ? (
                        <div className="flex items-center gap-1 text-zinc-900 text-xs font-semibold">
                          <Star className="w-3 h-3 fill-black" />
                          <span>{creator.adminRating}</span>
                        </div>
                      ) : (
                        <span className="text-zinc-400 text-xs">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {creator.status !== "SHORTLISTED" && creator.status !== "HIRED" && (
                          <button
                            type="button"
                            onClick={() => handleQuickStatusChange(creator.id, "SHORTLISTED")}
                            disabled={updatingId === creator.id}
                            className="px-2 py-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[11px] font-medium transition border border-zinc-200"
                          >
                            Shortlist
                          </button>
                        )}

                        <Link
                          href={`/admin/creators/${creator.id}`}
                          className="px-2.5 py-1 rounded bg-black hover:bg-zinc-800 text-white font-medium text-[11px] transition shadow-xs"
                        >
                          Review
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
