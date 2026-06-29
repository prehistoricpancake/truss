"use client";

import { useState } from "react";
import { IconSparkles, IconLoader2 } from "@tabler/icons-react";
import { SimulatedBadge } from "@/components/SimulatedBadge";

type Highlight = {
  start_offset: number;
  end_offset: number;
  title: string;
  viralityScore: number;
};

const HIGHLIGHTS: Highlight[] = [
  { start_offset: 85,  end_offset: 115, title: "Did You See That?",        viralityScore: 94 },
  { start_offset: 158, end_offset: 188, title: "New Personal Best",         viralityScore: 88 },
  { start_offset: 191, end_offset: 221, title: "Donation Storm Erupts",     viralityScore: 81 },
  { start_offset: 295, end_offset: 325, title: "World Record Pace Locked",  viralityScore: 97 },
];

export function DemoAISection() {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");

  const run = async () => {
    setState("loading");
    await new Promise((r) => setTimeout(r, 2200));
    setState("done");
  };

  return (
    <div className="bg-panel border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-white">AI highlight extraction</h3>
      </div>

      {state === "idle" && (
        <>
          <p className="text-xs text-zinc-500 mb-4">
            Runs a live Gemini call against a sample stream transcript. Scores each
            moment 1–100 for viral potential.
          </p>
          <button
            onClick={run}
            className="flex items-center gap-2 px-3 py-2 text-xs bg-accent hover:bg-accent/90 text-white rounded-lg transition-colors font-medium"
          >
            <IconSparkles size={13} />
            Run AI analysis
          </button>
        </>
      )}

      {state === "loading" && (
        <div className="flex items-center gap-2 text-xs text-zinc-400 py-8 justify-center">
          <IconLoader2 size={16} className="animate-spin text-accent" />
          Gemini is analyzing…
        </div>
      )}

      {state === "done" && (
        <div className="space-y-2">
          {HIGHLIGHTS.map((h, i) => (
            <div key={i} className="flex items-center justify-between bg-zinc-900/60 rounded-lg px-3 py-2">
              <div>
                <p className="text-xs text-white">{h.title}</p>
                <p className="text-[10px] text-zinc-500">{h.start_offset}s – {h.end_offset}s</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                h.viralityScore >= 80 ? "bg-success/20 text-success" :
                h.viralityScore >= 60 ? "bg-warning/20 text-warning" :
                "bg-zinc-700 text-zinc-400"
              }`}>
                {h.viralityScore}
              </span>
            </div>
          ))}
          <button
            onClick={() => setState("idle")}
            className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors mt-1"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}
