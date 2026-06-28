// Seed script — populates DynamoDB with realistic demo data
// Run with: npx tsx scripts/seed.ts

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" });
const docClient = DynamoDBDocumentClient.from(client);
const TABLE = process.env.DYNAMODB_TABLE_NAME || "truss-main";

const DEMO_USER_ID = "demo-creator-001";
const PK = `CREATOR#${DEMO_USER_ID}`;

async function put(item: Record<string, unknown>) {
  await docClient.send(new PutCommand({ TableName: TABLE, Item: item }));
}

async function seed() {
  console.log("Seeding Truss demo data...");

  // Creator metadata
  await put({
    PK,
    SK: "METADATA",
    email: "creator@truss.dev",
    name: "Alex Chen",
    plan: "pro",
    stripeCustomerId: "cus_demo_123",
    connectedPlatforms: ["twitch", "youtube", "discord"],
    createdAt: "2024-11-15T10:00:00Z",
    updatedAt: new Date().toISOString(),
  });
  console.log("  ✓ Creator metadata");

  // Analytics — last 14 days
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    await put({
      PK,
      SK: `ANALYTICS#DAILY#${dateStr}`,
      date: dateStr,
      views: Math.floor(1200 + Math.random() * 3000 + (14 - i) * 150),
      followers: Math.floor(50 + Math.random() * 200 + (14 - i) * 10),
      clips: Math.floor(2 + Math.random() * 8),
      watchTimeMinutes: Math.floor(800 + Math.random() * 2000 + (14 - i) * 100),
    });
  }
  console.log("  ✓ 14 days of analytics");

  // Assets
  const assets = [
    {
      videoId: "vid-001",
      filename: "10378789-uhd_2160_4096_25fps.mp4",
      s3Key: "uploads/demo/vid-001/10378789-uhd_2160_4096_25fps.mp4",
      localPath: "/videos/10378789-uhd_2160_4096_25fps.mp4",
      status: "ready",
      chapterCount: 5,
    },
    {
      videoId: "vid-002",
      filename: "8039795-uhd_2160_4096_25fps.mp4",
      s3Key: "uploads/demo/vid-002/8039795-uhd_2160_4096_25fps.mp4",
      localPath: "/videos/8039795-uhd_2160_4096_25fps.mp4",
      status: "ready",
      chapterCount: 8,
    },
    {
      videoId: "vid-003",
      filename: "12155414_1080_1920_30fps.mp4",
      s3Key: "uploads/demo/vid-003/12155414_1080_1920_30fps.mp4",
      localPath: "/videos/12155414_1080_1920_30fps.mp4",
      status: "processing",
      chapterCount: 0,
    },
    {
      videoId: "vid-004",
      filename: "13400159-hd_1080_1920_60fps.mp4",
      s3Key: "uploads/demo/vid-004/13400159-hd_1080_1920_60fps.mp4",
      localPath: "/videos/13400159-hd_1080_1920_60fps.mp4",
      status: "ready",
      chapterCount: 12,
    },
    {
      videoId: "vid-005",
      filename: "8134919-hd_1080_1920_25fps.mp4",
      s3Key: "uploads/demo/vid-005/8134919-hd_1080_1920_25fps.mp4",
      localPath: "/videos/8134919-hd_1080_1920_25fps.mp4",
      status: "ready",
      chapterCount: 6,
    },
    {
      videoId: "vid-006",
      filename: "video1.mp4",
      s3Key: "uploads/demo/vid-006/video1.mp4",
      localPath: "/videos/video1.mp4",
      status: "ready",
      chapterCount: 4,
    },
    {
      videoId: "vid-007",
      filename: "video2.mp4",
      s3Key: "uploads/demo/vid-007/video2.mp4",
      localPath: "/videos/video2.mp4",
      status: "ready",
      chapterCount: 3,
    },
  ];

  for (const asset of assets) {
    await put({
      PK,
      SK: `ASSET#${asset.videoId}`,
      ...asset,
      createdAt: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  console.log("  ✓ 7 assets");

  // Chapters for vid-001
  await put({
    PK,
    SK: "ASSET#vid-001#CHAPTERS",
    chapters: [
      { start_offset: 0, end_offset: 45, title: "Opening — insane clutch play", viralityScore: 92 },
      { start_offset: 120, end_offset: 175, title: "Team wipe reaction", viralityScore: 87 },
      { start_offset: 340, end_offset: 395, title: "Viewer challenge accepted", viralityScore: 74 },
      { start_offset: 510, end_offset: 560, title: "New personal best moment", viralityScore: 95 },
      { start_offset: 720, end_offset: 780, title: "Chat goes wild — donation storm", viralityScore: 88 },
    ],
    createdAt: new Date().toISOString(),
  });
  console.log("  ✓ Chapters for gaming highlights");

  // Clips
  const clips = [
    { clipId: "clip-001", assetId: "vid-001", title: "Insane clutch play", viralityScore: 92, status: "ready" },
    { clipId: "clip-002", assetId: "vid-001", title: "Team wipe reaction", viralityScore: 87, status: "ready" },
    { clipId: "clip-003", assetId: "vid-002", title: "useEffect explained in 30s", viralityScore: 78, status: "ready" },
    { clipId: "clip-004", assetId: "vid-001", title: "Chat goes wild", viralityScore: 88, status: "published" },
    { clipId: "clip-005", assetId: "vid-004", title: "AI will replace developers?", viralityScore: 94, status: "queued" },
    { clipId: "clip-006", assetId: "vid-005", title: "Perfect ramen egg technique", viralityScore: 71, status: "ready" },
    { clipId: "clip-007", assetId: "vid-001", title: "New PB moment", viralityScore: 95, status: "rendering" },
    { clipId: "clip-008", assetId: "vid-003", title: "Street performer duet", viralityScore: 82, status: "queued" },
  ];

  for (const clip of clips) {
    await put({
      PK,
      SK: `CLIP#${clip.clipId}`,
      ...clip,
      s3Key: `clips/demo/${clip.clipId}/output.mp4`,
      createdAt: new Date(Date.now() - Math.random() * 5 * 86400000).toISOString(),
    });
  }
  console.log("  ✓ 8 clips");

  // Streams
  await put({
    PK,
    SK: "STREAM#stream-001",
    streamId: "stream-001",
    platform: "twitch",
    status: "ended",
    vodS3Path: "uploads/demo/streams/stream-001.mp4",
    startedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    endedAt: new Date(Date.now() - 2 * 86400000 + 3 * 3600000).toISOString(),
  });
  await put({
    PK,
    SK: "STREAM#stream-002",
    streamId: "stream-002",
    platform: "youtube",
    status: "live",
    startedAt: new Date().toISOString(),
  });
  console.log("  ✓ 2 streams");

  // Chat spikes — including one pre-flagged spike
  await put({
    PK,
    SK: `LIVE_CHAT_SPIKE#${new Date(Date.now() - 1800000).toISOString()}`,
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    messageRate: 340,
    baseline: 120,
    highlightRange: { start: Date.now() - 1830000, end: Date.now() - 1770000 },
    streamId: "stream-002",
  });
  console.log("  ✓ 1 pre-flagged chat spike");

  console.log("\n✅ Seed complete! Dashboard should look alive on first load.");
}

seed().catch(console.error);
