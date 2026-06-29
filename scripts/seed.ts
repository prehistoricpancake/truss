#!/usr/bin/env npx tsx
/**
 * Truss DynamoDB seed script
 * Usage: npx tsx scripts/seed.ts <email>
 * Example: npx tsx scripts/seed.ts wanjikuwawambui@gmail.com
 *
 * Needs env vars: AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, DYNAMODB_TABLE_NAME
 * Easiest: run `vercel env pull .env.local` first, then:
 *   export $(grep -v '^#' .env.local | xargs) && npx tsx scripts/seed.ts <email>
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, BatchWriteCommand } from "@aws-sdk/lib-dynamodb";
import { randomBytes } from "crypto";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// Load .env.local (Next.js convention) then .env as fallback
for (const file of [".env.local", ".env"]) {
  const p = resolve(process.cwd(), file);
  if (!existsSync(p)) continue;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^([^#=\s][^=]*)=(.*)$/);
    if (m) process.env[m[1].trim()] ??= m[2].trim().replace(/^["']|["']$/g, "");
  }
}

// ── Config ────────────────────────────────────────────────────────────────────

const EMAIL = process.argv[2];
if (!EMAIL) { console.error("Usage: npx tsx scripts/seed.ts <email>"); process.exit(1); }

const TABLE = process.env.DYNAMODB_TABLE_NAME;
const REGION = process.env.AWS_REGION;
if (!TABLE || !REGION) { console.error("Missing DYNAMODB_TABLE_NAME or AWS_REGION env vars"); process.exit(1); }

const db = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));
const PK = `CREATOR#${EMAIL}`;

// ── Helpers ───────────────────────────────────────────────────────────────────

const uid = () => randomBytes(6).toString("hex");
const daysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString(); };
const dateStr = (d: Date) => d.toISOString().split("T")[0];
const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

async function batchPut(items: Record<string, unknown>[]) {
  // DynamoDB BatchWrite limit: 25 items per request
  for (let i = 0; i < items.length; i += 25) {
    const chunk = items.slice(i, i + 25);
    const reqItems: Record<string, { PutRequest: { Item: Record<string, unknown> } }[]> = {};
    reqItems[TABLE as string] = chunk.map(Item => ({ PutRequest: { Item } }));
    await db.send(new BatchWriteCommand({ RequestItems: reqItems }));
  }
}

async function put(item: Record<string, unknown>) {
  await db.send(new PutCommand({ TableName: TABLE, Item: item }));
}

// ── Data ──────────────────────────────────────────────────────────────────────

const VIDEO_TITLES = [
  // Gaming
  "Valorant Ranked Grind — Hitting Immortal EP.1",
  "Valorant Ranked Grind — Hitting Immortal EP.2",
  "CS2 Tournament Watch Party + Analysis",
  "Minecraft Survival Series EP.7 — The Nether Update",
  "Minecraft Survival Series EP.8 — Finding Diamonds",
  "Elden Ring First Playthrough — Margit Boss Fight",
  "Elden Ring — Godrick the Grafted (no summons)",
  "Fortnite Zero Build — Solo 1st Place Challenge",
  // Dev / Tech
  "Building a SaaS in 30 Days | Day 1 — Idea & Stack",
  "Building a SaaS in 30 Days | Day 8 — Auth is HARD",
  "Building a SaaS in 30 Days | Day 15 — Soft Launch",
  "Building a SaaS in 30 Days | Day 30 — We Made It",
  "React Hooks Deep Dive — useEffect, useMemo, useCallback",
  "Next.js 15 App Router — Full Crash Course",
  "TypeScript for Beginners: Zero to Hero",
  "DynamoDB Masterclass for Node.js Developers",
  "AWS for Beginners — The Complete Guide 2024",
  "Live Coding: Building a Real-Time Chat App",
  "Figma to Code — Building Beautiful UIs in Tailwind",
  // Creator / IRL
  "Full Podcast EP.42 | The Future of Creator Monetization",
  "Full Podcast EP.43 | AI Tools Every Creator Needs",
  "Full Podcast EP.44 | The Creator Economy is Broken",
  "Interview: $10M/yr Creator Shares Her Strategy",
  "How I Went from 0 to 50K Subscribers",
  "My YouTube Studio Tour 2024",
  "Day in My Life: Creator Edition",
  "Freelancing to Full-Time Creator — My Journey",
  "Creator Burnout: My Story and How I Recovered",
  "How I Edit My Videos (Full Workflow)",
  "Growing on TikTok in 2024 | What Actually Works",
];

const CLIP_HOOKS = [
  "This moment got me 10K new followers",
  "Chat was LOSING their minds 😂",
  "The clutch nobody saw coming",
  "I can't believe this happened live",
  "The moment everything changed",
  "POV: when it finally clicks",
  "Nobody talks about this technique",
  "The plot twist nobody expected",
  "This is why I love streaming",
  "Hot take that broke the internet",
  "The collab that changed everything",
  "Biggest fail of my creator career",
  "From 0 to viral in 2 minutes",
  "Chat predicted it… somehow",
  "This took 3 hours to set up",
  "Unbelievable reaction caught live",
  "The best play of the entire stream",
  "My most requested tutorial clip",
  "This answer changed everything",
  "The funniest thing happened mid-stream",
  "Viewers couldn't believe this was real",
  "The comeback nobody thought was possible",
  "One line of code fixed everything",
  "This is peak creator content",
  "The sponsor deal that almost destroyed me",
];

const PLATFORMS = ["twitch", "twitch", "youtube", "twitch", "youtube", "twitch", "youtube"] as const;

// ── Seed ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log(`\n🌱 Seeding Truss for ${EMAIL} → table "${TABLE}"\n`);
  const now = new Date().toISOString();

  // ── Creator metadata ─────────────────────────────────────────────────────
  await put({
    PK, SK: "METADATA",
    email: EMAIL,
    name: EMAIL.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
    plan: "pro",
    connectedPlatforms: ["youtube", "twitch", "tiktok"],
    createdAt: daysAgo(400),
    updatedAt: now,
  });
  console.log("  ✓ Creator metadata");

  // ── Platform tokens ──────────────────────────────────────────────────────
  const tokenItems = [
    { platform: "youtube", username: "@joycecreates", channelId: "UCjoy123abc" },
    { platform: "twitch",  username: "joycecreates",  channelId: "842910234" },
    { platform: "tiktok",  username: "@joyce.creates", channelId: "tiktok_joy99" },
  ].map(p => ({
    PK, SK: `PLATFORM_TOKEN#${p.platform}`,
    ...p,
    accessToken:  `atk_${uid()}`,
    refreshToken: `rtk_${uid()}`,
    expiresAt: new Date(Date.now() + 30 * 86_400_000).toISOString(),
    connectedAt: daysAgo(60),
  }));
  await batchPut(tokenItems);
  console.log("  ✓ 3 platform tokens");

  // ── Assets (30) ───────────────────────────────────────────────────────────
  const assetStatuses = [
    ...Array(27).fill("ready"),
    "processing", "processing", "failed",
  ] as Array<"ready" | "processing" | "failed">;

  const assetRows: Record<string, unknown>[] = [];
  const assetIds: { id: string; title: string }[] = [];

  for (let i = 0; i < VIDEO_TITLES.length; i++) {
    const videoId = `vid-${uid()}`;
    const title = VIDEO_TITLES[i];
    const status = assetStatuses[i];
    const daysBack = VIDEO_TITLES.length * 3 - i * 3;
    const chapterCount = status === "ready" ? rand(4, 12) : 0;

    assetIds.push({ id: videoId, title });

    const chapters = status === "ready"
      ? Array.from({ length: chapterCount }, (_, j) => ({
          start_offset: j * rand(180, 600),
          end_offset:   j * rand(180, 600) + rand(30, 120),
          title: `${title.split("—")[0].trim()} — Part ${j + 1}`,
          viralityScore: rand(25, 97),
        }))
      : undefined;

    assetRows.push({
      PK,
      SK: `ASSET#${videoId}`,
      videoId,
      filename: title.replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "_").slice(0, 60) + ".mp4",
      s3Key: `uploads/${EMAIL}/${videoId}/original.mp4`,
      status,
      chapters,
      createdAt: daysAgo(daysBack),
      updatedAt: daysAgo(Math.max(0, daysBack - 1)),
    });
  }
  await batchPut(assetRows);
  console.log(`  ✓ ${assetRows.length} assets`);

  // ── Clips (180+) ──────────────────────────────────────────────────────────
  const clipRows: Record<string, unknown>[] = [];
  const clipStatuses = ["published", "published", "published", "ready", "ready", "queued", "rendering"];

  // Use only the 27 "ready" assets for clips
  const readyAssets = assetIds.slice(0, 27);
  for (let i = 0; i < readyAssets.length; i++) {
    const { id: assetId } = readyAssets[i];
    const numClips = rand(4, 8);
    const daysBack = VIDEO_TITLES.length * 3 - i * 3;

    for (let j = 0; j < numClips; j++) {
      const clipId = `clip-${uid()}`;
      // Virality distribution: mostly 35-75, occasional spikes 80-98
      const viralityScore = Math.random() < 0.15 ? rand(80, 98) : rand(35, 75);

      clipRows.push({
        PK,
        SK: `CLIP#${clipId}`,
        clipId,
        assetId,
        title: CLIP_HOOKS[(i * 7 + j) % CLIP_HOOKS.length],
        s3Key: `clips/${EMAIL}/${clipId}/clip.mp4`,
        viralityScore,
        status: pick(clipStatuses),
        createdAt: daysAgo(Math.max(0, daysBack - j)),
      });
    }
  }
  await batchPut(clipRows);
  console.log(`  ✓ ${clipRows.length} clips`);

  // ── Streams (25) ─────────────────────────────────────────────────────────
  const streamRows: Record<string, unknown>[] = [];
  const streamIds: string[] = [];

  for (let i = 0; i < 25; i++) {
    const streamId = `stream-${uid()}`;
    streamIds.push(streamId);
    const daysBack = 25 - i;
    const durationMs = rand(60, 420) * 60_000; // 1–7 hours
    const startedAt = new Date(Date.now() - daysBack * 86_400_000 - rand(0, 14_400_000)).toISOString();
    const endedAt = new Date(new Date(startedAt).getTime() + durationMs).toISOString();
    const isLive = i === 0;

    streamRows.push({
      PK,
      SK: `STREAM#${streamId}`,
      streamId,
      platform: PLATFORMS[i % PLATFORMS.length],
      status: isLive ? "live" : (i < 22 ? "ended" : "processing"),
      startedAt,
      ...(!isLive ? { endedAt, vodS3Path: `vods/${EMAIL}/${streamId}/vod.mp4` } : {}),
    });
  }
  await batchPut(streamRows);
  console.log(`  ✓ ${streamRows.length} streams`);

  // ── Chat spikes (400+) ────────────────────────────────────────────────────
  const spikeRows: Record<string, unknown>[] = [];

  for (let s = 0; s < streamIds.length; s++) {
    const streamId = streamIds[s];
    const numSpikes = rand(12, 28);
    const streamBase = new Date(Date.now() - (25 - s) * 86_400_000).getTime();

    for (let k = 0; k < numSpikes; k++) {
      const offsetMs = rand(0, 360) * 60_000; // within 6 hours
      const ts = new Date(streamBase + offsetMs).toISOString();
      // Unique SK: timestamp + index
      const spikeTs = new Date(streamBase + offsetMs + k).toISOString();

      spikeRows.push({
        PK,
        SK: `LIVE_CHAT_SPIKE#${spikeTs}`,
        timestamp: ts,
        messageRate: rand(60, 520),
        baseline: rand(8, 45),
        streamId,
        highlightRange: {
          start: offsetMs / 1000,
          end:   offsetMs / 1000 + rand(20, 90),
        },
      });
    }
  }
  await batchPut(spikeRows);
  console.log(`  ✓ ${spikeRows.length} chat spikes`);

  // ── Analytics (365 days) ─────────────────────────────────────────────────
  const analyticsRows: Record<string, unknown>[] = [];
  let followers = rand(8_000, 14_000);

  for (let i = 364; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dow = d.getDay();
    const isWeekend = dow === 0 || dow === 6;
    const progress = (364 - i) / 364; // 0 → 1 growth factor
    const weekBump = isWeekend ? 1.45 : 1;
    const spike = Math.random() < 0.05 ? rand(2, 5) : 1; // occasional viral day

    const views = Math.floor((600 + Math.random() * 500) * weekBump * (0.4 + progress * 1.4) * spike);
    const clips = Math.floor(Math.random() * 5 * weekBump);
    const watchTimeMinutes = Math.floor(views * (2.5 + Math.random() * 4));
    followers += rand(10, 120) + Math.floor(progress * 60) + (spike > 1 ? rand(200, 800) : 0);

    analyticsRows.push({
      PK,
      SK: `ANALYTICS#DAILY#${dateStr(d)}`,
      date: dateStr(d),
      views,
      followers,
      clips,
      watchTimeMinutes,
    });
  }
  await batchPut(analyticsRows);
  console.log(`  ✓ ${analyticsRows.length} days of analytics`);

  // ── Summary ───────────────────────────────────────────────────────────────
  const total = 1 + 3 + assetRows.length + clipRows.length + streamRows.length + spikeRows.length + analyticsRows.length;
  console.log(`
✅  Done — ${total} items written to DynamoDB
    ${assetRows.length} assets  ·  ${clipRows.length} clips  ·  ${streamRows.length} streams
    ${spikeRows.length} chat spikes  ·  ${analyticsRows.length} days analytics
    followers: ${followers.toLocaleString()}
`);
}

seed().catch((err) => { console.error("\n❌ Seed failed:", err); process.exit(1); });
