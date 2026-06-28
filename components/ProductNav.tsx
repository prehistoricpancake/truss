"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  IconLayoutDashboard,
  IconFolder,
  IconScissors,
  IconBroadcast,
  IconChartBar,
  IconSettings,
  IconBrandTwitch,
  IconBrandYoutube,
  IconBrandTiktok,
  IconBrandDiscord,
} from "@tabler/icons-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: IconLayoutDashboard },
  { href: "/assets", label: "Assets", icon: IconFolder },
  { href: "/clips", label: "Clips", icon: IconScissors },
  { href: "/streams", label: "Streams", icon: IconBroadcast },
  { href: "/analytics", label: "Analytics", icon: IconChartBar },
];

const connectedPlatforms = [
  { name: "Twitch", icon: IconBrandTwitch, connected: true },
  { name: "YouTube", icon: IconBrandYoutube, connected: true },
  { name: "TikTok", icon: IconBrandTiktok, connected: false },
  { name: "Discord", icon: IconBrandDiscord, connected: true },
];

export function ProductNav() {
  const pathname = usePathname();

  return (
    <nav className="w-[220px] h-screen bg-bg-product border-r border-border flex flex-col shrink-0">
      {/* Wordmark */}
      <div className="px-5 py-5">
        <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold text-white tracking-tight">
          <Image src="/logos/2.png" alt="Truss" width={24} height={24} className="rounded" />
          truss
        </Link>
      </div>

      {/* Main nav */}
      <div className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-accent-tint text-white border-l-2 border-accent -ml-px"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]"
              }`}
            >
              <item.icon size={18} stroke={1.5} />
              <span className="font-normal">{item.label}</span>
            </Link>
          );
        })}

        {/* Connected section */}
        <div className="pt-6">
          <p className="px-3 text-[11px] font-medium text-zinc-600 uppercase tracking-wider mb-2">
            Connected
          </p>
          {connectedPlatforms.map((platform) => (
            <div
              key={platform.name}
              className="flex items-center gap-3 px-3 py-1.5 text-sm text-zinc-500"
            >
              <platform.icon size={16} stroke={1.5} />
              <span>{platform.name}</span>
              {platform.connected && (
                <span className="w-1.5 h-1.5 rounded-full bg-success ml-auto" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom user */}
      <div className="px-3 py-4 border-t border-border">
        <Link
          href="/profile"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03] transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent to-purple-400 flex items-center justify-center text-[11px] font-medium text-white">
            JW
          </div>
          <div className="min-w-0">
            <p className="text-sm text-zinc-200 truncate">My Workspace</p>
          </div>
          <IconSettings size={16} stroke={1.5} className="ml-auto shrink-0" />
        </Link>
      </div>
    </nav>
  );
}
