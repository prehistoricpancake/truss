import {
  IconFolder,
  IconUpload,
} from "@tabler/icons-react";
import Link from "next/link";

const assets = [
  { id: "vid-001", filename: "10378789-uhd_2160_4096_25fps.mp4", chapters: 5, status: "ready", size: "27.5 MB", date: "Jun 25", videoSrc: "/videos/10378789-uhd_2160_4096_25fps.mp4" },
  { id: "vid-002", filename: "8039795-uhd_2160_4096_25fps.mp4", chapters: 8, status: "ready", size: "37.4 MB", date: "Jun 24", videoSrc: "/videos/8039795-uhd_2160_4096_25fps.mp4" },
  { id: "vid-003", filename: "12155414_1080_1920_30fps.mp4", chapters: 0, status: "processing", size: "5.6 MB", date: "Jun 26", videoSrc: "/videos/12155414_1080_1920_30fps.mp4" },
  { id: "vid-004", filename: "13400159-hd_1080_1920_60fps.mp4", chapters: 12, status: "ready", size: "7.7 MB", date: "Jun 23", videoSrc: "/videos/13400159-hd_1080_1920_60fps.mp4" },
  { id: "vid-005", filename: "8134919-hd_1080_1920_25fps.mp4", chapters: 6, status: "ready", size: "8.3 MB", date: "Jun 22", videoSrc: "/videos/8134919-hd_1080_1920_25fps.mp4" },
  { id: "vid-006", filename: "video1.mp4", chapters: 4, status: "ready", size: "8.3 MB", date: "Jun 27", videoSrc: "/videos/video1.mp4" },
  { id: "vid-007", filename: "video2.mp4", chapters: 3, status: "ready", size: "8.0 MB", date: "Jun 27", videoSrc: "/videos/video2.mp4" },
];

export default function AssetsPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <IconFolder size={20} stroke={1.5} className="text-zinc-400" />
          <h1 className="text-xl font-medium text-white">Assets</h1>
          <span className="text-sm text-zinc-500">{assets.length} files</span>
        </div>
        <Link
          href="/upload"
          className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/90 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <IconUpload size={16} stroke={1.5} />
          Upload
        </Link>
      </div>

      <div className="bg-panel border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs text-zinc-500 font-normal px-4 py-3 w-24">Preview</th>
              <th className="text-left text-xs text-zinc-500 font-normal px-4 py-3">Filename</th>
              <th className="text-left text-xs text-zinc-500 font-normal px-4 py-3">Chapters</th>
              <th className="text-left text-xs text-zinc-500 font-normal px-4 py-3">Size</th>
              <th className="text-left text-xs text-zinc-500 font-normal px-4 py-3">Date</th>
              <th className="text-left text-xs text-zinc-500 font-normal px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr key={asset.id} className="border-b border-border-hair hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-2">
                  <div className="w-20 h-12 rounded-md overflow-hidden bg-zinc-900">
                    <video
                      src={asset.videoSrc}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                      preload="metadata"
                    />
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-white">{asset.filename}</td>
                <td className="px-4 py-3 text-sm text-zinc-400">{asset.chapters}</td>
                <td className="px-4 py-3 text-sm text-zinc-400">{asset.size}</td>
                <td className="px-4 py-3 text-sm text-zinc-400">{asset.date}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    asset.status === "ready" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                  }`}>
                    {asset.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
