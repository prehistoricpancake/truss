"use client";

import { useRef, useEffect } from "react";

export interface ChatMessage {
  id: string;
  platform: "twitch" | "youtube" | "tiktok" | "discord";
  username: string;
  message: string;
  timestamp: string;
  isSpike?: boolean;
}

const platformColors: Record<string, string> = {
  twitch: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  youtube: "bg-red-500/20 text-red-400 border-red-500/30",
  tiktok: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  discord: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
};

interface ChatFeedProps {
  messages: ChatMessage[];
}

export function ChatFeed({ messages }: ChatFeedProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-sm font-medium text-white">Unified chat</h3>
        <p className="text-xs text-zinc-500 mt-0.5">
          Twitch · YouTube · TikTok · Discord
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
        {messages.map((msg) => (
          <div key={msg.id}>
            {msg.isSpike && (
              <div className="flex items-center gap-2 my-3">
                <div className="flex-1 h-px bg-accent/40" />
                <span className="text-[10px] font-medium text-accent uppercase tracking-wider">
                  spike detected
                </span>
                <div className="flex-1 h-px bg-accent/40" />
              </div>
            )}
            <div className="flex items-start gap-2 py-1.5 group">
              <span
                className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium border shrink-0 mt-0.5 ${
                  platformColors[msg.platform]
                }`}
              >
                {msg.platform.slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-medium text-zinc-300">
                  {msg.username}
                </span>
                <span className="text-xs text-zinc-500 ml-2">
                  {msg.timestamp}
                </span>
                <p className="text-sm text-zinc-400 break-words">
                  {msg.message}
                </p>
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Footer input */}
      <div className="px-4 py-3 border-t border-border">
        <div className="bg-panel-auth-input rounded-lg px-3 py-2 text-sm text-zinc-600 cursor-not-allowed">
          Read-only in demo mode
        </div>
      </div>
    </div>
  );
}
