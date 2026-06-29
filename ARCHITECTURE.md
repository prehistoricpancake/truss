# Truss — Architecture Overview

Reviewed against the **AWS Well-Architected Framework** (six pillars).  
Current date: 2026-06-29. Deployment target: Vercel + AWS (DynamoDB, S3).

---

## 1. System Overview

Truss is a creator-focused SaaS. A user uploads a video (or connects a live stream), Truss extracts the highest-engagement moments using Gemini, scores each for virality, and publishes vertical 9:16 clips to connected platforms (YouTube live; Twitch/TikTok/Discord coming soon).

### Component map

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser                                                        │
│  React 19 · Next.js App Router · Tailwind v4                    │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────────────────────┐
│  Vercel Edge (proxy.ts)                                         │
│  Route protection — checks authjs.session-token cookie          │
│  Redirects unauthenticated → /login                             │
│  Redirects authenticated away from /login, /signup             │
└──────────┬──────────────────────────────────┬───────────────────┘
           │                                  │
┌──────────▼──────────┐          ┌────────────▼───────────────────┐
│  Next.js Server     │          │  Next.js API Routes             │
│  Components &       │          │  /api/upload                    │
│  Server Actions     │          │  /api/analyze                   │
│  (App Router)       │          │  /api/connect/[platform]        │
│                     │          │  /api/connect/callback/[platform]│
│  app/actions/       │          │  /api/chat-spike                │
│  magic.ts           │          │  /api/auth/magic-callback       │
│  billing.ts         │          │  /api/webhooks/stripe           │
│  onboarding.ts      │          │  /api/auth/[...nextauth]        │
└──────────┬──────────┘          └────────────┬───────────────────┘
           │                                  │
           └──────────────┬───────────────────┘
                          │
           ┌──────────────▼───────────────────┐
           │  lib/aws.ts (credential factory) │
           │  Vercel OIDC → STS               │
           │  AssumeRoleWithWebIdentity        │
           │  Cached STS credentials (1 hr)   │
           └──────────┬───────────────────────┘
                      │
         ┌────────────┴────────────┐
         │                         │
┌────────▼────────┐      ┌─────────▼────────┐
│  DynamoDB       │      │  S3              │
│  Single table   │      │  Video uploads   │
│  On-demand RCU/ │      │  Clips / VODs    │
│  WCU            │      │  Presigned PUTs  │
└─────────────────┘      └──────────────────┘

External services
  Resend         — magic link email delivery
  Google Gemini  — AI highlight extraction (Vercel AI SDK)
  Stripe         — subscription billing + webhooks
  YouTube OAuth  — platform connection (live)
  Twitch / TikTok / Discord OAuth  — platform connection (standby)
```

---

## 2. Data Flows

### 2a. Magic link authentication

```
1. User submits email on /login
2. sendMagicLink() [Server Action]
   → createMagicToken(): writes MAGIC#<token> / VERIFY to DynamoDB (TTL 15 min)
   → Resend API: sends HTML email with link to /magic-verify?token=…&email=…
3. User clicks link → /magic-verify (server component)
   → Redirects to /api/auth/magic-callback?token=…&email=…
4. Route Handler calls NextAuth signIn("credentials", {email, token})
   → verifyMagicToken(): checks DynamoDB, validates email + expiry, deletes token
   → createCreator() if first login
5. NextAuth sets authjs.session-token cookie
6. proxy.ts reads cookie on every subsequent request
```

### 2b. Video upload + AI analysis

```
1. Client requests presigned URL: /api/upload (POST)
   → Creates ASSET#<videoId> in DynamoDB (status: uploading)
   → Returns S3 presigned PUT URL (1-hour TTL)
2. Browser uploads file directly to S3 (no Vercel bandwidth)
3. Client calls /api/analyze (POST) with transcript + energy markers
   → Gemini 2.0 Flash returns structured JSON: [{start, end, title, viralityScore}]
   → Saves ASSET#<videoId>#CHAPTERS to DynamoDB
   → Updates asset status: ready
4. Dashboard renders clips with virality scores
```

### 2c. Platform OAuth connection

```
1. /api/connect/[platform] (GET)
   → Reads session (userId)
   → Builds OAuth URL; encodes state = base64url({userId, platform})
   → Redirects to platform provider
2. Platform redirects to /api/connect/callback/[platform]?code=…&state=…
   → Decodes state to verify userId
   → Exchanges code for access_token + refresh_token
   → Fetches username / channelId from platform API
   → savePlatformToken(): writes PLATFORM_TOKEN#<platform> to DynamoDB
   → updateCreator(): appends platform to connectedPlatforms[]
   → Redirects to /connect?success=<platform>
```

### 2d. Subscription billing

```
1. Creator clicks upgrade → createCheckout() [Server Action]
   → Stripe Checkout session (mode: subscription)
   → Redirects to Stripe-hosted checkout page
2. Stripe POSTs to /api/webhooks/stripe
   → Validates HMAC signature (STRIPE_WEBHOOK_SECRET)
   → checkout.session.completed → updateCreatorPlan(pro|studio)
   → customer.subscription.deleted → updateCreatorPlan(starter)
3. Plan stored on CREATOR#<userId> / METADATA in DynamoDB
```

---

## 3. DynamoDB Single-Table Design

Partition key: `PK` (String) · Sort key: `SK` (String)

| PK | SK | Entity | Notes |
|----|----|--------|-------|
| `CREATOR#<email>` | `METADATA` | Creator profile | plan, connectedPlatforms, stripeCustomerId |
| `CREATOR#<email>` | `ASSET#<id>` | Uploaded video | filename, s3Key, status, chapters[] |
| `CREATOR#<email>` | `ASSET#<id>#CHAPTERS` | AI chapter list | viralityScore per segment |
| `CREATOR#<email>` | `CLIP#<id>` | Extracted clip | s3Key, viralityScore, status |
| `CREATOR#<email>` | `STREAM#<id>` | Live stream VOD | platform, vodS3Path, timestamps |
| `CREATOR#<email>` | `LIVE_CHAT_SPIKE#<ts>` | Chat spike event | messageRate, baseline, highlightRange |
| `CREATOR#<email>` | `ANALYTICS#DAILY#<date>` | Daily metrics | views, followers, clips, watchTimeMinutes |
| `CREATOR#<email>` | `PLATFORM_TOKEN#<platform>` | OAuth token | accessToken, refreshToken, expiresAt |
| `MAGIC#<token>` | `VERIFY` | Magic link token | email, ttl (auto-expires at 15 min) |

All queries use `begins_with(SK, prefix)` — no GSIs required.

---

## 4. AWS Well-Architected Framework

### Pillar 1 — Operational Excellence

**What's in place**

- Infrastructure is fully managed (Vercel + DynamoDB + S3 on-demand). Zero servers to patch or scale manually.
- Single-table DynamoDB design keeps operational surface small — one table, one IAM policy, one CloudWatch log group.
- Seed script (`scripts/seed.ts`) produces reproducible test data; any developer can re-create a full dataset against a clean table.
- Deployments are automated: push to `main` → Vercel production deploy; PRs get preview URLs automatically.

**Gaps to address**

| Gap | Recommended action |
|-----|--------------------|
| Structured logging | Replace `console.error()` with structured JSON logs (include `userId`, `platform`, `requestId`). Vercel forwards stdout to log drains — forward to a log aggregator (e.g., Axiom, Datadog). |
| Observability | Add Vercel Analytics + Speed Insights. Instrument AI latency (`/api/analyze`) separately — Gemini calls are the single largest p99 contributor. |
| Runbooks | Document the manual steps for: rotating NEXTAUTH_SECRET, revoking a platform token, recovering a failed upload. |
| Feature flags | Platform `available: boolean` in `ConnectClient.tsx` is hardcoded. Move to a config record in DynamoDB or an env var so you can enable Twitch/TikTok without a code deploy. |

---

### Pillar 2 — Security

**What's in place**

- **Identity**: Passwordless magic link — no password database, no credential stuffing risk.
- **AWS credentials**: Vercel OIDC → `AssumeRoleWithWebIdentity` → short-lived STS tokens (no static `AWS_ACCESS_KEY_ID` in production). Credentials are cached in memory with a 60-second buffer before expiry.
- **Session tokens**: NextAuth v5 JWT stored in `HttpOnly` cookies (`authjs.session-token` / `__Secure-authjs.session-token`). The proxy reads these to gate every protected route.
- **OAuth state parameter**: State is `base64url(JSON({userId, platform}))`, preventing CSRF on the callback.
- **Stripe webhook**: HMAC-SHA256 signature verified before processing any billing event.
- **Data isolation**: All DynamoDB queries are scoped to `PK = CREATOR#<userId>` — a user can only read their own data.
- **S3 presigned URLs**: Browser uploads go directly to S3 (1-hour TTL); Vercel never handles raw video bytes.

**Gaps to address**

| Gap | Recommended action |
|-----|--------------------|
| Magic token CSRF | The `/api/auth/magic-callback` route accepts `token` + `email` as GET params. Add a short-lived PKCE verifier or bind the token to the browser session to prevent token-harvesting via referrer headers. |
| Platform OAuth state integrity | State is not HMAC-signed — a forged base64 state with a different userId would be accepted. Sign state with `NEXTAUTH_SECRET` (e.g., `jose` JWT or HMAC-SHA256). |
| Platform token encryption | OAuth `accessToken` and `refreshToken` are stored in DynamoDB in plaintext. Encrypt at the application layer (AES-256-GCM) before writing, decrypt on read. DynamoDB encryption-at-rest protects the disk, not the attribute values from someone with table read access. |
| S3 bucket policy | Confirm the bucket blocks public access (BlockPublicAcls, IgnorePublicAcls, BlockPublicPolicy, RestrictPublicBuckets). Presigned URLs work without a public bucket. |
| IAM least privilege | Audit the IAM policy on the assumed role — it should be scoped to the specific table ARN and bucket ARN, not `*`. |
| Rate limiting | `sendMagicLink()` has no rate limit. A bot can exhaust Resend quota by sending thousands of magic links to arbitrary emails. Add per-email rate limiting (e.g., DynamoDB TTL counter or Vercel KV). |

---

### Pillar 3 — Reliability

**What's in place**

- DynamoDB is multi-AZ by default with 99.999% availability SLA. On-demand capacity eliminates throttling from capacity planning errors.
- Magic tokens use DynamoDB TTL for automatic expiry — no cleanup job to fail.
- S3 provides 99.999999999% (11 9s) durability for uploaded video files.
- Resend is only called in production (`isDev` guard) — local dev doesn't depend on external email delivery.
- Vercel functions are stateless and auto-recover; no sticky sessions.

**Gaps to address**

| Gap | Recommended action |
|-----|--------------------|
| No retry logic on Gemini | `/api/analyze` calls Gemini with no retry. Transient 429/503 responses from Google AI will surface as a failed analysis. Wrap with exponential backoff (2–3 retries). |
| Asset pipeline is synchronous | Video analysis blocks the HTTP request. For videos > 30s, this risks Vercel's 300s function timeout and gives no progress feedback to the user. Move analysis to a background job (Vercel Queues or a DynamoDB Streams trigger on Lambda). |
| No dead-letter handling | If the Stripe webhook fails (DynamoDB unavailable), Stripe will retry — but there's no alert or manual replay path documented. Add a CloudWatch alarm on DynamoDB write errors. |
| Missing upload completion signal | After the browser uploads to S3, there's no server-side confirmation that the file actually arrived. Add an S3 Event Notification → Lambda (or API route poll) to flip asset status from `uploading` to `processing`. |
| Single region | Everything runs in one AWS region. For a creator SaaS, region outage = full downtime. Document the RTO/RPO, and consider DynamoDB Global Tables if availability SLA matters. |

---

### Pillar 4 — Performance Efficiency

**What's in place**

- S3 presigned PUT: browser uploads bypass Vercel entirely, eliminating the biggest potential bottleneck.
- DynamoDB on-demand: no cold-start capacity to provision; reads/writes scale instantly.
- Next.js App Router: Server Components reduce JS bundle size — only interactive islands ship client JS.
- Vercel Edge Network: static assets (images, fonts, JS bundles) are cached at CDN edge globally.
- STS credential caching (`_cachedCreds` in `lib/aws.ts`): avoids an STS round-trip on every request.

**Gaps to address**

| Gap | Recommended action |
|-----|--------------------|
| Gemini latency is unbounded | There's no timeout on the `generateObject` call to Gemini. Set a `maxRetries: 0` + `AbortSignal.timeout(20_000)` on the AI SDK call to surface slow responses early. |
| DynamoDB query scans entire partition | `getAssets()`, `getClips()`, `getStreams()` all `Query` the full `CREATOR#` partition with no `Limit`. For users with 1,000+ clips this returns everything in one round-trip. Add `Limit` + `ExclusiveStartKey` pagination. |
| No caching layer | Creator metadata, clips, and analytics are fetched on every page load from DynamoDB. Cache aggressively in Next.js with `unstable_cache` or React `cache()` — creator metadata changes rarely. |
| S3 object retrieval | Clip playback likely generates direct S3 URLs. Add a CloudFront distribution in front of S3 to cache video bytes at edge and avoid per-byte S3 GET costs at scale. |
| Chat spike polling | There's no WebSocket or SSE — chat velocity data is static on page load. Add SSE or polling from the dashboard for the live chart. |

---

### Pillar 5 — Cost Optimization

**What's in place**

- DynamoDB on-demand: pay per request, no idle capacity cost.
- S3 presigned uploads: Vercel egress is zero for video data (browser → S3 direct).
- Vercel serverless: functions are pay-per-invocation; idle cost is zero.
- Resend free tier covers early traction (3,000 emails/month).

**Gaps to address**

| Gap | Recommended action |
|-----|--------------------|
| S3 lifecycle policies | Video uploads have no expiry. Raw uploads that have been processed into clips should be moved to S3 Intelligent-Tiering or Glacier after 90 days. Unprocessed failed uploads should be deleted after 7 days. |
| DynamoDB reads on every page | Every product page calls DynamoDB on render. At scale (10k+ users), cold traffic spikes will be expensive. Cache static reads (analytics, creator metadata) with a 60-second TTL. |
| Gemini API costs | There's no cost cap or request budget on Gemini calls. Add per-user daily limits enforced in DynamoDB (increment a counter, block at threshold). |
| Stripe webhook retries | Failed webhook deliveries cause Stripe to retry 3 days. Each retry is a DynamoDB write. This is low cost but add idempotency checks (`checkout.session.id` deduplication) to avoid duplicate plan updates. |

---

### Pillar 6 — Sustainability

**What's in place**

- Serverless compute (Vercel + DynamoDB) runs on shared infrastructure — far better utilization than dedicated EC2 instances.
- S3 presigned uploads skip an extra server hop, reducing compute cycles per upload.
- No always-on servers or polling workers — compute only runs when a user triggers it.

**Areas to consider**

| Area | Note |
|------|------|
| AI inference | Gemini calls are the highest-energy operation per user action. Batch analysis of multiple timestamps in a single API call (already done via structured output) is the right approach. Avoid re-analyzing unchanged videos. |
| Video storage | Raw uploaded videos may be retained indefinitely. Define a retention policy — archive or delete source files after clip extraction to reduce storage energy. |
| CDN caching | Serving clip thumbnails and video previews from CloudFront edge reduces origin fetches and the associated compute energy at the S3/DynamoDB layer. |

---

## 5. Key Risks Summary

| Risk | Severity | Pillar |
|------|----------|--------|
| OAuth state not HMAC-signed — userId spoofable | High | Security |
| Platform OAuth tokens stored plaintext in DynamoDB | Medium | Security |
| No rate limit on magic link sends | Medium | Security, Reliability |
| AI analysis blocks HTTP request — timeout on long videos | Medium | Reliability |
| No S3 upload confirmation signal | Medium | Reliability |
| DynamoDB queries unbounded — pagination missing | Low–Medium | Performance |
| S3 no lifecycle policy — storage grows unbounded | Low | Cost |

---

## 6. Technology Reference

| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.9 |
| Runtime | React | 19.2.4 |
| Auth | NextAuth (Auth.js v5) | 5.0.0-beta.31 |
| Database | AWS DynamoDB (single-table) | on-demand |
| Object storage | AWS S3 | — |
| AI | Google Gemini 2.0 Flash via Vercel AI SDK | v7 |
| Email | Resend | v6 |
| Billing | Stripe | v22 |
| Hosting | Vercel (Fluid Compute) | — |
| Credential federation | AWS STS AssumeRoleWithWebIdentity | — |
| Styling | Tailwind CSS | v4 |
