"use client";

import { useEffect, useState } from "react";

export function WarpedHero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative w-full h-[600px] overflow-hidden bg-bg-cinematic flex items-center justify-center">
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 motion-reduce:animate-none"
        style={{
          background: "radial-gradient(ellipse at center, #6d5ef0 0%, #f87171 40%, #0a0a0a 70%)",
          opacity: 0.4,
          animation: "heroGlow 8s ease-in-out infinite alternate",
        }}
      />

      {/* Floating orbs */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full motion-reduce:animate-none"
        style={{
          background: "radial-gradient(circle, rgba(109,94,240,0.25) 0%, transparent 70%)",
          top: "10%",
          left: "15%",
          animation: "orbFloat1 12s ease-in-out infinite",
          filter: "blur(60px)",
        }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full motion-reduce:animate-none"
        style={{
          background: "radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)",
          bottom: "5%",
          right: "10%",
          animation: "orbFloat2 10s ease-in-out infinite",
          filter: "blur(50px)",
        }}
      />
      <div
        className="absolute w-[300px] h-[300px] rounded-full motion-reduce:animate-none"
        style={{
          background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
          top: "40%",
          right: "30%",
          animation: "orbFloat3 14s ease-in-out infinite",
          filter: "blur(40px)",
        }}
      />

      {/* 3D perspective room */}
      <div
        className="absolute inset-0 motion-reduce:hidden"
        style={{ perspective: "800px", perspectiveOrigin: "50% 50%" }}
      >
        {/* Floor plane */}
        <div
          className="absolute inset-x-0 bottom-0 h-[300px] flex items-center justify-center gap-16"
          style={{
            transform: "rotateX(60deg) translateZ(-100px)",
            transformOrigin: "center bottom",
          }}
        >
          {["PUBLISH", "ONCE", "EVERYWHERE"].map((word, i) => (
            <span
              key={`floor-${i}`}
              className="text-[80px] font-black italic tracking-wider select-none"
              style={{
                color: "#6d5ef0",
                opacity: mounted ? 0.15 + i * 0.05 : 0,
                transition: `opacity 0.8s ease ${i * 0.2}s`,
                textShadow: "0 0 40px rgba(109,94,240,0.3)",
              }}
            >
              {word}
            </span>
          ))}
        </div>

        {/* Ceiling plane */}
        <div
          className="absolute inset-x-0 top-0 h-[300px] flex items-center justify-center gap-16"
          style={{
            transform: "rotateX(-60deg) translateZ(-100px)",
            transformOrigin: "center top",
          }}
        >
          {["CREATE", "DISTRIBUTE", "STREAM"].map((word, i) => (
            <span
              key={`ceil-${i}`}
              className="text-[80px] font-black italic tracking-wider select-none"
              style={{
                color: "#6d5ef0",
                opacity: mounted ? 0.12 + i * 0.04 : 0,
                transition: `opacity 0.8s ease ${i * 0.15 + 0.3}s`,
                textShadow: "0 0 40px rgba(109,94,240,0.2)",
              }}
            >
              {word}
            </span>
          ))}
        </div>

        {/* Left wall */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[400px] flex flex-col items-start justify-center gap-8 pl-8"
          style={{
            transform: "rotateY(45deg) translateZ(-200px)",
            transformOrigin: "left center",
          }}
        >
          {["YOURS", "TO", "PUBLISH"].map((word, i) => (
            <span
              key={`left-${i}`}
              className="text-[72px] font-black italic tracking-wider select-none"
              style={{
                color: "#6d5ef0",
                opacity: mounted ? 0.1 + i * 0.05 : 0,
                transition: `opacity 0.8s ease ${i * 0.2 + 0.5}s`,
                textShadow: "0 0 30px rgba(109,94,240,0.25)",
              }}
            >
              {word}
            </span>
          ))}
        </div>

        {/* Right wall */}
        <div
          className="absolute right-0 top-0 bottom-0 w-[400px] flex flex-col items-end justify-center gap-8 pr-8"
          style={{
            transform: "rotateY(-45deg) translateZ(-200px)",
            transformOrigin: "right center",
          }}
        >
          {["CLIP", "SHARE", "GROW"].map((word, i) => (
            <span
              key={`right-${i}`}
              className="text-[72px] font-black italic tracking-wider select-none"
              style={{
                color: "#6d5ef0",
                opacity: mounted ? 0.1 + i * 0.05 : 0,
                transition: `opacity 0.8s ease ${i * 0.2 + 0.6}s`,
                textShadow: "0 0 30px rgba(109,94,240,0.25)",
              }}
            >
              {word}
            </span>
          ))}
        </div>
      </div>

      {/* Center overlay — main headline */}
      <div className="relative z-10 text-center flex flex-col items-center gap-6">
        <h1
          className="text-[56px] md:text-[64px] font-extrabold text-white leading-tight tracking-tight"
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.6s ease 0.8s",
          }}
        >
          YOURS TO PUBLISH
        </h1>
        <p
          className="text-zinc-400 text-lg max-w-md"
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.6s ease 1s",
          }}
        >
          One video in, every platform out. Intelligent clips, chapters, and scheduling.
        </p>

        {/* CTA button */}
        <a
          href="/login"
          className="mt-4 inline-flex items-center px-8 py-3 bg-accent hover:bg-accent/90 text-white text-sm font-medium rounded-full transition-colors"
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.6s ease 1.2s",
          }}
        >
          Get started
        </a>
      </div>

      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, #0a0a0a 80%)",
        }}
      />

      {/* Keyframe animations */}
      <style jsx>{`
        @keyframes heroGlow {
          0% {
            transform: scale(1) rotate(0deg);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.1) rotate(2deg);
            opacity: 0.5;
          }
          100% {
            transform: scale(1.05) rotate(-1deg);
            opacity: 0.35;
          }
        }
        @keyframes orbFloat1 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(60px, -40px) scale(1.1);
          }
          66% {
            transform: translate(-30px, 30px) scale(0.95);
          }
        }
        @keyframes orbFloat2 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(-50px, 30px) scale(1.05);
          }
          66% {
            transform: translate(40px, -20px) scale(0.9);
          }
        }
        @keyframes orbFloat3 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(30px, 50px) scale(1.15);
          }
        }
      `}</style>
    </section>
  );
}
