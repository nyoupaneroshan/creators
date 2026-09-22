"use client";

import React, { useState } from "react";
import Link from "next/link";
import { loginAction, quickDemoLoginAction } from "@/app/actions/auth";
import { Shield, User, Lock, Mail, ArrowRight, AlertCircle, Loader2, MapPin } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await loginAction(formData);
      if (res?.error) {
        setError(res.error);
        setLoading(false);
      }
    } catch (err: any) {
      if (err?.message !== "NEXT_REDIRECT") {
        setError(err.message || "Failed to sign in. Check your credentials.");
        setLoading(false);
      }
    }
  }

  const handleDemoClick = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await quickDemoLoginAction(email);
    } catch (err: any) {
      if (err?.message !== "NEXT_REDIRECT") {
        setError(err.message || "Demo login failed.");
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-zinc-50">
      <div className="max-w-md w-full space-y-5">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold text-base mb-3 shadow-xs">
            A
          </div>
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
            Sign in to Amora
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            Access your creator dashboard, manager portal, or admin pipeline
          </p>
        </div>

        {/* 1-Click Demo Logins & Test Credentials */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
            <span className="text-[11px] font-bold text-zinc-900 uppercase tracking-wider">
              Quick Sign In (Test Credentials)
            </span>
            <span className="text-[10px] text-zinc-400">Click to login directly</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Roshan Manager Button */}
            <button
              type="button"
              onClick={() => handleDemoClick("roshan@amora.io")}
              disabled={loading}
              className="p-3 rounded-xl text-left border border-zinc-200 hover:border-black bg-zinc-50/60 hover:bg-zinc-100 transition shadow-2xs group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-zinc-700" />
                  Roshan (Manager)
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-800 font-semibold">
                  Nepal &amp; India
                </span>
              </div>
              <div className="text-[10px] text-zinc-500 font-mono">
                roshan@amora.io &bull; manager123
              </div>
            </button>

            {/* Super Admin */}
            <button
              type="button"
              onClick={() => handleDemoClick("admin@amora.io")}
              disabled={loading}
              className="p-3 rounded-xl text-left border border-zinc-200 hover:border-black bg-zinc-50/60 hover:bg-zinc-100 transition shadow-2xs group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-zinc-700" />
                  Super Admin
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-800 font-semibold">
                  Global
                </span>
              </div>
              <div className="text-[10px] text-zinc-500 font-mono">
                admin@amora.io &bull; admin123
              </div>
            </button>

            {/* Nepal Creator: Aarav */}
            <button
              type="button"
              onClick={() => handleDemoClick("aarav@example.com")}
              disabled={loading}
              className="p-3 rounded-xl text-left border border-zinc-200 hover:border-black bg-zinc-50/60 hover:bg-zinc-100 transition shadow-2xs group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-zinc-700" />
                  Aarav Sharma
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-800 font-semibold">
                  Nepal (Hired)
                </span>
              </div>
              <div className="text-[10px] text-zinc-500 font-mono">
                aarav@example.com &bull; creator123
              </div>
            </button>

            {/* India Creator: Priya */}
            <button
              type="button"
              onClick={() => handleDemoClick("priya@example.com")}
              disabled={loading}
              className="p-3 rounded-xl text-left border border-zinc-200 hover:border-black bg-zinc-50/60 hover:bg-zinc-100 transition shadow-2xs group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-zinc-700" />
                  Priya Patel
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-800 font-semibold">
                  India (Shortlist)
                </span>
              </div>
              <div className="text-[10px] text-zinc-500 font-mono">
                priya@example.com &bull; creator123
              </div>
            </button>
          </div>
        </div>

        {/* Regular Login Form */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-7 shadow-xs">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 rounded-lg bg-black hover:bg-zinc-800 text-white font-medium text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-xs"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-zinc-100 text-center">
            <p className="text-xs text-zinc-500">
              New creator?{" "}
              <Link
                href="/register"
                className="text-zinc-900 hover:underline font-semibold"
              >
                Apply to Amora &rarr;
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
