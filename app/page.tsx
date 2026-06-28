import Link from "next/link";
import { WarpedHero } from "@/components/WarpedHero";
import { MasonryGrid } from "@/components/MasonryGrid";
import {
  IconBrandYoutube,
  IconBrandTiktok,
  IconBrandInstagram,
  IconBrandTwitch,
  IconBrandDiscord,
  IconHome,
  IconFolder,
  IconVideo,
  IconScissors,
  IconChartBar,
} from "@tabler/icons-react";

const allVideos = [
  "/videos/10378789-uhd_2160_4096_25fps.mp4",
  "/videos/12155414_1080_1920_30fps.mp4",
  "/videos/13400159-hd_1080_1920_60fps.mp4",
  "/videos/8039795-uhd_2160_4096_25fps.mp4",
  "/videos/8134919-hd_1080_1920_25fps.mp4",
  "/videos/video1.mp4",
  "/videos/video2.mp4",
];

// Spread videos across 20 tiles, cycling through all available
const sampleClips = Array.from({ length: 20 }, (_, i) => ({
  id: String(i + 1),
  viralityScore: [92, 78, 88, 94, 71, 82, 95, 67, 89, 73, 91, 85, 76, 96, 68, 83, 90, 74, 87, 79][i],
  videoSrc: allVideos[i % allVideos.length],
  span: ([0, 3, 8, 12, 17].includes(i) ? 2 : 1) as 1 | 2,
}));

const platforms = [
  { name: "YouTube", icon: IconBrandYoutube },
  { name: "TikTok", icon: IconBrandTiktok },
  { name: "Instagram", icon: IconBrandInstagram },
  { name: "Twitch", icon: IconBrandTwitch },
  { name: "Discord", icon: IconBrandDiscord },
];

const iconRailItems = [
  { icon: IconHome, label: "Home" },
  { icon: IconFolder, label: "Assets" },
  { icon: IconVideo, label: "Video" },
  { icon: IconScissors, label: "Clips" },
  { icon: IconChartBar, label: "Analytics" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-cinematic">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-bg-cinematic/80 backdrop-blur-sm border-b border-border-hair">
        <span className="text-lg font-semibold text-white tracking-tight">truss</span>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-sm text-white bg-accent hover:bg-accent/90 px-4 py-2 rounded-full transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="pt-16">
        <WarpedHero />
      </div>

      {/* Format filter pills + Icon rail + Masonry grid */}
      <section className="px-6 py-12">
        {/* Format filters */}
        <div className="flex items-center gap-2 mb-6">
          {["Live", "VOD", "Clips"].map((filter) => (
            <button
              key={filter}
              className="px-4 py-1.5 rounded-full text-xs font-medium border border-border text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="flex gap-4">
          {/* Icon rail */}
          <div className="flex flex-col gap-1 shrink-0">
            {iconRailItems.map((item) => (
              <button
                key={item.label}
                className="w-14 h-14 flex items-center justify-center rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03] transition-colors"
                title={item.label}
              >
                <item.icon size={22} stroke={1.5} />
              </button>
            ))}
          </div>

          {/* Masonry grid */}
          <div className="flex-1">
            <MasonryGrid clips={sampleClips} columns={5} showScores={false} />
          </div>
        </div>
      </section>

      {/* Publishes natively to */}
      <section className="px-6 py-12 border-t border-border-hair">
        <p className="text-center text-xs text-zinc-600 uppercase tracking-widest mb-6">
          Publishes natively to
        </p>
        <div className="flex items-center justify-center gap-12">
          {platforms.map((platform) => (
            <div key={platform.name} className="flex items-center gap-2 text-zinc-500">
              <platform.icon size={24} stroke={1.5} />
              <span className="text-sm">{platform.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Two-card feature row */}
      <section className="px-6 py-12">
        <div className="grid grid-cols-[1.4fr_1fr] gap-4">
          {/* Intelligent clips card */}
          <div className="relative rounded-2xl border border-border overflow-hidden p-8"
            style={{
              background: "linear-gradient(135deg, rgba(109,94,240,0.08) 0%, rgba(109,94,240,0.02) 100%)",
            }}
          >
            <h3 className="text-xl font-semibold text-white mb-2">Intelligent Clip Extraction</h3>
            <p className="text-sm text-zinc-400 max-w-md">
              Truss analyzes your content for peak moments — high engagement, viral potential, emotional beats — and extracts them as publish-ready 9:16 shorts.
            </p>
            <div className="mt-6 flex gap-2">
              <span className="px-3 py-1 rounded-full text-xs bg-accent/10 text-accent border border-accent/20">
                Smart Analysis
              </span>
              <span className="px-3 py-1 rounded-full text-xs bg-success/10 text-success border border-success/20">
                Real-time Processing
              </span>
            </div>
          </div>

          {/* Live stream monitoring card */}
          <div className="relative rounded-2xl border border-border overflow-hidden p-8"
            style={{
              background: "linear-gradient(135deg, rgba(250,204,21,0.06) 0%, rgba(248,113,113,0.04) 100%)",
            }}
          >
            <h3 className="text-xl font-semibold text-white mb-2">Live Chat Intelligence</h3>
            <p className="text-sm text-zinc-400">
              Monitor unified chat across platforms. Detect engagement spikes in real-time and auto-mark clip boundaries.
            </p>
            <div className="mt-6 flex gap-2">
              <span className="px-3 py-1 rounded-full text-xs bg-warning/10 text-warning border border-warning/20">
                Spike Detection
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="px-6 py-16 text-center border-t border-border-hair">
        <h2 className="text-2xl font-semibold text-white mb-3">Ready to publish everywhere?</h2>
        <p className="text-sm text-zinc-500 mb-6">Start free. Upgrade when you need to.</p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/signup"
            className="px-6 py-3 bg-accent hover:bg-accent/90 text-white text-sm font-medium rounded-full transition-colors"
          >
            Get started free
          </Link>
          <Link
            href="/pricing"
            className="px-6 py-3 border border-border text-zinc-400 hover:text-white text-sm font-medium rounded-full transition-colors"
          >
            View pricing
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-border-hair">
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-600">&copy; 2024 Truss. All rights reserved.</span>
          <div className="flex gap-6 text-xs text-zinc-600">
            <span className="hover:text-zinc-400 cursor-pointer">Terms</span>
            <span className="hover:text-zinc-400 cursor-pointer">Privacy</span>
            <span className="hover:text-zinc-400 cursor-pointer">Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
