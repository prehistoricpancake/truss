import { IconChartBar } from "@tabler/icons-react";
import { BentoStat } from "@/components/BentoStat";
import { SimulatedBadge } from "@/components/SimulatedBadge";
import {
  IconEye,
  IconUsers,
  IconScissors,
  IconClock,
} from "@tabler/icons-react";

// SIMULATED: Analytics data from seed
const dailyData = Array.from({ length: 14 }, (_, i) => ({
  date: new Date(Date.now() - (13 - i) * 86400000).toISOString().split("T")[0],
  views: Math.floor(1200 + Math.random() * 3000 + i * 150),
  followers: Math.floor(50 + Math.random() * 200 + i * 10),
}));

export default function AnalyticsPage() {
  const totalViews = dailyData.reduce((sum, d) => sum + d.views, 0);
  const totalFollowers = dailyData.reduce((sum, d) => sum + d.followers, 0);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <IconChartBar size={20} stroke={1.5} className="text-zinc-400" />
          <h1 className="text-xl font-medium text-white">Analytics</h1>
        </div>
        <SimulatedBadge label="Simulated data" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <BentoStat label="Total views" value={totalViews.toLocaleString()} icon={<IconEye size={18} stroke={1.5} />} trend={{ value: 24, direction: "up" }} />
        <BentoStat label="New followers" value={totalFollowers.toLocaleString()} icon={<IconUsers size={18} stroke={1.5} />} trend={{ value: 18, direction: "up" }} />
        <BentoStat label="Clips created" value={47} icon={<IconScissors size={18} stroke={1.5} />} trend={{ value: 12, direction: "up" }} />
        <BentoStat label="Watch time" value="186h" icon={<IconClock size={18} stroke={1.5} />} trend={{ value: 8, direction: "up" }} />
      </div>

      {/* Views chart */}
      <div className="bg-panel border border-border rounded-xl p-4 mb-6">
        <h3 className="text-sm font-medium text-white mb-4">Views — Last 14 days</h3>
        <div className="h-[240px]">
          <svg viewBox="0 0 560 200" className="w-full h-full" preserveAspectRatio="none">
            {[0, 50, 100, 150, 200].map((y) => (
              <line key={y} x1="0" y1={y} x2="560" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            ))}
            <polyline
              fill="none"
              stroke="#6d5ef0"
              strokeWidth="2"
              points={dailyData
                .map((d, i) => `${i * (560 / (dailyData.length - 1))},${200 - (d.views / 5000) * 200}`)
                .join(" ")}
            />
            <polygon
              fill="url(#analyticsGrad)"
              points={`0,200 ${dailyData
                .map((d, i) => `${i * (560 / (dailyData.length - 1))},${200 - (d.views / 5000) * 200}`)
                .join(" ")} 560,200`}
            />
            <defs>
              <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(109,94,240,0.2)" />
                <stop offset="100%" stopColor="rgba(109,94,240,0)" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Platform breakdown */}
      <div className="bg-panel border border-border rounded-xl p-4">
        <h3 className="text-sm font-medium text-white mb-4">Platform breakdown</h3>
        <div className="space-y-3">
          {[
            { name: "Twitch", views: 12400, pct: 42, color: "bg-purple-500" },
            { name: "YouTube", views: 8900, pct: 30, color: "bg-red-500" },
            { name: "TikTok", views: 5200, pct: 18, color: "bg-teal-500" },
            { name: "Discord", views: 2900, pct: 10, color: "bg-indigo-500" },
          ].map((p) => (
            <div key={p.name}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-zinc-300">{p.name}</span>
                <span className="text-zinc-500">{p.views.toLocaleString()} views ({p.pct}%)</span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div className={`h-full ${p.color} rounded-full`} style={{ width: `${p.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
