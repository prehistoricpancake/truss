"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  IconBrandYoutube,
  IconBrandTiktok,
  IconBrandInstagram,
  IconBrandTwitch,
  IconBrandDiscord,
  IconCheck,
  IconArrowRight,
  IconLoader2,
} from "@tabler/icons-react";
import { completeOnboarding } from "@/app/actions/onboarding";

const platforms = [
  { id: "youtube",   name: "YouTube",   icon: IconBrandYoutube,  color: "text-red-400" },
  { id: "tiktok",    name: "TikTok",    icon: IconBrandTiktok,   color: "text-white" },
  { id: "instagram", name: "Instagram", icon: IconBrandInstagram, color: "text-pink-400" },
  { id: "twitch",    name: "Twitch",    icon: IconBrandTwitch,   color: "text-purple-400" },
  { id: "discord",   name: "Discord",   icon: IconBrandDiscord,  color: "text-indigo-400" },
];

const steps = ["Welcome", "Platforms", "Ready"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const togglePlatform = (id: string) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]);

  const handleFinish = async () => {
    setSaving(true);
    setError("");
    const result = await completeOnboarding(displayName, selected);
    if (!result.success) {
      setError(result.error ?? "Something went wrong");
      setSaving(false);
      return;
    }
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-bg-cinematic flex flex-col items-center justify-center px-6 py-12">
      <div className="flex items-center gap-2 mb-12">
        <Image src="/logos/2.png" alt="Truss" width={28} height={28} className="rounded" />
        <span className="text-lg font-semibold text-white tracking-tight">truss</span>
      </div>

      {/* Step dots */}
      <div className="flex items-center gap-2 mb-10">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full transition-colors ${i <= step ? "bg-accent" : "bg-zinc-700"}`} />
            {i < steps.length - 1 && <div className="w-8 h-px bg-zinc-800" />}
          </div>
        ))}
      </div>

      <div className="w-full max-w-md">
        {/* Step 0 — name */}
        {step === 0 && (
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome to Truss</h1>
            <p className="text-zinc-500 text-sm mb-8">Let&apos;s get you set up. It only takes a minute.</p>

            <div className="text-left mb-6">
              <label className="block text-xs text-zinc-500 mb-1.5">What should we call you?</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && displayName.trim() && setStep(1)}
                placeholder="Your name or creator handle"
                className="w-full px-4 py-3 bg-panel border border-border rounded-lg text-sm text-white placeholder-zinc-600 outline-none focus:border-accent/50 transition-colors"
                autoFocus
              />
            </div>

            <button
              onClick={() => setStep(1)}
              disabled={!displayName.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 bg-accent hover:bg-accent/90 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Continue <IconArrowRight size={16} stroke={1.5} />
            </button>
          </div>
        )}

        {/* Step 1 — platforms */}
        {step === 1 && (
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 text-center">Where do you publish?</h1>
            <p className="text-zinc-500 text-sm mb-8 text-center">
              Select the platforms you post to. You&apos;ll connect them properly in the next step.
            </p>

            <div className="space-y-3 mb-8">
              {platforms.map((platform) => {
                const isSelected = selected.includes(platform.id);
                return (
                  <button
                    key={platform.id}
                    onClick={() => togglePlatform(platform.id)}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? "border-accent bg-accent/5"
                        : "border-border bg-panel hover:border-zinc-600"
                    }`}
                  >
                    <platform.icon size={20} stroke={1.5} className={platform.color} />
                    <span className="text-sm text-white font-medium flex-1 text-left">{platform.name}</span>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                        <IconCheck size={12} stroke={2.5} className="text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(0)}
                className="px-4 py-3 border border-border text-zinc-400 text-sm rounded-lg hover:text-white hover:border-zinc-500 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(2)}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-accent hover:bg-accent/90 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {selected.length === 0
                  ? "Skip for now"
                  : `Continue with ${selected.length} platform${selected.length > 1 ? "s" : ""}`}
                <IconArrowRight size={16} stroke={1.5} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — ready */}
        {step === 2 && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
              <IconCheck size={32} stroke={1.5} className="text-accent" />
            </div>

            <h1 className="text-3xl font-bold text-white mb-2">
              You&apos;re all set, {displayName}!
            </h1>
            <p className="text-zinc-500 text-sm mb-8">
              {selected.length > 0
                ? `We'll help you connect ${selected.join(", ")} once you're in the dashboard.`
                : "Start by uploading your first video or exploring the dashboard."}
            </p>

            {error && (
              <div className="mb-4 px-3 py-2 bg-danger/10 border border-danger/20 rounded-lg text-xs text-danger">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={handleFinish}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-3 bg-accent hover:bg-accent/90 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {saving ? (
                  <><IconLoader2 size={16} className="animate-spin" /> Setting up your workspace…</>
                ) : (
                  "Go to dashboard"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
