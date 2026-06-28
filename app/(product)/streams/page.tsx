import { IconBroadcast } from "@tabler/icons-react";
import { SimulatedBadge } from "@/components/SimulatedBadge";

const streams = [
  {
    id: "stream-001",
    platform: "twitch",
    title: "Late night gaming session",
    status: "ended" as const,
    startedAt: "Jun 24, 8:00 PM",
    duration: "3h 15m",
    peakViewers: 1420,
    chatSpikes: 3,
  },
  {
    id: "stream-002",
    platform: "youtube",
    title: "React tutorial livestream",
    status: "live" as const,
    startedAt: "Just now",
    duration: "—",
    peakViewers: 890,
    chatSpikes: 1,
  },
];

export default function StreamsPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <IconBroadcast size={20} stroke={1.5} className="text-zinc-400" />
          <h1 className="text-xl font-medium text-white">Streams</h1>
        </div>
        <SimulatedBadge label="Simulated — live ingestion not connected" />
      </div>

      <div className="space-y-3">
        {streams.map((stream) => (
          <div key={stream.id} className="bg-panel border border-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {stream.status === "live" && (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 bg-danger/10 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
                    <span className="text-[10px] font-medium text-danger uppercase">Live</span>
                  </span>
                )}
                <div>
                  <h3 className="text-sm font-medium text-white">{stream.title}</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {stream.platform} · Started {stream.startedAt}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm text-zinc-400">
                <div className="text-center">
                  <p className="text-white font-medium">{stream.peakViewers.toLocaleString()}</p>
                  <p className="text-[10px] text-zinc-600">peak viewers</p>
                </div>
                <div className="text-center">
                  <p className="text-white font-medium">{stream.chatSpikes}</p>
                  <p className="text-[10px] text-zinc-600">chat spikes</p>
                </div>
                <div className="text-center">
                  <p className="text-white font-medium">{stream.duration}</p>
                  <p className="text-[10px] text-zinc-600">duration</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
