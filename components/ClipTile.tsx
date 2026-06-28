"use client";

import { useRef, useEffect } from "react";

interface ClipTileProps {
  viralityScore?: number;
  thumbnailUrl?: string;
  videoSrc?: string;
  span?: 1 | 2;
  showScore?: boolean;
}

export function ClipTile({
  viralityScore = 0,
  thumbnailUrl,
  videoSrc,
  span = 1,
  showScore = true,
}: ClipTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const scoreColor =
    viralityScore >= 80
      ? "bg-success/20 text-success"
      : viralityScore >= 50
      ? "bg-warning/20 text-warning"
      : "bg-zinc-700/40 text-zinc-400";

  return (
    <div
      className={`relative rounded-xl overflow-hidden group cursor-pointer ${
        span === 2 ? "row-span-2" : ""
      }`}
      style={{ minHeight: span === 2 ? "320px" : "160px" }}
    >
      {/* Video or thumbnail background */}
      {videoSrc ? (
        <video
          ref={videoRef}
          src={videoSrc}
          className="absolute inset-0 w-full h-full object-cover"
          muted
          loop
          autoPlay
          playsInline
          preload="auto"
        />
      ) : (
        <div
          className="absolute inset-0 bg-zinc-800"
          style={
            thumbnailUrl
              ? { backgroundImage: `url(${thumbnailUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
              : {
                  background: `linear-gradient(135deg, hsl(${viralityScore * 2.5}, 60%, 20%) 0%, hsl(${viralityScore * 3}, 50%, 15%) 100%)`,
                }
          }
        />
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

      {/* Virality badge */}
      {showScore && viralityScore > 0 && (
        <div className="absolute top-2 right-2 z-10">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium backdrop-blur-sm ${scoreColor}`}
          >
            {viralityScore}
          </span>
        </div>
      )}
    </div>
  );
}
