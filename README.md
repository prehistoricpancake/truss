# Truss

**Cross-platform content infrastructure for creators.** Upload one video or connect a live stream — Truss extracts the best moments, scores them for viral potential, and publishes vertical 9:16 clips across YouTube, TikTok, Twitch, and Discord simultaneously.

🌐 **Live:** [the-truss-app.vercel.app](https://the-truss-app.vercel.app)

---

## How It Works

### 1. Sign In
Enter your email on the login or sign-up page. Truss sends a magic link via Resend — click it and you're in. No passwords, no Google OAuth, no verification step.

### 2. Onboarding
On first login you land on the onboarding page. Set your display name and optionally connect platforms. The interactive tooltip tour walks you through the dashboard on first visit.

### 3. Upload a Video
Go to **Upload** and drag in a video file. It uploads directly from your browser to S3 via a presigned URL — no file size limit from the app server.

### 4. AI Analysis
Once uploaded, Truss sends the video to Gemini 2.0 Flash, which identifies the highest-impact moments and scores each for viral potential (1–100). Results appear as timestamped chapters.

### 5. Clips
Extracted highlights appear in **Clips** with virality scores. Each clip is ready to export as a 9:16 vertical short.

### 6. Connect Platforms
Go to **Connect** to link YouTube, Twitch, TikTok, or Discord via OAuth. Connected platforms show a green dot in the sidebar. Clips can then be published directly from Truss.

### 7. Live Streams
Connect a live stream in **Streams**. Truss monitors chat and detects engagement spikes (>200% baseline message rate) in real time, auto-marking clip boundaries at peak moments.

### 8. Analytics
The **Analytics** page tracks daily views, followers, clips generated, and watch time across all connected platforms.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js (App Router, Turbopack) |
| Auth | NextAuth v5 — magic link via Resend + DynamoDB tokens |
| Email | Resend |
| Database | Amazon DynamoDB (single-table design) |
| Storage | Amazon S3 (presigned uploads) |
| AI | Google Gemini 2.0 Flash via Vercel AI SDK |
| Credentials | `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` env vars |
| Deployment | Vercel |

---

## Local Development

```bash
npm install
cp .env.example .env.local   # fill in your credentials
npm run dev                   # http://localhost:3000
```

Magic links are not sent in development — the link is printed directly to the terminal instead.

### Seed the database

```bash
npx tsx scripts/seed.ts <email>
# example:
npx tsx scripts/seed.ts you@example.com
```

This writes ~1,050 items for the given email: 30 assets, ~180 clips, 25 streams, 400+ chat spikes, and 365 days of analytics. The seed script auto-loads `.env.local`.

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `AWS_REGION` | AWS region (e.g. `eu-west-1`) |
| `AWS_ACCESS_KEY_ID` | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key |
| `DYNAMODB_TABLE_NAME` | DynamoDB table name |
| `S3_BUCKET` | S3 bucket for video uploads |
| `RESEND_API_KEY` | Resend API key for magic link emails |
| `RESEND_FROM` | Sender address (e.g. `hello@yourdomain.com`) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID (YouTube connect + AI) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GEMINI_API_KEY` | Google AI Studio key for Gemini |
| `NEXTAUTH_SECRET` | NextAuth signing secret |
| `AUTH_SECRET` | Auth.js v5 secret (same value as `NEXTAUTH_SECRET`) |
| `NEXTAUTH_URL` | App base URL (e.g. `https://the-truss-app.vercel.app`) |
| `TWITCH_CLIENT_ID` | Twitch app client ID (optional — for Twitch connect) |
| `TWITCH_CLIENT_SECRET` | Twitch app client secret |
| `TIKTOK_CLIENT_KEY` | TikTok app client key (optional — for TikTok connect) |
| `TIKTOK_CLIENT_SECRET` | TikTok app client secret |
| `DISCORD_CLIENT_ID` | Discord app client ID (optional — for Discord connect) |
| `DISCORD_CLIENT_SECRET` | Discord app client secret |

---

## AWS Setup

### DynamoDB
Create a table with partition key `PK` (String) and sort key `SK` (String). On-demand billing, no GSIs required — all queries use `begins_with` on the sort key.

Single-table key schema:
```
CREATOR#<userId>    METADATA                      → creator profile
CREATOR#<userId>    ASSET#<id>                    → uploaded video
CREATOR#<userId>    CLIP#<id>                     → extracted clip
CREATOR#<userId>    STREAM#<id>                   → live stream record
CREATOR#<userId>    LIVE_CHAT_SPIKE#<timestamp>   → chat spike event
CREATOR#<userId>    ANALYTICS#DAILY#<date>        → daily metrics
CREATOR#<userId>    PLATFORM_TOKEN#<platform>     → OAuth token per platform
MAGIC#<token>       VERIFY                        → magic link token (TTL 15 min)
```

> `userId` is the user's email address.

Enable TTL on the `ttl` attribute so expired magic link tokens are deleted automatically.

### S3
Create a bucket and configure CORS to allow presigned PUT uploads from your domain:
```json
[{
  "AllowedOrigins": ["https://the-truss-app.vercel.app", "http://localhost:3000"],
  "AllowedMethods": ["PUT"],
  "AllowedHeaders": ["*"]
}]
```

### IAM
Create an IAM user with programmatic access and attach a policy granting:
- `dynamodb:GetItem`, `PutItem`, `UpdateItem`, `DeleteItem`, `Query` on your table
- `s3:PutObject`, `s3:GetObject` on your bucket
- `s3:GeneratePresignedUrl` (covered by `s3:PutObject`)

---

## Platform OAuth Setup

Each platform requires a developer app with the Truss callback URL whitelisted:

| Platform | Redirect URI |
|----------|-------------|
| YouTube | `https://the-truss-app.vercel.app/api/connect/callback/youtube` |
| Twitch | `https://the-truss-app.vercel.app/api/connect/callback/twitch` |
| TikTok | `https://the-truss-app.vercel.app/api/connect/callback/tiktok` |
| Discord | `https://the-truss-app.vercel.app/api/connect/callback/discord` |

YouTube uses the existing Google OAuth client — just add the redirect URI above in Google Cloud Console. The others need separate developer apps on their respective portals.

---

## Deployment

Push to `main` to trigger a Vercel production deployment. Pull requests get preview deployments automatically.

After any env var change in Vercel, redeploy for the new values to take effect:
```bash
vercel --prod
```
