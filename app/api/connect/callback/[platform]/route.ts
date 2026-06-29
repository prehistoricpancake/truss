import { NextRequest, NextResponse } from "next/server";
import { savePlatformToken, updateCreator, getCreator } from "@/lib/db";

const BASE = process.env.NEXTAUTH_URL || "https://truss-rust.vercel.app";

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
};

async function exchangeYouTube(code: string): Promise<{ token: TokenResponse; username: string; channelId: string }> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${BASE}/api/connect/callback/youtube`,
      grant_type: "authorization_code",
    }),
  });
  const token = await res.json() as TokenResponse & { error?: string };
  if (token.error) throw new Error(token.error);

  // Get channel info
  const profileRes = await fetch("https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true", {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  const profile = await profileRes.json() as { items?: Array<{ id: string; snippet: { title: string } }> };
  const channel = profile.items?.[0];
  return {
    token,
    username: channel?.snippet?.title ?? "YouTube Channel",
    channelId: channel?.id ?? "",
  };
}

async function exchangeTwitch(code: string): Promise<{ token: TokenResponse; username: string }> {
  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.TWITCH_CLIENT_ID!,
      client_secret: process.env.TWITCH_CLIENT_SECRET!,
      redirect_uri: `${BASE}/api/connect/callback/twitch`,
      grant_type: "authorization_code",
    }),
  });
  const token = await res.json() as TokenResponse & { error?: string };
  if (token.error) throw new Error(token.error);

  const userRes = await fetch("https://api.twitch.tv/helix/users", {
    headers: {
      Authorization: `Bearer ${token.access_token}`,
      "Client-Id": process.env.TWITCH_CLIENT_ID!,
    },
  });
  const user = await userRes.json() as { data?: Array<{ display_name: string }> };
  return { token, username: user.data?.[0]?.display_name ?? "Twitch Channel" };
}

async function exchangeTikTok(code: string): Promise<{ token: TokenResponse; username: string }> {
  const res = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_key: process.env.TIKTOK_CLIENT_KEY!,
      client_secret: process.env.TIKTOK_CLIENT_SECRET!,
      redirect_uri: `${BASE}/api/connect/callback/tiktok`,
      grant_type: "authorization_code",
    }),
  });
  const data = await res.json() as { data?: TokenResponse; error?: string; message?: string };
  if (data.error) throw new Error(data.message ?? data.error);
  return { token: data.data!, username: "TikTok Account" };
}

async function exchangeDiscord(code: string): Promise<{ token: TokenResponse; username: string }> {
  const res = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.DISCORD_CLIENT_ID!,
      client_secret: process.env.DISCORD_CLIENT_SECRET!,
      redirect_uri: `${BASE}/api/connect/callback/discord`,
      grant_type: "authorization_code",
    }),
  });
  const token = await res.json() as TokenResponse & { webhook?: { name: string }; error?: string };
  if (token.error) throw new Error(token.error);
  return { token, username: token.webhook?.name ?? "Discord Server" };
}

const EXCHANGERS: Record<string, (code: string) => Promise<{ token: TokenResponse; username: string; channelId?: string }>> = {
  youtube: exchangeYouTube,
  twitch: exchangeTwitch,
  tiktok: exchangeTikTok,
  discord: exchangeDiscord,
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params;
  const { searchParams } = req.nextUrl;

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");

  if (oauthError) {
    return NextResponse.redirect(new URL(`/connect?error=${encodeURIComponent(oauthError)}`, BASE));
  }
  if (!code || !state) {
    return NextResponse.redirect(new URL("/connect?error=missing_params", BASE));
  }

  let userId: string;
  try {
    const decoded = JSON.parse(Buffer.from(state, "base64url").toString()) as { userId: string };
    userId = decoded.userId;
  } catch {
    return NextResponse.redirect(new URL("/connect?error=invalid_state", BASE));
  }

  const exchange = EXCHANGERS[platform];
  if (!exchange) {
    return NextResponse.redirect(new URL(`/connect?error=unknown_platform`, BASE));
  }

  try {
    const { token, username, channelId } = await exchange(code);

    const expiresAt = token.expires_in
      ? new Date(Date.now() + token.expires_in * 1000).toISOString()
      : undefined;

    await savePlatformToken(userId, {
      platform,
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      expiresAt,
      username,
      channelId,
      connectedAt: new Date().toISOString(),
    });

    // Update connectedPlatforms list on creator record
    const creator = await getCreator(userId);
    const existing = creator?.connectedPlatforms ?? [];
    if (!existing.includes(platform)) {
      await updateCreator(userId, { connectedPlatforms: [...existing, platform] });
    }

    return NextResponse.redirect(new URL(`/connect?success=${platform}`, BASE));
  } catch (err) {
    console.error(`[connect/callback/${platform}]`, err);
    const msg = err instanceof Error ? err.message : "Connection failed";
    return NextResponse.redirect(new URL(`/connect?error=${encodeURIComponent(msg)}`, BASE));
  }
}
