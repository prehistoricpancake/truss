"use client";

import { useState, useEffect, useCallback } from "react";
import { BentoStat } from "@/components/BentoStat";
import { ChatFeed, type ChatMessage } from "@/components/ChatFeed";
import { SimulatedBadge } from "@/components/SimulatedBadge";
import {
  IconScissors,
  IconFlame,
  IconStack2,
  IconClock,
} from "@tabler/icons-react";

// Seed data for demo — using real video files from /public/videos/
const seedAssets = [
  { id: "vid-001", filename: "video1.mp4", chapters: 4, status: "ready" as const, videoSrc: "/videos/video1.mp4" },
  { id: "vid-002", filename: "video2.mp4", chapters: 3, status: "ready" as const, videoSrc: "/videos/video2.mp4" },
  { id: "vid-003", filename: "12155414_1080_1920_30fps.mp4", chapters: 0, status: "processing" as const, videoSrc: "/videos/12155414_1080_1920_30fps.mp4" },
];

const seedChatMessages: ChatMessage[] = [
  { id: "1", platform: "twitch", username: "xNightOwl", message: "let's gooo 🔥", timestamp: "2m ago" },
  { id: "2", platform: "youtube", username: "ReactFan42", message: "that hook was clean", timestamp: "2m ago" },
  { id: "3", platform: "discord", username: "ModSquad", message: "clip that!", timestamp: "1m ago" },
  { id: "4", platform: "tiktok", username: "viralchaser", message: "THIS IS INSANE", timestamp: "1m ago" },
  { id: "5", platform: "twitch", username: "sub_gifter99", message: "POGGERS POGGERS", timestamp: "1m ago", isSpike: true },
  { id: "6", platform: "twitch", username: "hype_beast", message: "NO WAY", timestamp: "45s ago" },
  { id: "7", platform: "youtube", username: "CasualViewer", message: "what did I just witness", timestamp: "30s ago" },
  { id: "8", platform: "discord", username: "ClipBot", message: "Auto-clipped @ 01:23:45", timestamp: "20s ago" },
  { id: "9", platform: "twitch", username: "first_time_here", message: "new follower! this stream is crazy", timestamp: "10s ago" },
  { id: "10", platform: "tiktok", username: "duet_me", message: "putting this on tiktok rn", timestamp: "5s ago" },
];

// SIMULATED: Chat velocity data for the chart
const velocityData = [
  { time: "0:00", rate: 45 },
  { time: "0:05", rate: 52 },
  { time: "0:10", rate: 48 },
  { time: "0:15", rate: 61 },
  { time: "0:20", rate: 55 },
  { time: "0:25", rate: 120 },
  { time: "0:30", rate: 340 },
  { time: "0:35", rate: 280 },
  { time: "0:40", rate: 150 },
  { time: "0:45", rate: 85 },
  { time: "0:50", rate: 62 },
  { time: "0:55", rate: 58 },
];

export default function DashboardPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(seedChatMessages);
  const [simRunning, setSimRunning] = useState(false);
  const [spikeDetected, setSpikeDetected] = useState(false);

  const runSimulation = useCallback(async () => {
    setSimRunning(true);
    setSpikeDetected(false);

    // SIMULATED: Generate chat messages at increasing rate
    const platforms: ChatMessage["platform"][] = ["twitch", "youtube", "tiktok", "discord"];
    const simMessages = [
      "omg this is amazing",
      "CLIP IT",
      "🔥🔥🔥",
      "no way!!!",
      "goated stream",
      "W stream",
      "LETS GOOOO",
      "how is this real",
      "best content on the platform",
      "subscribe NOW",
    ];

    let baseline = 50;
    let msgCount = 0;

    const interval = setInterval(() => {
      msgCount++;
      const rate = msgCount > 5 ? baseline * 3 : baseline + Math.random() * 20;

      const newMsg: ChatMessage = {
        id: `sim-${Date.now()}-${msgCount}`,
        platform: platforms[Math.floor(Math.random() * platforms.length)],
        username: `user_${Math.floor(Math.random() * 999)}`,
        message: simMessages[Math.floor(Math.random() * simMessages.length)],
        timestamp: "now",
        isSpike: msgCount === 6,
      };

      if (msgCount === 6) {
        setSpikeDetected(true);
        // Fire real chat-spike API call
        fetch("/api/chat-spike", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: "demo-creator-001",
            messageRate: rate,
            baseline,
            streamId: "stream-sim-001",
          }),
        }).catch(console.error);
      }

      setMessages((prev) => [...prev.slice(-20), newMsg]);

      if (msgCount >= 12) {
        clearInterval(interval);
        setSimRunning(false);
      }
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen">
      {/* Center content */}
      <div className="flex-1 overflow-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-medium text-white">Good evening, Alex</h1>
            <p className="text-sm text-zinc-500 mt-0.5">Here&apos;s what&apos;s happening</p>
          </div>
          <div className="flex items-center gap-3">
            {simRunning && (
              <span className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 rounded-full text-xs text-accent">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                Processing…
              </span>
            )}
            <button
              onClick={runSimulation}
              disabled={simRunning}
              className="px-4 py-2 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Run simulation
            </button>
          </div>
        </div>

        {/* Stat tiles */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <BentoStat
            label="Total clips"
            value={47}
            icon={<IconScissors size={18} stroke={1.5} />}
            trend={{ value: 12, direction: "up" }}
          />
          <BentoStat
            label="Avg. virality"
            value={84}
            icon={<IconFlame size={18} stroke={1.5} />}
            trend={{ value: 5, direction: "up" }}
          />
          <BentoStat
            label="Queue depth"
            value={3}
            icon={<IconStack2 size={18} stroke={1.5} />}
          />
          <BentoStat
            label="Watch time"
            value="12.4h"
            icon={<IconClock size={18} stroke={1.5} />}
            trend={{ value: 8, direction: "up" }}
          />
        </div>

        {/* Bento row: Processing + Chat velocity */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Processing card */}
          <div className="bg-panel border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-white">Processing now</h3>
              <SimulatedBadge label="Simulated for demo" />
            </div>
            <div className="relative aspect-video bg-zinc-900 rounded-lg overflow-hidden mb-3">
              <video
                src="/videos/12155414_1080_1920_30fps.mp4"
                className="absolute inset-0 w-full h-full object-cover"
                muted
                loop
                autoPlay
                playsInline
              />
              <div className="absolute bottom-2 left-2 text-xs text-white/60 bg-black/40 px-1.5 py-0.5 rounded">
                12155414_1080_1920_30fps.mp4
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all duration-1000" style={{ width: "67%" }} />
            </div>
            <p className="text-xs text-zinc-500 mt-1.5">67% — Extracting highlights…</p>
          </div>

          {/* Chat velocity chart */}
          <div className="bg-panel border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-white">Chat velocity</h3>
              {spikeDetected && (
                <span className="text-xs text-accent font-medium">Spike detected!</span>
              )}
            </div>
            {/* Simple SVG chart */}
            <div className="h-[180px] relative">
              <svg viewBox="0 0 480 160" className="w-full h-full" preserveAspectRatio="none">
                {/* Grid lines */}
                {[0, 40, 80, 120, 160].map((y) => (
                  <line key={y} x1="0" y1={y} x2="480" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                ))}
                {/* Baseline */}
                <line x1="0" y1="120" x2="480" y2="120" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4 4" />
                <text x="485" y="123" fill="rgba(255,255,255,0.3)" fontSize="8">baseline</text>
                {/* Line chart */}
                <polyline
                  fill="none"
                  stroke="#6d5ef0"
                  strokeWidth="2"
                  points={velocityData
                    .map((d, i) => `${i * (480 / (velocityData.length - 1))},${160 - (d.rate / 400) * 160}`)
                    .join(" ")}
                />
                {/* Spike point */}
                <circle cx={`${6 * (480 / (velocityData.length - 1))}`} cy={`${160 - (340 / 400) * 160}`} r="4" fill="#6d5ef0" />
                <circle cx={`${6 * (480 / (velocityData.length - 1))}`} cy={`${160 - (340 / 400) * 160}`} r="8" fill="rgba(109,94,240,0.2)" />
                {/* Area fill */}
                <polygon
                  fill="url(#chartGradient)"
                  points={`0,160 ${velocityData
                    .map((d, i) => `${i * (480 / (velocityData.length - 1))},${160 - (d.rate / 400) * 160}`)
                    .join(" ")} ${480},160`}
                />
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(109,94,240,0.15)" />
                    <stop offset="100%" stopColor="rgba(109,94,240,0)" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Time labels */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-zinc-600">
                {velocityData.filter((_, i) => i % 3 === 0).map((d) => (
                  <span key={d.time}>{d.time}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent assets */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-white mb-3">Recent assets</h3>
          <div className="grid grid-cols-3 gap-3">
            {seedAssets.map((asset) => (
              <div key={asset.id} className="bg-panel border border-border rounded-xl overflow-hidden">
                <div className="aspect-video bg-zinc-900 relative overflow-hidden">
                  <video
                    src={asset.videoSrc}
                    className="absolute inset-0 w-full h-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                  />
                </div>
                <div className="p-3">
                  <p className="text-sm text-white truncate">{asset.filename}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-xs text-zinc-500">
                      {asset.chapters} chapter{asset.chapters !== 1 ? "s" : ""}
                    </span>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        asset.status === "ready"
                          ? "bg-success/10 text-success"
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
        </div>
      </div>

      {/* Right chat pane */}
      <div className="w-[296px] border-l border-border bg-bg-product shrink-0 flex flex-col">
        <ChatFeed messages={messages} />
      </div>
    </div>
  );
}
