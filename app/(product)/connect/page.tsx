import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getPlatformTokens } from "@/lib/db";
import { ConnectClient } from "@/components/ConnectClient";

export default async function ConnectPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;
  const tokens = await getPlatformTokens(session.user.id);
  const connectedPlatforms = tokens.map((t) => t.platform);

  return (
    <ConnectClient
      connectedPlatforms={connectedPlatforms}
      tokens={tokens}
      success={params.success}
      errorParam={params.error}
    />
  );
}
