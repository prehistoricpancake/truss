import { IconScissors } from "@tabler/icons-react";
import { SimulatedBadge } from "@/components/SimulatedBadge";

const clips = [
  { id: "clip-001", title: "Cinematic landscape shot", asset: "10378789-uhd_2160_4096_25fps.mp4", viralityScore: 92, status: "ready", videoSrc: "/videos/12155414_1080_1920_30fps.mp4" },
  { id: "clip-002", title: "Vertical mood piece", asset: "video1.mp4", viralityScore: 87, status: "ready", videoSrc: "/videos/video1.mp4" },
  { id: "clip-003", title: "Quick visual hook", asset: "8039795-uhd_2160_4096_25fps.mp4", viralityScore: 78, status: "ready", videoSrc: "/videos/8134919-hd_1080_1920_25fps.mp4" },
  { id: "clip-004", title: "Peak engagement moment", asset: "video2.mp4", viralityScore: 88, status: "published", videoSrc: "/videos/video2.mp4" },
  { id: "clip-005", title: "Viral potential extract", asset: "13400159-hd_1080_1920_60fps.mp4", viralityScore: 94, status: "queued", videoSrc: "/videos/13400159-hd_1080_1920_60fps.mp4" },
  { id: "clip-006", title: "Atmosphere reel", asset: "video1.mp4", viralityScore: 71, status: "ready", videoSrc: "/videos/video1.mp4" },
  { id: "clip-007", title: "Hero moment clip", asset: "video2.mp4", viralityScore: 95, status: "rendering", videoSrc: "/videos/video2.mp4" },
  { id: "clip-008", title: "Wide-angle reveal", asset: "8039795-uhd_2160_4096_25fps.mp4", viralityScore: 82, status: "queued", videoSrc: "/videos/8134919-hd_1080_1920_25fps.mp4" },
];

export default function ClipsPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <IconScissors size={20} stroke={1.5} className="text-zinc-400" />
          <h1 className="text-xl font-medium text-white">Clips</h1>
          <span className="text-sm text-zinc-500">{clips.length} clips</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {clips.map((clip) => (
          <div key={clip.id} className="bg-panel border border-border rounded-xl overflow-hidden">
            <div className="aspect-[9/16] max-h-[200px] relative overflow-hidden">
              <video
                src={clip.videoSrc}
                className="absolute inset-0 w-full h-full object-cover"
                muted
                playsInline
                preload="metadata"
              />
              <div className="absolute top-2 right-2">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  clip.viralityScore >= 80 ? "bg-success/20 text-success" :
                  clip.viralityScore >= 50 ? "bg-warning/20 text-warning" :
                  "bg-zinc-700/40 text-zinc-400"
                }`}>
                  {clip.viralityScore}
                </span>
              </div>
              {clip.status === "rendering" && (
                <div className="absolute bottom-2 left-2">
                  <SimulatedBadge label="Simulated for demo" />
                </div>
              )}
            </div>
            <div className="p-3">
              <p className="text-sm text-white truncate">{clip.title}</p>
              <p className="text-xs text-zinc-500 truncate mt-0.5">{clip.asset}</p>
              <div className="mt-2">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  clip.status === "ready" ? "bg-success/10 text-success" :
                  clip.status === "published" ? "bg-accent/10 text-accent" :
                  clip.status === "rendering" ? "bg-warning/10 text-warning" :
                  "bg-zinc-700/40 text-zinc-400"
                }`}>
                  {clip.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
