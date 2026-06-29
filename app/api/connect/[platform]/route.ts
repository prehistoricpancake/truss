import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { deletePlatformToken } from "@/lib/db";

const BASE = process.env.NEXTAUTH_URL || "https://the-truss-app.vercel.app";

const OAUTH_CONFIGS: Record<string, (state: string) => string> = {
  youtube: (state) => {
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      redirect_uri: `${BASE}/api/connect/callback/youtube`,
      response_type: "code",
      scope: [
        "https://www.googleapis.com/auth/youtube.upload",
        "https://www.googleapis.com/auth/youtube.readonly",
        "https://www.googleapis.com/auth/userinfo.profile",
      ].join(" "),
      access_type: "offline",
      prompt: "consent",
      state,
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  },

  twitch: (state) => {
    const params = new URLSearchParams({
      client_id: process.env.TWITCH_CLIENT_ID ?? "",
      redirect_uri: `${BASE}/api/connect/callback/twitch`,
      response_type: "code",
      scope: "channel:read:subscriptions user:read:broadcast chat:read",
      state,
    });
    return `https://id.twitch.tv/oauth2/authorize?${params}`;
  },

  tiktok: (state) => {
    const params = new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY ?? "",
      redirect_uri: `${BASE}/api/connect/callback/tiktok`,
      response_type: "code",
      scope: "user.info.basic,video.upload",
      state,
    });
    return `https://www.tiktok.com/v2/auth/authorize?${params}`;
  },

  discord: (state) => {
    const params = new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID ?? "",
      redirect_uri: `${BASE}/api/connect/callback/discord`,
      response_type: "code",
      scope: "bot webhook.incoming",
      state,
    });
    return `https://discord.com/api/oauth2/authorize?${params}`;
  },
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", BASE));
  }

  const { platform } = await params;
  const buildUrl = OAUTH_CONFIGS[platform];

  if (!buildUrl) {
    return NextResponse.redirect(new URL(`/connect?error=${encodeURIComponent("Unknown platform")}`, BASE));
  }

  // State encodes the userId so the callback can verify the request
  const state = Buffer.from(JSON.stringify({ userId: session.user.id, platform })).toString("base64url");
  const oauthUrl = buildUrl(state);

  return NextResponse.redirect(oauthUrl);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { platform } = await params;
  await deletePlatformToken(session.user.id, platform);
  return NextResponse.json({ success: true });
}
