# Truss

**Cross-platform content infrastructure for creators.** Upload one video or connect a live stream — Truss extracts the best moments, scores them for viral potential, and publishes vertical 9:16 clips across YouTube, TikTok, Instagram, Twitch, and Discord simultaneously.

🌐 **Live:** [truss-rust.vercel.app](https://the-truss-app.vercel.app/)

---

## How It Works

### 1. Sign Up
Create an account with email + password or Google. After verifying your email, you land on the dashboard.

### 2. Upload a Video
Go to **Upload** and drag in a video file. It uploads directly from your browser to S3 via a presigned URL — no file size limit from the app server.

### 3. AI Analysis
Once uploaded, click **Run AI Analysis**. Truss sends the video transcript to Gemini 3.5 Flash, which identifies the highest-impact moments and scores each for viral potential (1–100).

### 4. Clips
The extracted highlights appear in **Clips** as timestamped segments with virality scores. Each clip is ready to export as a 9:16 vertical short.

### 5. Live Streams
Connect a live stream in **Streams**. Truss monitors unified chat across platforms and detects engagement spikes (>200% baseline message rate) in real time, auto-marking clip boundaries at peak moments.

### 6. Analytics
The **Analytics** page tracks daily views, followers, clips generated, and watch time across all connected platforms in one place.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.9 (App Router, Turbopack) |
| Auth | AWS Cognito + NextAuth 5 |
| Database | Amazon DynamoDB (single-table) |
| Storage | Amazon S3 (presigned uploads) |
| AI | Google Gemini 3.5 Flash via Vercel AI SDK |
| Credentials | AWS STS OIDC federation (Vercel → AWS) |
| Deployment | Vercel |

---

## Local Development

```bash
npm install
cp .env.example .env   # fill in your credentials
npm run dev             # http://localhost:3000
```

Seed the database with demo data:

```bash
npx tsx scripts/seed.ts
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `AWS_REGION` | AWS region (e.g. `eu-west-1`) |
| `DYNAMODB_TABLE_NAME` | DynamoDB table name |
| `S3_BUCKET` | S3 bucket for video uploads |
| `COGNITO_USER_POOL_ID` | Cognito User Pool ID |
| `COGNITO_CLIENT_ID` | Cognito app client ID |
| `COGNITO_CLIENT_SECRET` | Cognito app client secret |
| `COGNITO_HOSTED_DOMAIN` | Cognito hosted UI domain |
| `NEXT_PUBLIC_COGNITO_USER_POOL_ID` | Same as above (client-side) |
| `NEXT_PUBLIC_COGNITO_CLIENT_ID` | Same as above (client-side) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google AI Studio API key |
| `NEXTAUTH_SECRET` | NextAuth signing secret |
| `NEXTAUTH_URL` | App base URL |

---

## AWS Setup

### DynamoDB
Create a table with partition key `PK` (String) and sort key `SK` (String). No GSIs needed — all queries use `begins_with` on the sort key.

Single-table key schema:
```
CREATOR#<userId>  METADATA                    → creator profile
CREATOR#<userId>  ASSET#<id>                  → uploaded video
CREATOR#<userId>  CLIP#<id>                   → extracted clip
CREATOR#<userId>  STREAM#<id>                 → live stream
CREATOR#<userId>  LIVE_CHAT_SPIKE#<timestamp> → chat spike event
CREATOR#<userId>  ANALYTICS#DAILY#<date>      → daily metrics
```

### S3
Create a bucket and configure CORS to allow presigned PUT uploads from your domain:
```json
[{
  "AllowedOrigins": ["https://truss-rust.vercel.app", "http://localhost:3000"],
  "AllowedMethods": ["PUT"],
  "AllowedHeaders": ["*"]
}]
```

### Cognito
1. Create a User Pool with email as the sign-in attribute
2. Create an app client with `USER_PASSWORD_AUTH` enabled and a client secret
3. Add Google as a federated identity provider (optional)
4. Set callback URLs:
   - `https://truss-rust.vercel.app/api/auth/callback/cognito`
   - `http://localhost:3000/api/auth/callback/cognito`

### IAM (Vercel OIDC)
Create an IAM role with a trust policy for Vercel's OIDC provider. Attach policies for DynamoDB, S3, and STS. No static AWS credentials — Vercel exchanges an OIDC token for temporary credentials at runtime.

---

## What's Real vs. Simulated

### Real
- Cognito sign-up, email verification, Google sign-in
- S3 presigned URL generation and direct browser uploads
- DynamoDB reads/writes for all entities
- Gemini AI analysis for highlight extraction and virality scoring
- Chat spike detection (>200% baseline) with DynamoDB writes

### Simulated (labeled in UI)
- Video rendering pipeline (FFmpeg/Step Functions not wired)
- Live stream ingestion (no real Twitch/YouTube connection)
- Chat message feed (simulated message generator in dashboard)
- Transcript input for AI demo (canned transcript for demonstration)

---

## Deployment

Pushes to `main` auto-deploy to Vercel via GitHub Actions (`.github/workflows/deploy.yml`). Pull requests get preview deployments.

Required GitHub secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
