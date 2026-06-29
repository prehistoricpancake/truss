"use client";

import { useEffect, useState, useCallback } from "react";
import { IconX, IconArrowRight, IconArrowLeft } from "@tabler/icons-react";

type Step = {
  targetId: string;
  title: string;
  body: string;
  placement: "top" | "bottom" | "left" | "right";
};

const STEPS: Step[] = [
  {
    targetId: "stat-row",
    title: "Your live metrics",
    body: "Clips created, virality score, queue depth, and total watch time — all updated in real time as you upload and publish.",
    placement: "bottom",
  },
  {
    targetId: "processing-card",
    title: "AI processing queue",
    body: "Upload a video and our AI (Gemini) extracts the highest-virality highlights automatically. No manual scrubbing needed.",
    placement: "right",
  },
  {
    targetId: "velocity-card",
    title: "Chat velocity",
    body: "When you're live, engagement spikes are detected and logged here. Every spike is a potential clip moment.",
    placement: "left",
  },
  {
    targetId: "assets-row",
    title: "Recent uploads",
    body: "Your uploaded videos appear here with status — uploading, processing, or ready to publish.",
    placement: "top",
  },
  {
    targetId: "nav-connect",
    title: "Connect your platforms",
    body: "Link YouTube, TikTok, Twitch and more to publish clips directly from Truss. One click to every platform.",
    placement: "right",
  },
];

const LS_KEY = "truss:tour-done";
const PAD = 10;

type Rect = { x: number; y: number; w: number; h: number };

function getRect(id: string): Rect | null {
  const el = document.getElementById(id);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.left - PAD, y: r.top - PAD, w: r.width + PAD * 2, h: r.height + PAD * 2 };
}

function tooltipPosition(rect: Rect, placement: Step["placement"]): React.CSSProperties {
  switch (placement) {
    case "bottom": return { top: rect.y + rect.h + 12, left: Math.max(16, rect.x) };
    case "top":    return { top: rect.y - 12, left: Math.max(16, rect.x), transform: "translateY(-100%)" };
    case "right":  return { top: rect.y, left: rect.x + rect.w + 12 };
    case "left":   return { top: rect.y, left: rect.x - 12, transform: "translateX(-100%)" };
  }
}

export function OnboardingTooltip() {
  const [step, setStep] = useState(-1);
  const [rect, setRect] = useState<Rect | null>(null);

  const updateRect = useCallback((idx: number) => {
    if (idx < 0 || idx >= STEPS.length) return;
    const r = getRect(STEPS[idx].targetId);
    if (r) {
      setRect(r);
      document.getElementById(STEPS[idx].targetId)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem(LS_KEY)) {
      const t = setTimeout(() => {
        setStep(0);
        updateRect(0);
      }, 600);
      return () => clearTimeout(t);
    }
  }, [updateRect]);

  // Recompute on scroll / resize
  useEffect(() => {
    if (step < 0) return;
    const handler = () => updateRect(step);
    window.addEventListener("scroll", handler, true);
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("scroll", handler, true);
      window.removeEventListener("resize", handler);
    };
  }, [step, updateRect]);

  const finish = () => {
    localStorage.setItem(LS_KEY, "1");
    setStep(-1);
  };
  const next = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      updateRect(step + 1);
    } else {
      finish();
    }
  };
  const back = () => {
    setStep(step - 1);
    updateRect(step - 1);
  };

  if (step < 0 || step >= STEPS.length || !rect) return null;

  const current = STEPS[step];

  return (
    <>
      {/* Dimmed overlay with spotlight cutout via SVG mask */}
      <svg
        className="fixed inset-0 z-40 pointer-events-none"
        style={{ width: "100vw", height: "100vh" }}
        aria-hidden
      >
        <defs>
          <mask id="truss-tour-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect x={rect.x} y={rect.y} width={rect.w} height={rect.h} rx="10" fill="black" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.72)" mask="url(#truss-tour-mask)" />
      </svg>

      {/* Spotlight ring */}
      <div
        className="fixed z-40 pointer-events-none rounded-xl ring-2 ring-accent/70 transition-all duration-300"
        style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}
      />

      {/* Tooltip card */}
      <div
        className="fixed z-50 w-72 bg-[#141414] border border-border rounded-xl shadow-2xl p-4"
        style={tooltipPosition(rect, current.placement)}
      >
        <div className="flex items-start justify-between mb-1">
          <p className="text-sm font-semibold text-white leading-snug">{current.title}</p>
          <button onClick={finish} className="text-zinc-600 hover:text-zinc-400 ml-2 shrink-0">
            <IconX size={14} />
          </button>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed mb-4">{current.body}</p>

        {/* Step dots */}
        <div className="flex items-center gap-1.5 mb-4">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all ${i === step ? "w-4 bg-accent" : "w-1.5 bg-zinc-700"}`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between">
          <button onClick={finish} className="text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors">
            Skip tour
          </button>
          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={back}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs border border-border text-zinc-300 rounded-lg hover:bg-white/5 transition-colors"
              >
                <IconArrowLeft size={12} /> Back
              </button>
            )}
            <button
              onClick={next}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium"
            >
              {step < STEPS.length - 1 ? <>Next <IconArrowRight size={12} /></> : "Done!"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
