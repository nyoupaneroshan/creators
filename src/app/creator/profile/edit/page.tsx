import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  updateCreatorProfileAction,
  addSampleVideoAction,
  deleteSampleVideoAction,
} from "@/app/actions/creator";
import { COUNTRIES } from "@/lib/types";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Film,
  User,
} from "lucide-react";

export default async function EditCreatorProfilePage() {
  const user = await getSessionUser();
  if (!user || user.role !== "CREATOR") {
    redirect("/login");
  }

  const [profile, dbCountries] = await Promise.all([
    prisma.creatorProfile.findUnique({
      where: { userId: user.id },
      include: {
        sampleVideos: {
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    prisma.country.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!profile) {
    redirect("/register");
  }

  const countryNames =
    dbCountries.length > 0 ? dbCountries.map((c) => c.name) : Array.from(COUNTRIES);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 bg-zinc-50 min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
        <Link
          href="/creator/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-black transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </Link>
        <span className="text-xs text-zinc-400">Editing {user.name}</span>
      </div>

      <div>
        <h1 className="text-xl font-bold text-zinc-900">
          Update Profile & Videos
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Update your contact details, rate expectations, and sample video clips.
        </p>
      </div>

      {/* Main Form */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4 shadow-xs">
        <h2 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
          <User className="w-4 h-4 text-zinc-500" />
          General & Social Information
        </h2>

        <form action={updateCreatorProfileAction} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                defaultValue={profile.phone || ""}
                placeholder="+977 980-0000000"
                className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Location (City, Country)
              </label>
              <input
                type="text"
                name="location"
                defaultValue={profile.location || ""}
                placeholder="e.g. Kathmandu, Nepal"
                className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Country
              </label>
              <select
                name="country"
                defaultValue={profile.country || "Nepal"}
                className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-900 focus:outline-none focus:border-black"
              >
                {countryNames.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Target Platforms
              </label>
              <input
                type="text"
                name="platforms"
                defaultValue={profile.platforms || "TikTok, Instagram Reels"}
                placeholder="TikTok, Instagram Reels, YouTube Shorts"
                className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Content Niches
              </label>
              <input
                type="text"
                name="niches"
                defaultValue={profile.niches || ""}
                placeholder="UGC, Lifestyle, Nepal"
                className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Rate Expectation
              </label>
              <input
                type="text"
                name="rateExpectation"
                defaultValue={profile.rateExpectation || ""}
                placeholder="e.g. $75 / week (Nepal) or $100 / week (Amora)"
                className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Bio / Pitch
              </label>
              <textarea
                name="bio"
                rows={2}
                defaultValue={profile.bio || ""}
                placeholder="Brief intro on your production setup..."
                className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black resize-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 space-y-3">
            <h3 className="text-xs font-semibold text-zinc-900">
              Social Media Accounts
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                name="instagramHandle"
                defaultValue={profile.instagramHandle || ""}
                placeholder="Instagram: @handle"
                className="px-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black"
              />

              <input
                type="text"
                name="instagramFollowers"
                defaultValue={profile.instagramFollowers || ""}
                placeholder="IG Followers (e.g. 25K)"
                className="px-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black"
              />

              <input
                type="text"
                name="tiktokHandle"
                defaultValue={profile.tiktokHandle || ""}
                placeholder="TikTok: @handle"
                className="px-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black"
              />

              <input
                type="text"
                name="tiktokFollowers"
                defaultValue={profile.tiktokFollowers || ""}
                placeholder="TikTok Followers (e.g. 50K)"
                className="px-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black"
              />

              <input
                type="text"
                name="youtubeHandle"
                defaultValue={profile.youtubeHandle || ""}
                placeholder="YouTube Channel"
                className="px-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black"
              />

              <input
                type="url"
                name="portfolioUrl"
                defaultValue={profile.portfolioUrl || ""}
                placeholder="Portfolio URL"
                className="px-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-black hover:bg-zinc-800 text-white font-medium text-xs flex items-center gap-1.5 transition shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Sample Videos Management */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4 shadow-xs">
        <h2 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
          <Film className="w-4 h-4 text-zinc-500" />
          Manage Sample Videos
        </h2>

        <div className="space-y-2">
          {profile.sampleVideos.map((video) => (
            <div
              key={video.id}
              className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-200"
            >
              <div className="min-w-0 pr-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium uppercase px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-700">
                    {video.platform}
                  </span>
                  <h4 className="text-xs font-semibold text-zinc-900 truncate">
                    {video.title}
                  </h4>
                </div>
                <p className="text-[11px] text-zinc-500 truncate mt-0.5 font-mono">
                  {video.url}
                </p>
              </div>

              <form
                action={async () => {
                  "use server";
                  await deleteSampleVideoAction(video.id);
                }}
              >
                <button
                  type="submit"
                  className="p-1.5 text-zinc-400 hover:text-red-500 rounded hover:bg-zinc-100 transition"
                  title="Delete Video"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          ))}
        </div>

        {/* Add video form */}
        <div className="pt-4 border-t border-zinc-100">
          <h3 className="text-xs font-semibold text-zinc-900 mb-3">
            Add Sample Video
          </h3>

          <form action={addSampleVideoAction} className="space-y-3">
            <input
              type="text"
              name="title"
              required
              placeholder="Video Title (e.g. 15s Hook & Reel)"
              className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black"
            />

            <input
              type="url"
              name="url"
              required
              placeholder="Video URL (YouTube, TikTok, Vimeo, or Direct MP4)"
              className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black"
            />

            <input
              type="text"
              name="description"
              placeholder="Description (Optional)"
              className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black"
            />

            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-lg bg-black hover:bg-zinc-800 text-white text-xs font-medium flex items-center gap-1.5 transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Upload Video Link
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
