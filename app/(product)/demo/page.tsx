import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BentoStat } from "@/components/BentoStat";
import {
  IconScissors,
  IconFlame,
  IconStack2,
  IconClock,
  IconVideo,
  IconSparkles,
} from "@tabler/icons-react";

const DEMO_EMAIL = "wanjikuwawambui@gmail.com";

const DEMO_ASSETS = [
  { videoId: "d1", filename: "Podcast_EP42_Full.mp4", status: "ready", chapters: 6 },
  { videoId: "d2", filename: "Stream_Highlights_Oct.mp4", status: "ready", chapters: 4 },
  { videoId: "d3", filename: "Tutorial_React_Hooks.mp4", status: "processing", chapters: 0 },
];

const DEMO_SPIKES = [12, 45, 30, 88, 120, 200, 310, 280, 410, 380, 460, 500];

export default async function DemoPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.email !== DEMO_EMAIL) redirect("/dashboard");

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-1">
        <IconSparkles size={20} stroke={1.5} className="text-accent" />
        <h1 className="text-xl font-medium text-white">Demo view</h1>
      </div>
      <p className="text-sm text-zinc-500 mb-8 ml-8">
        Simulated data for internal demos. Not connected to DynamoDB.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <BentoStat label="Total clips" value={24} icon={<IconScissors size={18} stroke={1.5} />} trend={{ value: 18, direction: "up" }} />
        <BentoStat label="Avg. virality" value={73} icon={<IconFlame size={18} stroke={1.5} />} />
        <BentoStat label="Queue depth" value={3} icon={<IconStack2 size={18} stroke={1.5} />} />
        <BentoStat label="Watch time" value="12.4h" icon={<IconClock size={18} stroke={1.5} />} />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {/* Processing card */}
        <div className="bg-panel border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-white">Processing now</h3>
            <span className="flex items-center gap-1.5 text-xs text-accent">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              processing
            </span>
          </div>
          <div className="relative aspect-video bg-zinc-900 rounded-lg overflow-hidden mb-3 flex items-center justify-center">
            <IconVideo size={32} stroke={1} className="text-zinc-700" />
            <div className="absolute bottom-2 left-2 text-xs text-white/60 bg-black/40 px-1.5 py-0.5 rounded">
              Tutorial_React_Hooks.mp4
            </div>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full animate-pulse" style={{ width: "55%" }} />
          </div>
          <p className="text-xs text-zinc-500 mt-1.5">Extracting highlights…</p>
        </div>

        {/* Chat velocity */}
        <div className="bg-panel border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-white">Chat velocity</h3>
            <span className="text-xs text-accent font-medium">3 spikes detected</span>
          </div>
          <div className="h-[180px] relative">
            <svg viewBox="0 0 480 160" className="w-full h-full" preserveAspectRatio="none">
              {[0, 40, 80, 120, 160].map((y) => (
                <line key={y} x1="0" y1={y} x2="480" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              ))}
              <polyline
                fill="none"
                stroke="#6d5ef0"
                strokeWidth="2"
                points={DEMO_SPIKES.map((v, i) => `${i * (480 / 11)},${160 - (v / 500) * 160}`).join(" ")}
              />
              <polygon
                fill="url(#demoGrad)"
                points={`0,160 ${DEMO_SPIKES.map((v, i) => `${i * (480 / 11)},${160 - (v / 500) * 160}`).join(" ")} ${480},160`}
              />
              <defs>
                <linearGradient id="demoGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(109,94,240,0.2)" />
                  <stop offset="100%" stopColor="rgba(109,94,240,0)" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {/* Assets */}
      <h3 className="text-sm font-medium text-white mb-3">Sample uploads</h3>
      <div className="grid grid-cols-3 gap-3">
        {DEMO_ASSETS.map((asset) => (
          <div key={asset.videoId} className="bg-panel border border-border rounded-xl overflow-hidden">
            <div className="aspect-video bg-zinc-900 flex items-center justify-center">
              <IconVideo size={28} stroke={1} className="text-zinc-700" />
            </div>
            <div className="p-3">
              <p className="text-sm text-white truncate">{asset.filename}</p>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-xs text-zinc-500">
                  {asset.chapters} chapter{asset.chapters !== 1 ? "s" : ""}
                </span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  asset.status === "ready" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                }`}>
                  {asset.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
