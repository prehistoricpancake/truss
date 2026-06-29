"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  IconBolt,
  IconPlayerPlay,
  IconPlayerPause,
  IconScissors,
} from "@tabler/icons-react";

type Msg = { id: number; user: string; text: string; color: string };

const NORMAL: Omit<Msg, "id">[] = [
  { user: "xXGamerPro", text: "nice shot bro", color: "#6bc5ff" },
  { user: "StreamFan42", text: "how is he so good at this", color: "#a8ff78" },
  { user: "lurker_7781", text: "been watching 2h worth it", color: "#ffd93d" },
  { user: "QuickTyper", text: "monkaS", color: "#ff9ff3" },
  { user: "Kappa_lord", text: "KEKW", color: "#ffb347" },
  { user: "NightOwl99", text: "keep it up!", color: "#87ceeb" },
  { user: "viewer_anon", text: "first time here, instantly subbed", color: "#dda0dd" },
  { user: "chatMod", text: "PogChamp", color: "#98fb98" },
  { user: "FastChat", text: "based", color: "#6bc5ff" },
  { user: "OldTimer", text: "this run is looking clean", color: "#a8ff78" },
  { user: "RandomGuy", text: "let's goooo", color: "#ffb347" },
  { user: "SilentViewer", text: "finally came out of lurk", color: "#dda0dd" },
];

const SPIKE: Omit<Msg, "id">[] = [
  { user: "xXGamerPro", text: "LETS GOOOOO 🔥🔥🔥", color: "#ff4444" },
  { user: "HypeBot", text: "🚂 HYPE TRAIN LEVEL 4!", color: "#ffd700" },
  { user: "SubBot", text: "⭐ viewer_anon just subscribed!", color: "#00fa9a" },
  { user: "DonationBot", text: "💰 StreamFan42 donated $50 — 'INSANE'", color: "#ffd700" },
  { user: "StreamFan42", text: "CLIP IT CLIP IT CLIP IT", color: "#ff9ff3" },
  { user: "chatMod", text: "WR WR WR WR WR", color: "#ffd700" },
  { user: "HypeKid", text: "I CANNOT BELIEVE WHAT I JUST SAW", color: "#ff4444" },
  { user: "SubBot", text: "⭐ NightOwl99 just subscribed!", color: "#00fa9a" },
  { user: "DonationBot", text: "💰 Kappa_lord donated $100 — 'THE GOAT'", color: "#ffd700" },
  { user: "SpeedRunner", text: "WORLD RECORD PACE???", color: "#ff4444" },
  { user: "QuickTyper", text: "PogChamp PogChamp PogChamp", color: "#6bc5ff" },
  { user: "FastChat", text: "this is what I live for", color: "#a8ff78" },
  { user: "chatMod", text: "OMEGALUL HE DID IT", color: "#ffd93d" },
  { user: "RageViewer", text: "I'm going insane rn", color: "#ff6b6b" },
  { user: "DonationBot", text: "💰 OldTimer donated $25 — 'legendary'", color: "#ffd700" },
];

const BASELINE = 8;
const SPIKE_THRESHOLD = BASELINE * 2;

export function DemoChatSimulator() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [rate, setRate] = useState(0);
  const [isSpike, setIsSpike] = useState(false);
  const [running, setRunning] = useState(true);
  const [clips, setClips] = useState<string[]>([]);

  const counterRef = useRef(0);
  const tsRef = useRef<number[]>([]);
  const isSpikeRef = useRef(false);
  const runRef = useRef(true);
  const normalIdxRef = useRef(0);
  const spikeIdxRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    runRef.current = running;
  }, [running]);

  const markClip = useCallback(() => {
    const t = new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setClips((prev) => [t, ...prev.slice(0, 4)]);
  }, []);

  const triggerSpike = useCallback(() => {
    if (isSpikeRef.current) return;
    const now = Date.now();
    for (let i = 0; i < SPIKE_THRESHOLD + 2; i++) {
      tsRef.current.push(now - i * 40);
    }
    setRate(SPIKE_THRESHOLD + 2);
    isSpikeRef.current = true;
    setIsSpike(true);
    markClip();
    setTimeout(() => {
      isSpikeRef.current = false;
      setIsSpike(false);
    }, 9000);
  }, [markClip]);

  const tick = useCallback(() => {
    if (!runRef.current) {
      timerRef.current = setTimeout(tick, 300);
      return;
    }

    const now = Date.now();
    const pool = isSpikeRef.current ? SPIKE : NORMAL;
    const idxRef = isSpikeRef.current ? spikeIdxRef : normalIdxRef;
    const template = pool[idxRef.current % pool.length];
    idxRef.current++;
    counterRef.current++;

    setMsgs((prev) => [
      ...prev.slice(-30),
      { id: counterRef.current, ...template },
    ]);

    tsRef.current = tsRef.current.filter((t) => now - t < 10_000);
    tsRef.current.push(now);
    const currentRate = tsRef.current.length;
    setRate(currentRate);

    if (currentRate >= SPIKE_THRESHOLD && !isSpikeRef.current) {
      isSpikeRef.current = true;
      setIsSpike(true);
      markClip();
      setTimeout(() => {
        isSpikeRef.current = false;
        setIsSpike(false);
      }, 9000);
    }

    timerRef.current = setTimeout(tick, isSpikeRef.current ? 90 : 1200);
  }, [markClip]);

  useEffect(() => {
    timerRef.current = setTimeout(tick, 1200);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [tick]);

  // Auto-trigger spike at 20s so judges see the feature without clicking
  useEffect(() => {
    const t = setTimeout(triggerSpike, 20_000);
    return () => clearTimeout(t);
  }, [triggerSpike]);

  const pct = Math.min((rate / SPIKE_THRESHOLD) * 100, 100);

  return (
    <div
      className={`bg-panel border rounded-xl p-4 flex flex-col transition-all duration-300 ${
        isSpike
          ? "border-danger/60 shadow-[0_0_24px_rgba(239,68,68,0.12)]"
          : "border-border"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isSpike ? "bg-danger animate-ping" : "bg-danger animate-pulse"
            }`}
          />
          <h3 className="text-sm font-medium text-white">Live stream chat</h3>
          {isSpike && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-danger bg-danger/10 border border-danger/20 px-2 py-0.5 rounded-full">
              <IconBolt size={10} />
              SPIKE DETECTED
            </span>
          )}
        </div>
        <button
          onClick={() => setRunning((r) => !r)}
          className="text-zinc-600 hover:text-zinc-300 transition-colors"
        >
          {running ? <IconPlayerPause size={14} /> : <IconPlayerPlay size={14} />}
        </button>
      </div>

      {/* Rate bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-[9px] mb-1">
          <span className="text-zinc-600">message rate / 10s window</span>
          <span
            className={`font-mono font-medium ${
              isSpike ? "text-danger" : rate >= SPIKE_THRESHOLD * 0.7 ? "text-warning" : "text-zinc-500"
            }`}
          >
            {rate} / {SPIKE_THRESHOLD} threshold
          </span>
        </div>
        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              pct >= 100 ? "bg-danger" : pct >= 65 ? "bg-warning" : "bg-success"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Chat feed — newest at bottom */}
      <div className="h-[200px] overflow-hidden flex flex-col-reverse gap-0.5 mb-3">
        {[...msgs].reverse().map((m) => (
          <div key={m.id} className="flex items-baseline gap-1.5 shrink-0">
            <span
              className="text-[10px] font-medium leading-5 shrink-0"
              style={{ color: m.color }}
            >
              {m.user}
            </span>
            <span className="text-[10px] text-zinc-400 leading-5">{m.text}</span>
          </div>
        ))}
      </div>

      {/* Auto-clips */}
      {clips.length > 0 && (
        <div className="border-t border-border pt-2.5 mb-3">
          <p className="text-[9px] text-zinc-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <IconScissors size={9} />
            auto-clipped moments
          </p>
          <div className="space-y-1">
            {clips.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[10px] text-success font-mono">{c}</span>
                <span className="text-[9px] text-zinc-600">spike clip auto-marked</span>
                {i === 0 && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-success/10 text-success">
                    latest
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={triggerSpike}
        disabled={isSpike}
        className="mt-auto w-full py-1.5 text-[10px] font-medium border border-zinc-700 text-zinc-500 hover:text-white hover:border-danger/50 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isSpike ? "Spike active — clipping…" : "⚡ Simulate engagement spike →"}
      </button>
    </div>
  );
}
