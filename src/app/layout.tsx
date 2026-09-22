import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Amora | Creator Onboarding & Talent Platform",
  description:
    "A clean, unified platform to onboard creators, review sample videos, and manage weekly content campaigns.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-zinc-50 text-zinc-900 antialiased font-sans selection:bg-zinc-900 selection:text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-zinc-200 bg-white py-8 text-xs text-zinc-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
              <span className="font-semibold text-zinc-900 tracking-tight flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-black text-white font-bold text-[10px] flex items-center justify-center">
                  A
                </span>
                Amora
              </span>
              <span className="text-zinc-400 hidden sm:inline">&bull;</span>
              <span>Creator Talent &amp; Weekly Campaign Platform</span>
              <span className="text-zinc-400 hidden sm:inline">&bull;</span>
              <span>&copy; {new Date().getFullYear()} Amora. All rights reserved.</span>
            </div>

            <div className="flex items-center gap-5 text-zinc-500 text-xs">
              <span className="hover:text-zinc-800 transition cursor-default">
                Privacy
              </span>
              <span className="hover:text-zinc-800 transition cursor-default">
                Terms
              </span>
              <a
                href="mailto:talent@amora.io"
                className="hover:text-zinc-800 transition"
              >
                talent@amora.io
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
