"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerCreatorAction, getActiveCountriesAction } from "@/app/actions/auth";
import { COUNTRIES, SUPPORTED_PLATFORMS } from "@/lib/types";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  AlertCircle,
  Loader2,
  Video,
  MapPin,
  Sparkles,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countriesList, setCountriesList] = useState<
    Array<{ name: string; defaultRate: string | null }>
  >([]);

  useEffect(() => {
    getActiveCountriesAction().then((list) => {
      if (list && list.length > 0) {
        setCountriesList(list);
      }
    });
  }, []);

  // Streamlined Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    country: "Nepal",
    phone: "",
    primaryPlatform: "TikTok",
    handle: "",
    sampleVideoUrl: "",
    sampleVideoTitle: "Creator Reel / Hook Sample",
  });

  const matchedCountry = countriesList.find((c) => c.name === formData.country);
  const weeklyRate =
    matchedCountry?.defaultRate ||
    (formData.country === "Nepal" || formData.country === "India"
      ? "$75 / week"
      : "$100 / week");

  const handleCountryChange = (country: string) => {
    setFormData((prev) => ({
      ...prev,
      country,
    }));
  };

  const validateStep1 = () => {
    if (!formData.name.trim()) return "Please enter your full name.";
    if (!formData.email.trim() || !formData.email.includes("@"))
      return "Please enter a valid email address.";
    if (!formData.password || formData.password.length < 6)
      return "Password must be at least 6 characters long.";
    if (!formData.country) return "Please choose your country.";
    return null;
  };

  const validateStep2 = () => {
    if (!formData.sampleVideoUrl.trim()) {
      return "Please paste at least one sample video or reel link.";
    }
    return null;
  };

  const handleNext = () => {
    const err = validateStep1();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setCurrentStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateStep2();
    if (err) {
      setError(err);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const isInstagram = formData.primaryPlatform.includes("Instagram");
      const isTikTok = formData.primaryPlatform.includes("TikTok");
      const isYouTube = formData.primaryPlatform.includes("YouTube");

      const cleanHandle = formData.handle.replace("@", "").trim();

      const res = await registerCreatorAction({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        country: formData.country,
        phone: formData.phone || undefined,
        rateExpectation: `${weeklyRate} (${formData.country})`,
        platforms: [formData.primaryPlatform, "Instagram Reels", "TikTok"],
        niches: ["UGC", "Lifestyle", formData.country],
        instagramHandle: isInstagram ? cleanHandle : undefined,
        tiktokHandle: isTikTok ? cleanHandle : undefined,
        youtubeHandle: isYouTube ? cleanHandle : undefined,
        sampleVideos: [
          {
            title: formData.sampleVideoTitle || "Sample Video",
            url: formData.sampleVideoUrl.trim(),
            description: `Primary platform: ${formData.primaryPlatform}`,
          },
        ],
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        router.push("/creator/dashboard");
      }
    } catch (e: any) {
      setError(e.message || "Failed to submit application.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8 max-w-xl mx-auto bg-zinc-50">
      {/* Top Header */}
      <div className="text-center mb-6">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 bg-zinc-100 px-3 py-1 rounded-full border border-zinc-200">
          Amora Creator Onboarding
        </span>
        <h1 className="text-2xl font-bold text-zinc-900 mt-2">
          Join the Weekly Creator Roster
        </h1>
        <p className="text-xs text-zinc-600 mt-1 max-w-md mx-auto">
          Create 15 short-form videos weekly. Guaranteed weekly pay, fast briefs, and direct manager support.
        </p>
      </div>

      {/* Progress Pills */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            currentStep === 1
              ? "bg-black text-white"
              : "bg-white text-zinc-500 border border-zinc-200"
          }`}
        >
          <span>1. Account & Location</span>
        </div>
        <div className="w-4 h-px bg-zinc-300" />
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            currentStep === 2
              ? "bg-black text-white"
              : "bg-white text-zinc-500 border border-zinc-200"
          }`}
        >
          <span>2. Socials & Sample Video</span>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1 */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Your Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g. Maya Lin"
                className="w-full px-3.5 py-2.5 bg-white border border-zinc-300 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 bg-white border border-zinc-300 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-white border border-zinc-300 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Country *
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-black transition"
                >
                  {(countriesList.length > 0 ? countriesList.map((c) => c.name) : COUNTRIES).map(
                    (c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  WhatsApp / Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+977 980-0000000"
                  className="w-full px-3.5 py-2.5 bg-white border border-zinc-300 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black transition"
                />
              </div>
            </div>

            {/* Dynamic Localized Rate Banner */}
            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/90 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-zinc-700 flex-shrink-0" />
                <div>
                  <span className="font-bold text-zinc-900 block">{formData.country} Creator Campaign</span>
                  <span className="text-[11px] text-zinc-500">15 short-form videos weekly</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-zinc-900 px-2 py-1 rounded-md bg-white border border-zinc-200 block shadow-2xs">
                  {weeklyRate}
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <Link href="/login" className="text-xs text-zinc-500 hover:text-black">
                Already registered? Sign in
              </Link>
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl bg-black hover:bg-zinc-800 text-white font-medium text-xs flex items-center gap-1.5 transition shadow-xs"
              >
                Next: Sample Video
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {currentStep === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Primary Platform You Post On *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["TikTok", "Instagram Reels", "YouTube Shorts"].map((plat) => (
                  <button
                    key={plat}
                    type="button"
                    onClick={() => setFormData({ ...formData, primaryPlatform: plat })}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium transition text-center ${
                      formData.primaryPlatform === plat
                        ? "bg-black text-white border-black"
                        : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300"
                    }`}
                  >
                    {plat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Your Social Handle
              </label>
              <input
                type="text"
                value={formData.handle}
                onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                placeholder="@username (Instagram or TikTok)"
                className="w-full px-3.5 py-2.5 bg-white border border-zinc-300 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Sample Video URL *
              </label>
              <div className="relative">
                <Video className="w-3.5 h-3.5 text-zinc-400 absolute left-3.5 top-3" />
                <input
                  type="url"
                  value={formData.sampleVideoUrl}
                  onChange={(e) => setFormData({ ...formData, sampleVideoUrl: e.target.value })}
                  required
                  placeholder="https://youtube.com/... or tiktok.com/... or Drive link"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-zinc-300 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black transition"
                />
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                Paste any link showing your filming quality, lighting, or pacing (YouTube, TikTok, Reel, or Drive).
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs space-y-1">
              <span className="font-semibold text-zinc-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-zinc-600" />
                Ready to Submit
              </span>
              <p className="text-[11px] text-zinc-500">
                Applying for <strong>{formData.country}</strong> ({weeklyRate} for 15 videos/wk). Your application will be sent directly to your location manager.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl border border-zinc-200 text-zinc-600 hover:text-black text-xs font-medium flex items-center gap-1 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-black hover:bg-zinc-800 text-white font-medium text-xs flex items-center gap-1.5 transition disabled:opacity-50 shadow-xs"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Application
                    <Check className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
