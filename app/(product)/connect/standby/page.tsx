"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

const PLATFORM_LABELS: Record<string, string> = {
  twitch:    "Twitch",
  tiktok:    "TikTok",
  discord:   "Discord",
  instagram: "Instagram",
};

function StandbyContent() {
  const params = useSearchParams();
  const platform = params.get("platform") ?? "";
  const label = PLATFORM_LABELS[platform] ?? platform;

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
      {/* TV frame */}
      <div className="relative w-full max-w-lg">
        {/* Outer shell */}
        <div className="bg-zinc-800 rounded-2xl p-4 shadow-2xl border border-zinc-700">
          {/* Screen bezel */}
          <div className="bg-black rounded-xl overflow-hidden relative aspect-video">
            {/* Static video */}
            <video
              src="/videos/static.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover opacity-80"
            />

            {/* Scanline overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
              }}
            />

            {/* Centre text overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
              <p className="text-white font-mono text-xs tracking-[0.3em] uppercase opacity-70 mb-3">
                Channel {Math.floor(Math.random() * 60) + 2}
              </p>
              <h2 className="text-white font-mono text-lg font-bold leading-snug drop-shadow-lg mb-1">
                PLEASE STAND BY
              </h2>
              <p className="text-zinc-300 font-mono text-xs leading-relaxed drop-shadow max-w-[260px]">
                We&apos;re working on restoring access to <span className="text-white font-semibold">{label}</span>.
                <br />We&apos;ll be back soon.
              </p>
            </div>
          </div>

          {/* TV controls row */}
          <div className="flex items-center justify-between mt-3 px-2">
            <div className="flex gap-1.5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-zinc-600" />
              ))}
            </div>
            <div className="w-8 h-3 rounded-full bg-zinc-600" />
            <div className="flex gap-1.5">
              <div className="w-5 h-5 rounded-full bg-zinc-700 border border-zinc-600" />
              <div className="w-5 h-5 rounded-full bg-zinc-700 border border-zinc-600" />
            </div>
          </div>
        </div>

        {/* TV stand */}
        <div className="flex justify-center">
          <div className="w-16 h-4 bg-zinc-700 rounded-b-lg" />
        </div>
        <div className="flex justify-center">
          <div className="w-28 h-2 bg-zinc-800 rounded-full" />
        </div>
      </div>

      <Link
        href="/connect"
        className="mt-10 text-xs text-zinc-600 hover:text-zinc-400 transition-colors font-mono tracking-wider"
      >
        ← Back to connections
      </Link>
    </div>
  );
}

export default function StandbyPage() {
  return (
    <Suspense>
      <StandbyContent />
    </Suspense>
  );
}
