"use client";

import { useState } from "react";
import Link from "next/link";
import { BentoStat } from "@/components/BentoStat";
import { ChatFeed, type ChatMessage } from "@/components/ChatFeed";
import { OnboardingTooltip } from "@/components/OnboardingTooltip";
import {
  IconScissors,
  IconFlame,
  IconStack2,
  IconClock,
  IconUpload,
  IconLink,
  IconVideo,
} from "@tabler/icons-react";
import type { CreatorMetadata, Asset, Clip, AnalyticsDaily, ChatSpike } from "@/lib/db";

type Props = {
  creator: CreatorMetadata;
  assets: Asset[];
  clips: Clip[];
  analytics: AnalyticsDaily[];
  recentSpikes: ChatSpike[];
};

function formatWatchTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  return `${(minutes / 60).toFixed(1)}h`;
}

export function DashboardClient({ creator, assets, clips, analytics, recentSpikes }: Props) {
  const [chatMessages] = useState<ChatMessage[]>([]);

  // Derived stats
  const totalClips = clips.length;
  const avgVirality = clips.length
    ? Math.round(clips.reduce((s, c) => s + c.viralityScore, 0) / clips.length)
    : 0;
  const queueDepth = clips.filter((c) => c.status === "queued" || c.status === "rendering").length;
  const watchTimeMinutes = analytics.reduce((s, a) => s + a.watchTimeMinutes, 0);

  // Most recent processing asset
  const processingAsset = assets.find((a) => a.status === "processing" || a.status === "uploading");

  // Last 14 days trend for clips
  const last2 = analytics.slice(-14);
  const clipsThisWeek = last2.slice(-7).reduce((s, a) => s + a.clips, 0);
  const clipsPrevWeek = last2.slice(0, 7).reduce((s, a) => s + a.clips, 0);
  const clipTrend = clipsPrevWeek > 0 ? Math.round(((clipsThisWeek - clipsPrevWeek) / clipsPrevWeek) * 100) : 0;

  // Spike chart data from real spikes (last 12 points)
  const spikePoints = recentSpikes.slice(-12);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  const displayName = creator.name || creator.email.split("@")[0];

  return (
    <div className="flex h-screen">
      <OnboardingTooltip />

      {/* Center content */}
      <div className="flex-1 overflow-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-medium text-white">
              {greeting}, {displayName}
            </h1>
            <p className="text-sm text-zinc-500 mt-0.5">Here&apos;s what&apos;s happening</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/upload"
              className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/90 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <IconUpload size={15} stroke={1.5} />
              Upload video
            </Link>
          </div>
        </div>

        {/* Stat tiles */}
        <div id="stat-row" className="grid grid-cols-4 gap-3 mb-6">
          <BentoStat
            label="Total clips"
            value={totalClips}
            icon={<IconScissors size={18} stroke={1.5} />}
            trend={clipTrend !== 0 ? { value: Math.abs(clipTrend), direction: clipTrend >= 0 ? "up" : "down" } : undefined}
          />
          <BentoStat
            label="Avg. virality"
            value={avgVirality || "—"}
            icon={<IconFlame size={18} stroke={1.5} />}
          />
          <BentoStat
            label="Queue depth"
            value={queueDepth}
            icon={<IconStack2 size={18} stroke={1.5} />}
          />
          <BentoStat
            label="Watch time"
            value={formatWatchTime(watchTimeMinutes)}
            icon={<IconClock size={18} stroke={1.5} />}
          />
        </div>

        {/* Bento row */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Processing card */}
          <div id="processing-card" className="bg-panel border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-white">Processing now</h3>
              {processingAsset && (
                <span className="flex items-center gap-1.5 text-xs text-accent">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  {processingAsset.status}
                </span>
              )}
            </div>

            {processingAsset ? (
              <>
                <div className="relative aspect-video bg-zinc-900 rounded-lg overflow-hidden mb-3 flex items-center justify-center">
                  <IconVideo size={32} stroke={1} className="text-zinc-700" />
                  <div className="absolute bottom-2 left-2 text-xs text-white/60 bg-black/40 px-1.5 py-0.5 rounded truncate max-w-[90%]">
                    {processingAsset.filename}
                  </div>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full animate-pulse" style={{ width: "55%" }} />
                </div>
                <p className="text-xs text-zinc-500 mt-1.5">Extracting highlights…</p>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center mb-3">
                  <IconUpload size={20} stroke={1.5} className="text-zinc-500" />
                </div>
                <p className="text-sm text-zinc-400 mb-1">No videos processing</p>
                <p className="text-xs text-zinc-600 mb-4">Upload a video to get started</p>
                <Link
                  href="/upload"
                  className="px-4 py-2 text-xs bg-accent/10 hover:bg-accent/20 border border-accent/20 text-accent rounded-lg transition-colors"
                >
                  Upload now
                </Link>
              </div>
            )}
          </div>

          {/* Chat velocity / spikes */}
          <div id="velocity-card" className="bg-panel border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-white">Chat velocity</h3>
              {spikePoints.length > 0 && (
                <span className="text-xs text-accent font-medium">
                  {spikePoints.length} spike{spikePoints.length > 1 ? "s" : ""} detected
                </span>
              )}
            </div>

            {spikePoints.length > 0 ? (
              <div className="h-[180px] relative">
                <svg viewBox="0 0 480 160" className="w-full h-full" preserveAspectRatio="none">
                  {[0, 40, 80, 120, 160].map((y) => (
                    <line key={y} x1="0" y1={y} x2="480" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                  ))}
                  <polyline
                    fill="none"
                    stroke="#6d5ef0"
                    strokeWidth="2"
                    points={spikePoints
                      .map((s, i) => `${i * (480 / Math.max(spikePoints.length - 1, 1))},${160 - (s.messageRate / 500) * 160}`)
                      .join(" ")}
                  />
                  <polygon
                    fill="url(#spikeGrad)"
                    points={`0,160 ${spikePoints.map((s, i) => `${i * (480 / Math.max(spikePoints.length - 1, 1))},${160 - (s.messageRate / 500) * 160}`).join(" ")} ${480},160`}
                  />
                  <defs>
                    <linearGradient id="spikeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(109,94,240,0.2)" />
                      <stop offset="100%" stopColor="rgba(109,94,240,0)" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            ) : (
              <div className="h-[180px] flex flex-col items-center justify-center text-center">
                <p className="text-sm text-zinc-500 mb-1">No streams yet</p>
                <p className="text-xs text-zinc-600">Connect a live platform to start detecting chat spikes</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent assets */}
        <div id="assets-row">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-white">Recent uploads</h3>
            {assets.length > 0 && (
              <Link href="/assets" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                View all
              </Link>
            )}
          </div>

          {assets.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {assets.slice(0, 3).map((asset) => (
                <div key={asset.videoId} className="bg-panel border border-border rounded-xl overflow-hidden">
                  <div className="aspect-video bg-zinc-900 flex items-center justify-center relative">
                    <IconVideo size={28} stroke={1} className="text-zinc-700" />
                  </div>
                  <div className="p-3">
                    <p className="text-sm text-white truncate">{asset.filename}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs text-zinc-500">
                        {asset.chapters?.length ?? 0} chapter{(asset.chapters?.length ?? 0) !== 1 ? "s" : ""}
                      </span>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          asset.status === "ready"
                            ? "bg-success/10 text-success"
                            : asset.status === "failed"
                            ? "bg-danger/10 text-danger"
                            : "bg-warning/10 text-warning"
                        }`}
                      >
                        {asset.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-zinc-800 rounded-xl">
              <div className="w-12 h-12 rounded-2xl bg-zinc-800/60 flex items-center justify-center mb-3">
                <IconVideo size={24} stroke={1.5} className="text-zinc-600" />
              </div>
              <p className="text-sm text-zinc-400 mb-1">No uploads yet</p>
              <p className="text-xs text-zinc-600 mb-4">Upload your first video to extract AI highlights</p>
              <Link
                href="/upload"
                className="flex items-center gap-2 px-4 py-2 text-sm bg-accent hover:bg-accent/90 text-white rounded-lg transition-colors"
              >
                <IconUpload size={15} stroke={1.5} />
                Upload a video
              </Link>
            </div>
          )}
        </div>

        {/* Connect CTA if no platforms connected */}
        {(!creator.connectedPlatforms || creator.connectedPlatforms.length === 0) && (
          <div className="mt-6 flex items-center justify-between p-4 bg-accent/5 border border-accent/20 rounded-xl">
            <div>
              <p className="text-sm font-medium text-white mb-0.5">Connect your platforms</p>
              <p className="text-xs text-zinc-500">Link YouTube, TikTok, Twitch and more to publish clips directly.</p>
            </div>
            <Link
              href="/connect"
              className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/90 text-white text-sm font-medium rounded-lg transition-colors shrink-0 ml-4"
            >
              <IconLink size={15} stroke={1.5} />
              Connect now
            </Link>
          </div>
        )}
      </div>

      {/* Right chat pane */}
      <div id="chat-pane" className="w-[296px] border-l border-border bg-bg-product shrink-0 flex flex-col">
        <ChatFeed messages={chatMessages} />
      </div>
    </div>
  );
}
