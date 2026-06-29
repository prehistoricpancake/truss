import Link from "next/link";
import {
  IconScissors,
  IconFlame,
  IconStack2,
  IconClock,
  IconBrandYoutube,
  IconBrandTwitch,
  IconBrandTiktok,
  IconBrandInstagram,
  IconBrandDiscord,
} from "@tabler/icons-react";

const DEMO_VIDEOS = [
  "/videos/video1.mp4",
  "/videos/video2.mp4",
  "/videos/12155414_1080_1920_30fps.mp4",
  "/videos/13400159-hd_1080_1920_60fps.mp4",
  "/videos/8134919-hd_1080_1920_25fps.mp4",
  "/videos/8039795-uhd_2160_4096_25fps.mp4",
];
import { BentoStat } from "@/components/BentoStat";
import { DemoChatSimulator } from "./DemoChatSimulator";
import { DemoAISection } from "./DemoAISection";
import {
  getCreator,
  getClips,
  getStreams,
  getAnalytics,
  getChatSpikes,
} from "@/lib/db";

const DEMO_USER_ID = "wanjikuwawambui@gmail.com";

const PLATFORMS = [
  { id: "youtube", name: "YouTube", icon: IconBrandYoutube, color: "text-red-400", connected: true },
  { id: "twitch", name: "Twitch", icon: IconBrandTwitch, color: "text-purple-400", connected: true },
  { id: "tiktok", name: "TikTok", icon: IconBrandTiktok, color: "text-white", connected: true },
  { id: "instagram", name: "Instagram", icon: IconBrandInstagram, color: "text-pink-400", connected: true },
  { id: "discord", name: "Discord", icon: IconBrandDiscord, color: "text-indigo-400", connected: true },
];

export default async function DemoPage() {
  const [creator, clips, streams, analyticsData, spikes] = await Promise.all([
    getCreator(DEMO_USER_ID),
    getClips(DEMO_USER_ID),
    getStreams(DEMO_USER_ID),
    getAnalytics(DEMO_USER_ID),
    getChatSpikes(DEMO_USER_ID),
  ]);

  const totalClips = clips.length;
  const avgVirality =
    clips.length > 0
      ? Math.round(clips.reduce((s, c) => s + c.viralityScore, 0) / clips.length)
      : 0;
  const queueDepth = clips.filter(
    (c) => c.status === "queued" || c.status === "rendering"
  ).length;
  const totalWatchHours = Math.round(
    analyticsData.reduce((s, a) => s + a.watchTimeMinutes, 0) / 60
  );

  const topClips = [...clips]
    .sort((a, b) => b.viralityScore - a.viralityScore)
    .slice(0, 6);

  const last30 = analyticsData.slice(-30);
  const maxViews = Math.max(...last30.map((a) => a.views), 1);

  return (
    <div className="min-h-screen bg-bg-product">
      {/* Demo banner */}
      <div className="sticky top-0 z-50 bg-accent/10 border-b border-accent/20 px-6 py-2.5 flex items-center justify-between backdrop-blur-sm">
        <p className="text-xs text-accent font-medium">
          Live demo — all data is real, served from AWS DynamoDB ·{" "}
          <span className="text-zinc-400">No login required</span>
        </p>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-zinc-500">#H0Hackathon</span>
          <Link
            href="/signup"
            className="text-xs font-medium text-white bg-accent px-3 py-1.5 rounded-lg hover:bg-accent/90 transition-colors"
          >
            Get started free →
          </Link>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 min-h-[calc(100vh-45px)] border-r border-border p-4 shrink-0 flex flex-col sticky top-[45px] self-start">
          <div className="px-2 py-3 mb-4 flex items-center gap-2">
            <span className="text-white font-semibold text-base tracking-tight">truss</span>
            <span className="text-[9px] px-1.5 py-0.5 bg-accent/20 text-accent rounded font-medium uppercase tracking-wide">
              demo
            </span>
          </div>

          {["Dashboard", "Assets", "Clips", "Streams", "Analytics", "Connect"].map((item) => (
            <div
              key={item}
              className="px-3 py-2 text-sm text-zinc-500 rounded-lg cursor-default select-none"
            >
              {item}
            </div>
          ))}

          {/* Platform status */}
          <div className="mt-4 px-3">
            <p className="text-[9px] text-zinc-600 uppercase tracking-wider mb-2">
              Platforms
            </p>
            {PLATFORMS.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-1.5">
                  <p.icon size={12} stroke={1.5} className={p.color} />
                  <span className="text-[10px] text-zinc-500">{p.name}</span>
                </div>
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
              </div>
            ))}
          </div>

          <div className="mt-auto pt-4 border-t border-border">
            <div className="px-3 py-2.5 bg-zinc-800/50 rounded-lg">
              <p className="text-xs text-white font-medium truncate">
                {creator?.name ?? "Demo Creator"}
              </p>
              <p className="text-[10px] text-zinc-500 mt-0.5 capitalize">
                {creator?.plan ?? "pro"} plan
              </p>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-5xl">

            {/* Header */}
            <div className="mb-6">
              <h1 className="text-xl font-medium text-white mb-1">Dashboard</h1>
              <p className="text-sm text-zinc-500">
                {totalClips} clips extracted · {streams.length} streams archived ·{" "}
                {spikes.length} engagement spikes logged
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              <BentoStat
                label="Total clips"
                value={totalClips}
                icon={<IconScissors size={18} stroke={1.5} />}
                trend={{ value: 18, direction: "up" }}
              />
              <BentoStat
                label="Avg. virality"
                value={avgVirality}
                icon={<IconFlame size={18} stroke={1.5} />}
              />
              <BentoStat
                label="Queue depth"
                value={queueDepth}
                icon={<IconStack2 size={18} stroke={1.5} />}
              />
              <BentoStat
                label="Watch time"
                value={`${totalWatchHours}h`}
                icon={<IconClock size={18} stroke={1.5} />}
              />
            </div>

            {/* Live features row — chat simulator + AI */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <DemoChatSimulator />
              <DemoAISection />
            </div>

            {/* Top clips */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-white">Top clips by virality</h3>
                <span className="text-xs text-zinc-500">{totalClips} total</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {topClips.length > 0 ? (
                  topClips.map((clip, i) => (
                    <div
                      key={clip.clipId}
                      className="bg-panel border border-border rounded-xl overflow-hidden"
                    >
                      <div className="relative bg-zinc-900" style={{ aspectRatio: "9/16", maxHeight: "220px" }}>
                        <video
                          src={DEMO_VIDEOS[i % DEMO_VIDEOS.length]}
                          autoPlay
                          muted
                          loop
                          playsInline
                          className="w-full h-full object-cover"
                        />
                        <span
                          className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            clip.viralityScore >= 80
                              ? "bg-success text-black"
                              : clip.viralityScore >= 60
                              ? "bg-warning text-black"
                              : "bg-zinc-700 text-zinc-300"
                          }`}
                        >
                          {clip.viralityScore}
                        </span>
                      </div>
                      <div className="p-3">
                        <p className="text-xs text-white truncate mb-1.5">{clip.title}</p>
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full ${
                              clip.status === "published"
                                ? "bg-success/10 text-success"
                                : clip.status === "ready"
                                ? "bg-accent/10 text-accent"
                                : "bg-zinc-700/40 text-zinc-400"
                            }`}
                          >
                            {clip.status}
                          </span>
                          <span className="text-[9px] text-zinc-600">virality score</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-sm text-zinc-600 py-8 text-center">
                    Run <code className="text-zinc-400">npx tsx scripts/seed.ts wanjikuwawambui@gmail.com</code> to seed demo data
                  </div>
                )}
              </div>
            </div>

            {/* Analytics + Streams */}
            <div className="grid grid-cols-5 gap-4 mb-6">
              {/* Analytics chart */}
              <div className="col-span-3 bg-panel border border-border rounded-xl p-4">
                <h3 className="text-sm font-medium text-white mb-4">
                  Analytics — last 30 days
                </h3>
                <div className="h-[110px] mb-4">
                  {last30.length > 1 ? (
                    <svg
                      viewBox="0 0 600 100"
                      className="w-full h-full"
                      preserveAspectRatio="none"
                    >
                      {[25, 50, 75].map((y) => (
                        <line
                          key={y}
                          x1="0"
                          y1={y}
                          x2="600"
                          y2={y}
                          stroke="rgba(255,255,255,0.05)"
                          strokeWidth="1"
                        />
                      ))}
                      <defs>
                        <linearGradient
                          id="analyticsGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="0%" stopColor="rgba(109,94,240,0.25)" />
                          <stop offset="100%" stopColor="rgba(109,94,240,0)" />
                        </linearGradient>
                      </defs>
                      <polygon
                        fill="url(#analyticsGrad)"
                        points={`0,100 ${last30
                          .map((a, i) => {
                            const x = i * (600 / (last30.length - 1));
                            const y = 100 - (a.views / maxViews) * 85;
                            return `${x},${y}`;
                          })
                          .join(" ")} 600,100`}
                      />
                      <polyline
                        fill="none"
                        stroke="#6d5ef0"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                        points={last30
                          .map((a, i) => {
                            const x = i * (600 / (last30.length - 1));
                            const y = 100 - (a.views / maxViews) * 85;
                            return `${x},${y}`;
                          })
                          .join(" ")}
                      />
                    </svg>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-zinc-600">
                      No analytics data — seed the demo account first
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-3 pt-3 border-t border-border">
                  {[
                    { label: "Views", value: last30.reduce((s, a) => s + a.views, 0).toLocaleString() },
                    { label: "Followers", value: `+${last30.reduce((s, a) => s + a.followers, 0).toLocaleString()}` },
                    { label: "Clips", value: last30.reduce((s, a) => s + a.clips, 0) },
                    { label: "Watch time", value: `${Math.round(last30.reduce((s, a) => s + a.watchTimeMinutes, 0) / 60)}h` },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <p className="text-[10px] text-zinc-500 mb-0.5">{stat.label}</p>
                      <p className="text-sm font-medium text-white">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Streams */}
              <div className="col-span-2 bg-panel border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-white">Streams</h3>
                  <span className="text-xs text-zinc-500">{streams.length} archived</span>
                </div>
                <div className="space-y-2 overflow-auto max-h-[200px]">
                  {streams.slice(0, 8).map((stream) => (
                    <div
                      key={stream.streamId}
                      className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <IconBrandYoutube size={13} stroke={1.5} className="text-red-400 shrink-0" />
                        <p className="text-[10px] text-zinc-400">
                          {new Date(stream.startedAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                      </div>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                          stream.status === "live"
                            ? "bg-success/20 text-success"
                            : stream.status === "processing"
                            ? "bg-warning/20 text-warning"
                            : "bg-zinc-700/40 text-zinc-400"
                        }`}
                      >
                        {stream.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Platform connections */}
            <div className="mb-8">
              <h3 className="text-sm font-medium text-white mb-3">Platform connections</h3>
              <div className="grid grid-cols-5 gap-3">
                {PLATFORMS.map((p) => (
                  <div
                    key={p.id}
                    className={`bg-panel border rounded-xl p-3 flex flex-col items-center gap-2 ${
                      p.connected ? "border-accent/30" : "border-border"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center">
                      <p.icon size={18} stroke={1.5} className={p.color} />
                    </div>
                    <p className="text-[10px] text-white font-medium">{p.name}</p>
                    <span className="flex items-center gap-1 text-[9px] text-success">
                      <span className="w-1 h-1 rounded-full bg-success" />
                      Connected
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-accent/10 border border-accent/20 rounded-xl p-6 text-center">
              <h3 className="text-base font-medium text-white mb-1">
                Ready to grow your creator business?
              </h3>
              <p className="text-sm text-zinc-400 mb-4">
                Connect your stream. Upload a video. Truss handles clipping, scoring, and publishing — automatically.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent/90 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Get started free
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
