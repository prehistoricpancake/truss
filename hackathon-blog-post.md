# How I Modeled a Multi-Platform Creator SaaS in One DynamoDB Table — and Why It Was the Right Call

*Submitted to the AWS H0 Hackathon — Vercel v0 + AWS Databases track. #H0Hackathon*

*Published on dev.to*

---

## The Problem

Truss is a B2C SaaS for content creators. You upload a video or connect a live stream, and Truss uses Gemini to extract the highest-engagement moments, scores each for virality, and publishes 9:16 vertical clips across YouTube, TikTok, Twitch, and Discord.

The data model behind this sounds deceptively simple: users, videos, clips, streams, analytics, platform tokens. Six entities. But the *access patterns* are what matter — and they pushed me toward a single-table DynamoDB design over a relational database in ways I didn't fully anticipate when I started.

---

## Why DynamoDB Instead of Postgres

The first question I get is always: why not just use a relational database?

Three reasons shaped this decision.

**1. The dominant read pattern is partition-scoped.** Almost every page in this app asks the same question: *"Give me everything for user X, filtered by entity type."* Dashboard needs recent assets and analytics. Clips page needs clips. Streams page needs streams. In SQL, that's joins or multiple round-trips. In DynamoDB with a single-table design, it's one `Query` call per page — no joins, no N+1 problems.

**2. Serverless + connection pools don't mix well.** Vercel functions are stateless and short-lived. Every cold start to a Postgres database burns 30–80ms negotiating a connection before the first query runs. DynamoDB's HTTP API is connectionless by design — it's a natural fit for serverless compute.

**3. On-demand capacity.** At launch, I have no idea how many creators will sign up. DynamoDB on-demand scales to zero (no idle cost) and scales up with zero capacity planning. For a hackathon-born product, that's the right default.

---

## The Single-Table Schema

Everything lives in one DynamoDB table. Partition key: `PK` (String). Sort key: `SK` (String).

```
PK                        SK                              Entity
─────────────────────     ──────────────────────────      ──────────────────
CREATOR#<userId>          METADATA                        Creator profile
CREATOR#<userId>          ASSET#<videoId>                 Uploaded video
CREATOR#<userId>          ASSET#<videoId>#CHAPTERS        AI-extracted chapters
CREATOR#<userId>          CLIP#<clipId>                   Extracted clip
CREATOR#<userId>          STREAM#<streamId>               Live stream record
CREATOR#<userId>          LIVE_CHAT_SPIKE#<timestamp>     Chat engagement spike
CREATOR#<userId>          ANALYTICS#DAILY#<date>          Daily metrics
CREATOR#<userId>          PLATFORM_TOKEN#<platform>       OAuth token
MAGIC#<token>             VERIFY                          Magic link token (TTL)
```

Every entity for a given user shares the same partition key. Queries use `begins_with(SK, prefix)` to retrieve a specific entity type:

```ts
// All clips for a user
await docClient.send(new QueryCommand({
  TableName: TABLE,
  KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
  ExpressionAttributeValues: {
    ":pk": `CREATOR#${userId}`,
    ":sk": "CLIP#",
  },
}));
```

No GSIs. No secondary indexes. All access patterns are served by this one schema.

---

## The Tradeoffs

Single-table design has costs worth naming honestly.

**Hot partitions are a real risk at scale.** If one creator has 50,000 clips, their partition takes all the heat. DynamoDB on-demand handles burst well, but you can't fully escape this. For V2, I'd add a shard suffix to `PK` for high-volume entities — `CREATOR#<userId>#CLIPS#<shard>`.

**You lose ad-hoc querying.** There's no `SELECT * FROM clips WHERE viralityScore > 80`. Any access pattern you didn't model upfront requires a scan or a GSI. I've been careful to design the app's UI around the access patterns I built, not the other way around. That discipline is uncomfortable at first.

**Magic link tokens use a different partition scheme** (`MAGIC#<token>`) because they need to be looked up by token, not by user. Mixing these in the same table is fine — it's by design in single-table modeling — but it requires deliberate thought about what "partition" means for each entity type.

---

## The Vercel Side

The frontend is Next.js App Router on Vercel. A few things worth noting for other developers.

**Route protection runs at the edge.** A `proxy.ts` middleware checks the NextAuth session cookie (`authjs.session-token`) before any server component renders. Unauthenticated users get redirected to `/login` at the CDN layer — no compute wasted.

**Video uploads bypass Vercel entirely.** The browser requests a presigned S3 PUT URL from an API route, then uploads directly to S3. Vercel never sees a raw video byte. This avoids Vercel's response size limits and keeps egress costs at zero.

**Credential federation, not static keys.** In production, there are no `AWS_ACCESS_KEY_ID` environment variables. Vercel injects an OIDC token; the app calls `sts:AssumeRoleWithWebIdentity` to get short-lived credentials, cached in-process with a 60-second expiry buffer. This took an afternoon to set up and eliminated an entire category of credential-leak risk.

---

## What I'd Do Differently

The analysis pipeline is currently synchronous — it blocks the HTTP request while Gemini processes the video. For anything longer than a short clip, that's a race against Vercel's function timeout. The next version will push analysis to a background queue (Vercel Queues) with status polling.

DynamoDB queries also have no pagination yet. For a creator with thousands of clips, every page load fetches the full partition. Adding `Limit` + `ExclusiveStartKey` is straightforward — it just wasn't the bottleneck at hackathon scale.

---

## Final Thoughts

Truss is live at [the-truss-app.vercel.app](https://the-truss-app.vercel.app). The stack — Next.js on Vercel, single-table DynamoDB, S3 for object storage, Vercel AI SDK for Gemini — held up well under the build pressure of a hackathon.

If you're a developer considering this stack for a B2C SaaS: the single-table DynamoDB pattern has a real learning curve, but once your access patterns click into the schema, the operational simplicity pays for the upfront modeling cost many times over.

**#H0Hackathon**
