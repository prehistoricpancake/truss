"use client";

import { useState } from "react";
import {
  IconUser,
  IconBrandTwitch,
  IconBrandYoutube,
  IconBrandTiktok,
  IconBrandDiscord,
} from "@tabler/icons-react";

const tabs = ["Profile", "Connections", "Billing", "Notifications"];

const connectedPlatforms = [
  { name: "Twitch", icon: IconBrandTwitch, connected: true, username: "@alexchen_live" },
  { name: "YouTube", icon: IconBrandYoutube, connected: true, username: "Alex Chen" },
  { name: "TikTok", icon: IconBrandTiktok, connected: false, username: null },
  { name: "Discord", icon: IconBrandDiscord, connected: true, username: "alexchen#1234" },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("Profile");
  const [displayName, setDisplayName] = useState("Alex Chen");
  const [exportCrop, setExportCrop] = useState("9:16");

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <IconUser size={20} stroke={1.5} className="text-zinc-400" />
        <h1 className="text-xl font-medium text-white">Settings</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-border mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm transition-colors relative ${
              activeTab === tab
                ? "text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />
            )}
          </button>
        ))}
      </div>

      {activeTab === "Profile" && (
        <div className="space-y-6">
          {/* Avatar + info */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-purple-400 flex items-center justify-center text-xl font-semibold text-white">
              AC
            </div>
            <div>
              <p className="text-white font-medium">Alex Chen</p>
              <p className="text-sm text-zinc-500">creator@truss.dev</p>
            </div>
          </div>

          {/* Display name */}
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Display name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full max-w-sm px-4 py-2.5 bg-panel border border-border rounded-lg text-sm text-white outline-none focus:border-accent/50 transition-colors"
            />
          </div>

          {/* Export crop */}
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Default export crop</label>
            <select
              value={exportCrop}
              onChange={(e) => setExportCrop(e.target.value)}
              className="w-full max-w-sm px-4 py-2.5 bg-panel border border-border rounded-lg text-sm text-white outline-none focus:border-accent/50 transition-colors"
            >
              <option value="9:16">9:16 (Vertical — TikTok, Reels, Shorts)</option>
              <option value="1:1">1:1 (Square — Instagram)</option>
              <option value="16:9">16:9 (Landscape — YouTube)</option>
            </select>
          </div>
        </div>
      )}

      {activeTab === "Connections" && (
        <div className="grid grid-cols-2 gap-6">
          {/* Account info */}
          <div>
            <h3 className="text-sm font-medium text-white mb-4">Account</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Email</label>
                <p className="text-sm text-zinc-300">creator@truss.dev</p>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Plan</label>
                <p className="text-sm text-zinc-300">Pro ($29/mo)</p>
              </div>
            </div>
          </div>

          {/* Connected platforms */}
          <div>
            <h3 className="text-sm font-medium text-white mb-4">Connected platforms</h3>
            <div className="space-y-2">
              {connectedPlatforms.map((platform) => (
                <div
                  key={platform.name}
                  className="flex items-center justify-between p-3 bg-panel border border-border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <platform.icon size={18} stroke={1.5} className="text-zinc-400" />
                    <div>
                      <p className="text-sm text-white">{platform.name}</p>
                      {platform.username && (
                        <p className="text-xs text-zinc-500">{platform.username}</p>
                      )}
                    </div>
                  </div>
                  {platform.connected ? (
                    <span className="flex items-center gap-1.5 text-xs text-success">
                      <span className="w-1.5 h-1.5 rounded-full bg-success" />
                      Connected
                    </span>
                  ) : (
                    <button className="px-3 py-1 text-xs text-accent border border-accent/20 rounded-full hover:bg-accent/10 transition-colors">
                      Connect
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "Billing" && (
        <div className="space-y-6">
          {/* Plan info */}
          <div className="bg-panel border border-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-medium">Pro Plan</h3>
                  <span className="px-2 py-0.5 bg-success/10 text-success text-[10px] font-medium rounded-full">
                    Active
                  </span>
                </div>
                <p className="text-sm text-zinc-500 mt-1">$29/mo · Renews Jul 15, 2024</p>
              </div>
            </div>
          </div>

          {/* Card on file */}
          <div className="bg-panel border border-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Card on file</p>
                <p className="text-sm text-white mt-0.5">•••• •••• •••• 4242</p>
              </div>
              <button className="px-3 py-1.5 text-xs text-zinc-400 border border-border rounded-lg hover:text-white hover:border-zinc-500 transition-colors">
                Update
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button className="px-4 py-2 text-sm text-zinc-400 border border-border rounded-lg hover:text-white hover:border-zinc-500 transition-colors">
              Manage billing in Stripe
            </button>
            <button className="px-4 py-2 text-sm text-danger border border-border rounded-lg hover:border-danger/50 transition-colors">
              Cancel plan
            </button>
          </div>
        </div>
      )}

      {activeTab === "Notifications" && (
        <div className="space-y-4">
          {[
            { label: "Processing complete", desc: "Get notified when a clip finishes rendering", enabled: true },
            { label: "Chat spike alerts", desc: "Real-time alerts when engagement spikes", enabled: true },
            { label: "Weekly analytics digest", desc: "Summary of your weekly performance", enabled: false },
            { label: "New platform features", desc: "Product updates and feature announcements", enabled: false },
          ].map((notif) => (
            <div key={notif.label} className="flex items-center justify-between p-3 bg-panel border border-border rounded-lg">
              <div>
                <p className="text-sm text-white">{notif.label}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{notif.desc}</p>
              </div>
              <div
                className={`w-10 h-5 rounded-full cursor-pointer transition-colors ${
                  notif.enabled ? "bg-accent" : "bg-zinc-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white mt-0.5 transition-transform ${
                    notif.enabled ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
