import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCreator, getAssets, getClips, getAnalytics, getChatSpikes } from "@/lib/db";
import { DashboardClient } from "@/components/DashboardClient";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [creator, assets, clips, analytics, spikes] = await Promise.all([
    getCreator(userId),
    getAssets(userId),
    getClips(userId),
    getAnalytics(userId),
    getChatSpikes(userId),
  ]);

  if (!creator) redirect("/onboarding");

  return (
    <DashboardClient
      creator={creator}
      assets={assets}
      clips={clips}
      analytics={analytics}
      recentSpikes={spikes.slice(-20)}
    />
  );
}
