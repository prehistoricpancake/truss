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
  IconPlugConnected,
  IconBrandTwitch,
  IconBrandYoutube,
  IconBrandTiktok,
  IconBrandInstagram,
  IconBrandDiscord,
  IconSparkles,
} from "@tabler/icons-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: IconLayoutDashboard },
  { href: "/assets",    label: "Assets",    icon: IconFolder },
  { href: "/clips",     label: "Clips",     icon: IconScissors },
  { href: "/streams",   label: "Streams",   icon: IconBroadcast },
  { href: "/analytics", label: "Analytics", icon: IconChartBar },
];

const PLATFORM_ICONS: Record<string, React.ElementType> = {
  twitch:    IconBrandTwitch,
  youtube:   IconBrandYoutube,
  tiktok:    IconBrandTiktok,
  instagram: IconBrandInstagram,
  discord:   IconBrandDiscord,
};

const ALL_PLATFORMS = ["youtube", "twitch", "tiktok", "instagram", "discord"];

type Props = {
  creatorName?: string;
  creatorEmail?: string;
  connectedPlatforms?: string[];
};

export function ProductNav({ creatorName, creatorEmail, connectedPlatforms = [] }: Props) {
  const pathname = usePathname();

  const initials = (creatorName ?? creatorEmail ?? "??")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <nav id="product-nav" className="w-[220px] h-screen bg-bg-product border-r border-border flex flex-col shrink-0">
      {/* Wordmark */}
      <div className="px-5 py-5">
        <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold text-white tracking-tight">
          <Image src="/logos/2.png" alt="Truss" width={24} height={24} className="rounded" />
          truss
        </Link>
      </div>

      {/* Main nav */}
      <div className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
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

        {/* Connected platforms section */}
        <div className="pt-6">
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[11px] font-medium text-zinc-600 uppercase tracking-wider">Connected</p>
            <Link
              id="nav-connect"
              href="/connect"
              className={`text-[10px] transition-colors ${
                pathname.startsWith("/connect")
                  ? "text-accent"
                  : "text-zinc-600 hover:text-accent"
              }`}
            >
              Manage
            </Link>
          </div>

          {ALL_PLATFORMS.map((pid) => {
            const Icon = PLATFORM_ICONS[pid] ?? IconPlugConnected;
            const isConnected = connectedPlatforms.includes(pid);
            return (
              <Link
                key={pid}
                href="/connect"
                className="flex items-center gap-3 px-3 py-1.5 text-sm rounded-lg hover:bg-white/[0.03] transition-colors"
              >
                <Icon size={16} stroke={1.5} className={isConnected ? "text-zinc-300" : "text-zinc-700"} />
                <span className={isConnected ? "text-zinc-400" : "text-zinc-700 capitalize"}>{pid}</span>
                {isConnected && <span className="w-1.5 h-1.5 rounded-full bg-success ml-auto" />}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Demo tab — internal only */}
      {creatorEmail === "wanjikuwawambui@gmail.com" && (
        <div className="px-3 pb-3">
          <Link
            href="/demo"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname.startsWith("/demo")
                ? "bg-accent-tint text-white border-l-2 border-accent -ml-px"
                : "text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.03]"
            }`}
          >
            <IconSparkles size={18} stroke={1.5} />
            <span className="font-normal">Demo</span>
          </Link>
        </div>
      )}

      {/* Bottom user */}
      <div className="px-3 py-4 border-t border-border">
        <Link
          href="/profile"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03] transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent to-purple-400 flex items-center justify-center text-[11px] font-medium text-white shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm text-zinc-200 truncate">{creatorName ?? "My Workspace"}</p>
            {creatorEmail && <p className="text-[10px] text-zinc-600 truncate">{creatorEmail}</p>}
          </div>
          <IconSettings size={16} stroke={1.5} className="ml-auto shrink-0" />
        </Link>
      </div>
    </nav>
  );
}
