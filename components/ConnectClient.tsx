"use client";

import { useEffect, useRef, useState } from "react";
import {
  IconBrandYoutube,
  IconBrandTiktok,
  IconBrandInstagram,
  IconBrandTwitch,
  IconBrandDiscord,
  IconCheck,
  IconPlugConnected,
  IconPlugConnectedX,
  IconExternalLink,
  IconLoader2,
} from "@tabler/icons-react";
import type { PlatformToken } from "@/lib/db";

type Platform = {
  id: string;
  name: string;
  icon: React.ElementType;
  iconColor: string;
  description: string;
  capabilities: string[];
  available: boolean;
};

const PLATFORMS: Platform[] = [
  {
    id: "youtube",
    name: "YouTube",
    icon: IconBrandYoutube,
    iconColor: "text-red-400",
    description: "Upload clips to your YouTube channel and read live stream data.",
    capabilities: ["Upload clips", "Read live chat", "Schedule posts"],
    available: true,
  },
  {
    id: "twitch",
    name: "Twitch",
    icon: IconBrandTwitch,
    iconColor: "text-purple-400",
    description: "Ingest live stream chat and detect engagement spikes in real time.",
    capabilities: ["Live chat ingestion", "Spike detection", "VOD access"],
    available: true,
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: IconBrandTiktok,
    iconColor: "text-white",
    description: "Publish vertical 9:16 clips directly to TikTok.",
    capabilities: ["Upload clips", "Draft scheduling"],
    available: true,
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: IconBrandInstagram,
    iconColor: "text-pink-400",
    description: "Post Reels directly to your Instagram account.",
    capabilities: ["Upload Reels", "Story posts"],
    available: false,
  },
  {
    id: "discord",
    name: "Discord",
    icon: IconBrandDiscord,
    iconColor: "text-indigo-400",
    description: "Send clip notifications to a Discord channel via webhook.",
    capabilities: ["Clip notifications", "Custom messages"],
    available: true,
  },
];

type Props = {
  connectedPlatforms: string[];
  tokens: PlatformToken[];
  success?: string;
  errorParam?: string;
};

export function ConnectClient({ connectedPlatforms, tokens, success, errorParam }: Props) {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(() => {
    if (success) return { type: "success", message: `${capitalize(success)} connected successfully!` };
    if (errorParam) return { type: "error", message: decodeURIComponent(errorParam) };
    return null;
  });
  const [navigateTo, setNavigateTo] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!toast) return;
    toastTimerRef.current = setTimeout(() => setToast(null), 4000);
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [toast]);

  useEffect(() => {
    if (navigateTo) window.location.href = navigateTo;
  }, [navigateTo]);

  const handleConnect = (platformId: string) => {
    setConnecting(platformId);
    setNavigateTo(`/api/connect/${platformId}`);
  };

  const handleDisconnect = async (platformId: string) => {
    setDisconnecting(platformId);
    const res = await fetch(`/api/connect/${platformId}`, { method: "DELETE" });
    if (res.ok) {
      window.location.reload();
    } else {
      setToast({ type: "error", message: "Failed to disconnect. Please try again." });
      setDisconnecting(null);
    }
  };

  return (
    <div className="p-6 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <IconPlugConnected size={20} stroke={1.5} className="text-zinc-400" />
          <h1 className="text-xl font-medium text-white">Platform connections</h1>
        </div>
        <p className="text-sm text-zinc-500">
          Connect your streaming and publishing platforms. Truss uses these to ingest live chat,
          detect engagement spikes, and publish clips automatically.
        </p>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`mb-6 flex items-center gap-3 px-4 py-3 rounded-xl border text-sm ${
            toast.type === "success"
              ? "bg-success/10 border-success/20 text-success"
              : "bg-danger/10 border-danger/20 text-danger"
          }`}
        >
          {toast.type === "success" ? <IconCheck size={16} /> : <IconPlugConnectedX size={16} />}
          {toast.message}
        </div>
      )}

      <div className="space-y-3">
        {PLATFORMS.map((platform) => {
          const isConnected = connectedPlatforms.includes(platform.id);
          const token = tokens.find((t) => t.platform === platform.id);
          const isConnecting = connecting === platform.id;
          const isDisconnecting = disconnecting === platform.id;

          return (
            <div
              key={platform.id}
              className={`bg-panel border rounded-xl p-5 transition-colors ${
                isConnected ? "border-accent/30" : "border-border"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-11 h-11 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0 ${!platform.available ? "opacity-40" : ""}`}>
                    <platform.icon size={22} stroke={1.5} className={platform.iconColor} />
                  </div>

                  {/* Info */}
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-medium text-white">{platform.name}</p>
                      {!platform.available && (
                        <span className="text-[10px] px-2 py-0.5 bg-zinc-800 text-zinc-500 rounded-full">
                          Coming soon
                        </span>
                      )}
                      {isConnected && (
                        <span className="flex items-center gap-1 text-[10px] text-success">
                          <span className="w-1.5 h-1.5 rounded-full bg-success" />
                          Connected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 mb-2">{platform.description}</p>
                    {token?.username && (
                      <p className="text-xs text-zinc-400 mb-2">
                        Signed in as <span className="text-white">{token.username}</span>
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      {platform.capabilities.map((cap) => (
                        <span key={cap} className="text-[10px] px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded-full">
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action */}
                <div className="shrink-0">
                  {!platform.available ? (
                    <span className="text-xs text-zinc-600 px-3 py-2 border border-zinc-800 rounded-lg block">
                      Not yet available
                    </span>
                  ) : isConnected ? (
                    <button
                      onClick={() => handleDisconnect(platform.id)}
                      disabled={!!isDisconnecting}
                      className="flex items-center gap-2 px-3 py-2 text-xs border border-zinc-700 text-zinc-400 hover:text-danger hover:border-danger/40 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isDisconnecting ? (
                        <IconLoader2 size={13} className="animate-spin" />
                      ) : (
                        <IconPlugConnectedX size={13} />
                      )}
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnect(platform.id)}
                      disabled={!!isConnecting}
                      className="flex items-center gap-2 px-3 py-2 text-xs bg-accent hover:bg-accent/90 text-white rounded-lg transition-colors disabled:opacity-60 font-medium"
                    >
                      {isConnecting ? (
                        <IconLoader2 size={13} className="animate-spin" />
                      ) : (
                        <IconExternalLink size={13} />
                      )}
                      Connect
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
