import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

let _docClient: DynamoDBDocumentClient | null = null;

function getDocClient() {
  if (!_docClient) {
    const client = new DynamoDBClient({ region: process.env.AWS_REGION });
    _docClient = DynamoDBDocumentClient.from(client);
  }
  return _docClient;
}

function getTable() {
  return process.env.DYNAMODB_TABLE_NAME!;
}

// Types
export interface CreatorMetadata {
  PK: string;
  SK: "METADATA";
  email: string;
  name?: string;
  plan: "starter" | "pro" | "studio";
  stripeCustomerId?: string;
  connectedPlatforms?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  PK: string;
  SK: string; // ASSET#<video_id>
  videoId: string;
  filename: string;
  s3Key: string;
  status: "uploading" | "processing" | "ready" | "failed";
  chapters?: Chapter[];
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  start_offset: number;
  end_offset: number;
  title: string;
  viralityScore: number;
}

export interface Clip {
  PK: string;
  SK: string; // CLIP#<clip_id>
  clipId: string;
  assetId: string;
  title: string;
  s3Key?: string;
  viralityScore: number;
  status: "queued" | "rendering" | "ready" | "published";
  subtitles?: string;
  scheduledAt?: string;
  createdAt: string;
}

export interface StreamRecord {
  PK: string;
  SK: string; // STREAM#<stream_id>
  streamId: string;
  platform: string;
  status: "live" | "ended" | "processing";
  vodS3Path?: string;
  startedAt: string;
  endedAt?: string;
}

export interface ChatSpike {
  PK: string;
  SK: string; // LIVE_CHAT_SPIKE#<timestamp>
  timestamp: string;
  messageRate: number;
  baseline: number;
  highlightRange?: { start: number; end: number };
  streamId?: string;
}

export interface AnalyticsDaily {
  PK: string;
  SK: string; // ANALYTICS#DAILY#<date>
  date: string;
  views: number;
  followers: number;
  clips: number;
  watchTimeMinutes: number;
}

// Access patterns

export async function createCreator(userId: string, email: string, name?: string) {
  const now = new Date().toISOString();
  await getDocClient().send(
    new PutCommand({
      TableName: getTable(),
      Item: {
        PK: `CREATOR#${userId}`,
        SK: "METADATA",
        email,
        name: name || email.split("@")[0],
        plan: "starter",
        connectedPlatforms: [],
        createdAt: now,
        updatedAt: now,
      },
    })
  );
}

export async function getCreator(userId: string): Promise<CreatorMetadata | null> {
  const result = await getDocClient().send(
    new GetCommand({
      TableName: getTable(),
      Key: { PK: `CREATOR#${userId}`, SK: "METADATA" },
    })
  );
  return (result.Item as CreatorMetadata) || null;
}

export async function updateCreatorPlan(
  userId: string,
  plan: "starter" | "pro" | "studio",
  stripeCustomerId?: string
) {
  const params: Record<string, unknown> = {
    ":plan": plan,
    ":now": new Date().toISOString(),
  };
  let updateExpr = "SET #plan = :plan, updatedAt = :now";

  if (stripeCustomerId) {
    updateExpr += ", stripeCustomerId = :sid";
    params[":sid"] = stripeCustomerId;
  }

  await getDocClient().send(
    new UpdateCommand({
      TableName: getTable(),
      Key: { PK: `CREATOR#${userId}`, SK: "METADATA" },
      UpdateExpression: updateExpr,
      ExpressionAttributeNames: { "#plan": "plan" },
      ExpressionAttributeValues: params,
    })
  );
}

export async function createAsset(userId: string, videoId: string, filename: string, s3Key: string) {
  const now = new Date().toISOString();
  await getDocClient().send(
    new PutCommand({
      TableName: getTable(),
      Item: {
        PK: `CREATOR#${userId}`,
        SK: `ASSET#${videoId}`,
        videoId,
        filename,
        s3Key,
        status: "uploading",
        createdAt: now,
        updatedAt: now,
      },
    })
  );
}

export async function updateAssetStatus(userId: string, videoId: string, status: Asset["status"]) {
  await getDocClient().send(
    new UpdateCommand({
      TableName: getTable(),
      Key: { PK: `CREATOR#${userId}`, SK: `ASSET#${videoId}` },
      UpdateExpression: "SET #status = :status, updatedAt = :now",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: {
        ":status": status,
        ":now": new Date().toISOString(),
      },
    })
  );
}

export async function saveChapters(userId: string, videoId: string, chapters: Chapter[]) {
  await getDocClient().send(
    new PutCommand({
      TableName: getTable(),
      Item: {
        PK: `CREATOR#${userId}`,
        SK: `ASSET#${videoId}#CHAPTERS`,
        chapters,
        createdAt: new Date().toISOString(),
      },
    })
  );
}

export async function getAssets(userId: string): Promise<Asset[]> {
  const result = await getDocClient().send(
    new QueryCommand({
      TableName: getTable(),
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: {
        ":pk": `CREATOR#${userId}`,
        ":sk": "ASSET#",
      },
    })
  );
  return (result.Items as Asset[]) || [];
}

export async function createClip(userId: string, clip: Omit<Clip, "PK" | "SK">) {
  await getDocClient().send(
    new PutCommand({
      TableName: getTable(),
      Item: {
        PK: `CREATOR#${userId}`,
        SK: `CLIP#${clip.clipId}`,
        ...clip,
      },
    })
  );
}

export async function getClips(userId: string): Promise<Clip[]> {
  const result = await getDocClient().send(
    new QueryCommand({
      TableName: getTable(),
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: {
        ":pk": `CREATOR#${userId}`,
        ":sk": "CLIP#",
      },
    })
  );
  return (result.Items as Clip[]) || [];
}

export async function createStream(userId: string, stream: Omit<StreamRecord, "PK" | "SK">) {
  await getDocClient().send(
    new PutCommand({
      TableName: getTable(),
      Item: {
        PK: `CREATOR#${userId}`,
        SK: `STREAM#${stream.streamId}`,
        ...stream,
      },
    })
  );
}

export async function getStreams(userId: string): Promise<StreamRecord[]> {
  const result = await getDocClient().send(
    new QueryCommand({
      TableName: getTable(),
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: {
        ":pk": `CREATOR#${userId}`,
        ":sk": "STREAM#",
      },
    })
  );
  return (result.Items as StreamRecord[]) || [];
}

export async function writeChatSpike(userId: string, spike: Omit<ChatSpike, "PK" | "SK">) {
  await getDocClient().send(
    new PutCommand({
      TableName: getTable(),
      Item: {
        PK: `CREATOR#${userId}`,
        SK: `LIVE_CHAT_SPIKE#${spike.timestamp}`,
        ...spike,
      },
    })
  );
}

export async function getChatSpikes(userId: string): Promise<ChatSpike[]> {
  const result = await getDocClient().send(
    new QueryCommand({
      TableName: getTable(),
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: {
        ":pk": `CREATOR#${userId}`,
        ":sk": "LIVE_CHAT_SPIKE#",
      },
    })
  );
  return (result.Items as ChatSpike[]) || [];
}

export async function putAnalytics(userId: string, analytics: Omit<AnalyticsDaily, "PK" | "SK">) {
  await getDocClient().send(
    new PutCommand({
      TableName: getTable(),
      Item: {
        PK: `CREATOR#${userId}`,
        SK: `ANALYTICS#DAILY#${analytics.date}`,
        ...analytics,
      },
    })
  );
}

export async function getAnalytics(userId: string, startDate?: string): Promise<AnalyticsDaily[]> {
  const result = await getDocClient().send(
    new QueryCommand({
      TableName: getTable(),
      KeyConditionExpression: startDate
        ? "PK = :pk AND SK BETWEEN :start AND :end"
        : "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: startDate
        ? {
            ":pk": `CREATOR#${userId}`,
            ":start": `ANALYTICS#DAILY#${startDate}`,
            ":end": `ANALYTICS#DAILY#9999`,
          }
        : {
            ":pk": `CREATOR#${userId}`,
            ":sk": "ANALYTICS#DAILY#",
          },
    })
  );
  return (result.Items as AnalyticsDaily[]) || [];
}
