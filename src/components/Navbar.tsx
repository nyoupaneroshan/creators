import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import {
  LayoutDashboard,
  Film,
  Briefcase,
  LogOut,
  User,
  Shield,
  MapPin,
  Users,
  ArrowRight,
  Globe,
  ClipboardCheck,
} from "lucide-react";

export async function Navbar() {
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-6 sm:gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-black text-white font-bold text-sm flex items-center justify-center tracking-tight transition group-hover:bg-zinc-800">
              A
            </div>
            <span className="text-base font-semibold tracking-tight text-zinc-900">
              Amora
            </span>
          </Link>

          {/* Nav links */}
          {user && (
            <nav className="hidden md:flex items-center gap-1 text-xs font-medium">
              {user.role === "ADMIN" ? (
                <>
                  <Link
                    href="/admin/dashboard"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Global Pipeline
                  </Link>
                  <Link
                    href="/admin/projects"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    Projects
                  </Link>
                  <Link
                    href="/admin/countries"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    Countries
                  </Link>
                  <Link
                    href="/admin/onboarding"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition"
                  >
                    <ClipboardCheck className="w-3.5 h-3.5" />
                    Onboarding Flow
                  </Link>
                  <Link
                    href="/admin/managers"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition"
                  >
                    <Users className="w-3.5 h-3.5" />
                    Managers
                  </Link>
                </>
              ) : user.role === "MANAGER" ? (
                <>
                  <Link
                    href="/manager/dashboard"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Talent Pipeline
                  </Link>
                  <Link
                    href="/manager/projects"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    Campaign Briefs
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/creator/dashboard"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    My Dashboard & Status
                  </Link>
                  <Link
                    href="/creator/profile/edit"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition"
                  >
                    <Film className="w-3.5 h-3.5" />
                    Profile & Samples
                  </Link>
                </>
              )}
            </nav>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2.5">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border border-zinc-200 bg-zinc-50 text-zinc-700">
                {user.role === "ADMIN" ? (
                  <>
                    <Shield className="w-3 h-3 text-zinc-500" />
                    Super Admin
                  </>
                ) : user.role === "MANAGER" ? (
                  <>
                    <MapPin className="w-3 h-3 text-zinc-500" />
                    Manager &bull; {user.assignedCountry}
                  </>
                ) : (
                  <>
                    <User className="w-3 h-3 text-zinc-500" />
                    Creator
                  </>
                )}
              </span>

              <span className="text-xs text-zinc-600 hidden md:inline">
                {user.name}
              </span>

              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-200 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-700 hover:text-black hover:bg-zinc-100 transition"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-black hover:bg-zinc-800 transition"
              >
                Apply
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
