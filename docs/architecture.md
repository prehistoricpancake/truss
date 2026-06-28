# Truss - AWS Well-Architected Framework Architecture Document

> Cross-platform content infrastructure for creators. Ingests master videos and live streams, outputs metadata and algorithmically-cut vertical 9:16 shorts.

**Version:** 1.0
**Date:** 2026-06-26
**Stack:** Next.js 16.2.9 (App Router) | DynamoDB | S3 | Cognito | Stripe | OpenAI

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture Diagram](#2-architecture-diagram)
3. [Pillar 1 - Operational Excellence](#3-pillar-1---operational-excellence)
4. [Pillar 2 - Security](#4-pillar-2---security)
5. [Pillar 3 - Reliability](#5-pillar-3---reliability)
6. [Pillar 4 - Performance Efficiency](#6-pillar-4---performance-efficiency)
7. [Pillar 5 - Cost Optimization](#7-pillar-5---cost-optimization)
8. [Pillar 6 - Sustainability](#8-pillar-6---sustainability)
9. [Risk Register](#9-risk-register)
10. [Recommendations Roadmap](#10-recommendations-roadmap)

---

## 1. System Overview

### 1.1 Purpose

Truss enables content creators to upload long-form video or connect live streams, then automatically extract, score, and publish short-form vertical clips to multiple platforms (YouTube, TikTok, Instagram, Twitch, Discord).

### 1.2 Core Components

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Frontend** | Next.js 16.2.9 (App Router, Turbopack) | SSR/SSG web application |
| **Authentication** | AWS Cognito + NextAuth 5 | User identity, session management |
| **Data Layer** | Amazon DynamoDB (single-table) | Creator metadata, assets, clips, analytics |
| **Object Storage** | Amazon S3 | Video file storage with presigned uploads |
| **Credential Federation** | AWS STS (OIDC) | Vercel-to-AWS credential exchange |
| **Billing** | Stripe (Checkout + Webhooks) | Subscription management |
| **AI Pipeline** | OpenAI GPT-4o (Vercel AI SDK) | Content analysis, highlight extraction |
| **Deployment** | Vercel | Edge network, serverless functions |

### 1.3 Data Model

Single-table DynamoDB design with composite keys:

```
PK                      SK                              Entity
─────────────────────── ─────────────────────────────── ──────────────
CREATOR#<userId>        METADATA                        Creator profile
CREATOR#<userId>        ASSET#<assetId>                 Uploaded video
CREATOR#<userId>        CLIP#<clipId>                   Extracted clip
CREATOR#<userId>        STREAM#<streamId>               Live stream
CREATOR#<userId>        LIVE_CHAT_SPIKE#<timestamp>     Chat spike event
CREATOR#<userId>        ANALYTICS#DAILY#<date>          Daily metrics
```

### 1.4 Request Flow

```
Browser ──► Vercel Edge (proxy.ts) ──► Next.js App Router
                                           │
                  ┌────────────────────────┼────────────────────────┐
                  ▼                        ▼                        ▼
            Server Actions           API Routes              Static Pages
            (billing, upload)        (/api/*)                (landing, pricing)
                  │                        │
                  ▼                        ▼
            AWS SDK v3 ◄──── STS OIDC Federation (Vercel)
                  │                   or Default Chain (local)
         ┌────────┼────────┐
         ▼        ▼        ▼
      DynamoDB    S3    Cognito
```

---

## 2. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          INTERNET                                   │
└───────────────┬─────────────────────────────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────┐
│          VERCEL EDGE NETWORK          │
│  ┌─────────────────────────────────┐  │
│  │  proxy.ts (route protection)    │  │
│  │  - Session cookie validation    │  │
│  │  - Auth redirect logic          │  │
│  └──────────────┬──────────────────┘  │
│                 ▼                      │
│  ┌─────────────────────────────────┐  │
│  │  Next.js 16 App Router          │  │
│  │  ┌───────────┬───────────┐      │  │
│  │  │  Pages    │  API      │      │  │
│  │  │  (SSR)    │  Routes   │      │  │
│  │  └───────────┴───────────┘      │  │
│  │  ┌───────────────────────┐      │  │
│  │  │  Server Actions       │      │  │
│  │  │  (billing, upload)    │      │  │
│  │  └───────────────────────┘      │  │
│  └──────────────┬──────────────────┘  │
└─────────────────┼─────────────────────┘
                  │
    ┌─────────────┼─────────────────────────────┐
    │             ▼                              │
    │  ┌──────────────────┐                      │
    │  │  AWS STS          │                     │
    │  │  OIDC Federation  │◄── Vercel OIDC Token│
    │  └────────┬─────────┘                      │
    │           ▼                                │
    │  Temporary Credentials                     │
    │           │                                │
    │  ┌────────┴──────────────┬────────────┐    │
    │  ▼                       ▼            ▼    │
    │ ┌──────────┐  ┌──────────────┐ ┌────────┐ │
    │ │ DynamoDB  │  │     S3       │ │Cognito │ │
    │ │ (truss-   │  │ (truss-     │ │User    │ │
    │ │  main)    │  │  uploads-)  │ │Pool    │ │
    │ └──────────┘  └──────────────┘ └────────┘ │
    │                                            │
    │              AWS (eu-west-1)               │
    └────────────────────────────────────────────┘
                  │
    ┌─────────────┼─────────────────┐
    │             ▼                  │
    │  ┌──────────────────┐         │
    │  │  Stripe API       │        │
    │  │  (Billing/Subs)   │        │
    │  └──────────────────┘         │
    │  ┌──────────────────┐         │
    │  │  OpenAI API       │        │
    │  │  (GPT-4o Analysis)│        │
    │  └──────────────────┘         │
    │       Third-Party Services    │
    └───────────────────────────────┘
```

---

## 3. Pillar 1 - Operational Excellence

> *The ability to support development and run workloads effectively, gain insight into their operations, and continuously improve supporting processes and procedures.*

### 3.1 Current State

#### Organization

| Practice | Status | Details |
|----------|--------|---------|
| Infrastructure as Code | Partial | DynamoDB table and Cognito created via CLI; no CloudFormation/CDK/Terraform |
| CI/CD Pipeline | Not configured | No GitHub Actions, no automated testing pipeline |
| Environment Management | Basic | Single `.env` file, no per-environment configs |
| Runbooks | None | No documented operational procedures |

#### Prepare

- **Development workflow:** Turbopack for fast local development with hot reload
- **Seed script:** `scripts/seed.ts` provisions 34 demo items for local testing
- **Route protection:** `proxy.ts` handles auth redirects at the edge

#### Operate

- **Logging:** Console-only (`console.error` in catch blocks). No structured logging framework.
- **Monitoring:** No CloudWatch alarms, no Vercel analytics integration, no APM.
- **Alerting:** No alerting pipeline configured.

#### Evolve

- **Feedback loops:** No error tracking (Sentry, Datadog), no user analytics pipeline.

### 3.2 Recommendations

| Priority | Recommendation | Effort |
|----------|---------------|--------|
| **P0** | Add structured logging with correlation IDs across all API routes | Medium |
| **P0** | Configure CloudWatch alarms for DynamoDB throttling, S3 errors, Cognito auth failures | Medium |
| **P1** | Create IaC templates (CDK or Terraform) for all AWS resources | High |
| **P1** | Set up CI/CD with GitHub Actions (lint, type-check, test, deploy) | Medium |
| **P1** | Implement health check endpoint (`/api/health`) | Low |
| **P2** | Add Vercel Analytics or Datadog RUM for frontend observability | Low |
| **P2** | Create operational runbooks for common failure scenarios | Medium |

### 3.3 Design Decisions

**Why Vercel over self-hosted:** Eliminates operational burden of managing Node.js servers, SSL termination, and CDN configuration. Trade-off: less control over runtime environment and cold start behavior.

**Why single-table DynamoDB:** Reduces operational overhead of managing multiple tables. All access patterns served by a single table with composite keys. Trade-off: schema migrations require careful data backfill.

---

## 4. Pillar 2 - Security

> *The ability to protect data, systems, and assets to take advantage of cloud technologies to improve your security.*

### 4.1 Current State

#### Identity and Access Management

| Control | Status | Implementation |
|---------|--------|----------------|
| User authentication | Implemented | Cognito User Pool with email/password |
| Session management | Implemented | NextAuth JWT sessions with secure cookies |
| OIDC credential federation | Implemented | Vercel → STS → temporary AWS credentials |
| Route protection | Implemented | `proxy.ts` checks session cookies |
| API route authentication | **Missing** | API routes do not verify session/token |
| MFA | Not configured | Cognito supports it but not enabled |
| Google federation | Partial | Cognito configured, env vars empty |

#### Data Protection

| Control | Status | Implementation |
|---------|--------|----------------|
| Encryption at rest | Inherited | DynamoDB and S3 default encryption (AES-256) |
| Encryption in transit | Implemented | All AWS SDK calls use HTTPS; Vercel serves TLS |
| Presigned upload URLs | Implemented | 1-hour expiry, scoped to user path in S3 |
| Secrets management | Basic | Environment variables only; no Secrets Manager |
| Stripe webhook verification | Implemented | Signature validation with `STRIPE_WEBHOOK_SECRET` |

#### Tenant Isolation

```
All DynamoDB queries scoped by PK = CREATOR#<userId>
S3 keys structured as: uploads/<userId>/<videoId>/<filename>
```

Each creator's data is partition-isolated. No cross-tenant queries are possible through the data access layer (`lib/db.ts`).

### 4.2 Security Gaps

#### Critical

1. **Unauthenticated API routes** — `/api/upload`, `/api/analyze`, `/api/chat-spike` do not verify the caller's identity. `proxy.ts` only protects page routes, not API routes called directly.

   ```
   Risk: Any internet user can call POST /api/analyze with arbitrary input,
         consuming OpenAI credits and potentially exfiltrating data.
   ```

   **Remediation:** Add `auth()` check from NextAuth at the top of every API route handler:
   ```typescript
   const session = await auth();
   if (!session?.user?.id) {
     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
   }
   ```

2. **No input validation at API boundaries** — File uploads accept any `contentType` from the client. The analyze endpoint accepts unbounded transcript length.

   **Remediation:** Validate with Zod schemas at every API route entry point. Enforce file type allowlists and transcript size limits.

3. **Overly permissive image pattern** — `next.config.ts` allows `**.amazonaws.com`, which matches any AWS-hosted image, not just the application's S3 bucket.

   **Remediation:** Restrict to the specific bucket hostname.

#### High

4. **No rate limiting** — No protection against brute-force login, API abuse, or webhook replay attacks.

5. **No CSRF protection** — Server actions and API routes lack CSRF tokens.

6. **No Content Security Policy headers** — No CSP, X-Frame-Options, or other security headers configured.

7. **Beta dependency** — `next-auth@5.0.0-beta` is pre-release software in a security-critical path.

### 4.3 Credential Flow

```
LOCAL DEVELOPMENT:
  AWS CLI profile (~/.aws/credentials)
  └──► Default credential chain
       └──► DynamoDB, S3 clients

PRODUCTION (Vercel):
  Vercel OIDC token (auto-injected)
  └──► STS AssumeRoleWithWebIdentity
       └──► Temporary credentials (scoped IAM role)
            └──► DynamoDB, S3 clients
```

**Strength:** Production never uses long-lived AWS credentials. OIDC federation ensures credentials are short-lived and scoped to the IAM role's policy.

### 4.4 Recommendations

| Priority | Recommendation | Effort |
|----------|---------------|--------|
| **P0** | Add authentication checks to all API routes | Low |
| **P0** | Add Zod input validation at all API boundaries | Medium |
| **P0** | Restrict `next.config.ts` image hostname to specific S3 bucket | Low |
| **P0** | Configure security headers (CSP, X-Frame-Options, HSTS) | Low |
| **P1** | Enable Cognito MFA (TOTP) | Low |
| **P1** | Add rate limiting via Vercel Edge or API Gateway | Medium |
| **P1** | Migrate secrets to AWS Secrets Manager or Vercel encrypted env vars | Medium |
| **P2** | Implement CSRF protection on server actions | Medium |
| **P2** | Add WAF rules for API protection | Medium |
| **P2** | Upgrade next-auth to stable release when available | Low |

---

## 5. Pillar 3 - Reliability

> *The ability of a workload to perform its intended function correctly and consistently.*

### 5.1 Current State

#### Fault Isolation

| Component | Blast Radius | Recovery |
|-----------|-------------|----------|
| Vercel (app hosting) | Full application outage | Auto-healing, multi-region edge |
| DynamoDB | Data layer unavailable | AWS-managed, 99.999% SLA |
| S3 | Upload/download unavailable | AWS-managed, 99.999999999% durability |
| Cognito | Authentication unavailable | AWS-managed, regional |
| Stripe | Billing unavailable | Webhook retry (72h) |
| OpenAI | AI analysis unavailable | Feature degrades, no fallback |

#### Failure Modes

| Failure | Impact | Current Handling |
|---------|--------|-----------------|
| DynamoDB throttle | Write/read failures | None — error bubbles to client |
| S3 presigned URL expiry | Upload fails | Client must retry; no guidance shown |
| Cognito rate limit | Sign-in fails | Error shown to user |
| Stripe webhook miss | Plan not updated | Stripe retries, but no idempotency check |
| OpenAI timeout | Analysis fails | 500 error returned |
| OIDC token expiry | All AWS calls fail | No credential refresh in long requests |

### 5.2 Reliability Gaps

1. **No retry logic** — AWS SDK calls have no explicit retry configuration. The SDK provides default retries (3 attempts) but this is not tuned for the workload.

2. **No idempotency** — Stripe webhooks can be delivered multiple times. The handler processes each delivery, potentially updating the plan redundantly. No idempotency key on checkout session creation.

3. **Orphaned records** — `POST /api/upload` creates a DynamoDB asset record before the file is uploaded to S3. If the upload fails, a `processing` record remains permanently.

4. **No circuit breakers** — If OpenAI is down, every analyze request will fail and wait for timeout. No circuit breaker to fail fast.

5. **No pagination** — `getAssets`, `getClips`, `getStreams` return all items without pagination. A creator with thousands of assets would cause timeouts and memory pressure.

6. **No dead-letter handling** — Failed webhook events have no secondary processing path.

### 5.3 Recommendations

| Priority | Recommendation | Effort |
|----------|---------------|--------|
| **P0** | Add idempotency keys to Stripe checkout sessions and webhook processing | Medium |
| **P0** | Implement asset cleanup for failed uploads (S3 event → Lambda → DynamoDB) | High |
| **P1** | Add pagination to all DynamoDB list queries (use `LastEvaluatedKey`) | Medium |
| **P1** | Configure SDK retry behavior for DynamoDB and S3 operations | Low |
| **P1** | Add circuit breaker for OpenAI calls (fail fast after N consecutive failures) | Medium |
| **P2** | Implement DLQ for failed Stripe webhooks (SQS or similar) | High |
| **P2** | Add graceful degradation: if OpenAI is down, queue analysis for later | High |
| **P2** | Enable DynamoDB Point-in-Time Recovery (PITR) | Low |

---

## 6. Pillar 4 - Performance Efficiency

> *The ability to use computing resources efficiently to meet system requirements, and to maintain that efficiency as demand changes and technologies evolve.*

### 6.1 Current State

#### Compute

| Component | Model | Scaling |
|-----------|-------|---------|
| Next.js pages | Vercel serverless functions | Auto-scaled per request |
| API routes | Vercel serverless functions | Auto-scaled, cold start ~200ms |
| Static pages | Vercel CDN (edge) | Globally distributed, no cold start |

#### Data

| Service | Configuration | Performance Characteristics |
|---------|--------------|---------------------------|
| DynamoDB | On-demand capacity | Auto-scales read/write, pay-per-request |
| S3 | Standard storage class | First-byte latency ~100ms |

#### Caching

| Layer | Status |
|-------|--------|
| CDN caching (static assets) | Automatic (Vercel) |
| API response caching | Not implemented |
| DynamoDB DAX | Not configured |
| AI analysis caching | Not implemented |

### 6.2 Performance Analysis

#### DynamoDB Access Patterns

```
Hot partition risk: CREATOR#<userId> with high write volume
  - Chat spikes: potentially hundreds of writes per stream
  - Analytics: 1 write per day per creator (low risk)
  - Assets/Clips: burst writes during processing (moderate risk)
```

The single-table design efficiently serves all current access patterns with single queries (no joins, no scatter-gather). The `CREATOR#<userId>` partition key provides natural tenant isolation and even distribution for multi-tenant workloads.

**Concern:** A viral creator with thousands of chat spikes per stream could create a hot partition. DynamoDB adaptive capacity handles this automatically, but sustained high throughput on a single partition may hit per-partition limits (1000 WCU/3000 RCU).

#### Video Upload Path

```
Browser ──presigned PUT──► S3 (direct)
  │
  └── DynamoDB record created before upload completes
      Status: "processing"
```

Direct S3 upload bypasses the application server entirely — no bandwidth or compute consumed for large file transfers. The 1-hour presigned URL expiry is generous for most file sizes.

#### AI Analysis Path

```
Client ──POST /api/analyze──► Vercel Function ──► OpenAI API
                                                   │
                                                   ▼
                                              GPT-4o inference
                                              (2-15 seconds)
```

**Concern:** OpenAI calls are synchronous and unbounded. A 60-second Vercel function timeout could be hit for large transcripts. No response caching means identical transcripts are re-analyzed.

### 6.3 Recommendations

| Priority | Recommendation | Effort |
|----------|---------------|--------|
| **P1** | Cache AI analysis results (DynamoDB or Redis) keyed by transcript hash | Medium |
| **P1** | Add `Limit` parameter to all DynamoDB queries (pagination) | Low |
| **P1** | Set transcript size limits on `/api/analyze` (e.g., 50,000 chars) | Low |
| **P2** | Evaluate DynamoDB DAX for read-heavy analytics queries | Medium |
| **P2** | Move AI analysis to async processing (SQS → Lambda) to avoid function timeouts | High |
| **P2** | Configure S3 Intelligent-Tiering for infrequently accessed old videos | Low |
| **P3** | Add ISR (Incremental Static Regeneration) for semi-static pages (pricing, landing) | Low |

---

## 7. Pillar 5 - Cost Optimization

> *The ability to run systems to deliver business value at the lowest price point.*

### 7.1 Cost Model

| Service | Pricing Model | Cost Driver |
|---------|--------------|-------------|
| **Vercel** | Per-request (serverless) | Page views, API calls, build minutes |
| **DynamoDB** | On-demand (per-request) | Read/write request units |
| **S3** | Per-GB stored + per-request | Video storage volume, upload/download requests |
| **Cognito** | Per-MAU (first 50K free) | Monthly active users |
| **OpenAI** | Per-token (GPT-4o) | Analysis requests × transcript length |
| **Stripe** | 2.9% + $0.30 per transaction | Subscription revenue |

### 7.2 Cost Risk Analysis

#### High Cost Risk

1. **OpenAI API** — No rate limiting, no caching, no input size limits. A single abusive user could generate significant API costs. GPT-4o pricing: ~$5/1M input tokens, ~$15/1M output tokens.

   ```
   Worst case: 1000 analyze calls × 50K token transcript = 50M tokens = $250/day
   ```

2. **S3 Storage** — Video files are large (100MB–5GB each). No lifecycle policies to transition old content to cheaper storage classes or delete unused uploads.

   ```
   100 creators × 20 videos × 500MB average = 1TB = ~$23/month (Standard)
   With Intelligent-Tiering: ~$12/month
   ```

3. **DynamoDB unbounded writes** — Chat spike detection writes to DynamoDB on every spike event. High-activity streams could generate thousands of writes per hour.

#### Low Cost Risk

- **Cognito:** First 50,000 MAU free. Unlikely to exceed in early stages.
- **DynamoDB reads:** Single-table queries are efficient; each page load = 1 query.
- **Vercel:** Generous free tier; Pro plan at $20/month covers most use cases.

### 7.3 Recommendations

| Priority | Recommendation | Effort |
|----------|---------------|--------|
| **P0** | Add per-user rate limits on `/api/analyze` (e.g., 10 calls/hour on free tier) | Medium |
| **P0** | Cache AI results by content hash to eliminate redundant API calls | Medium |
| **P1** | Configure S3 Lifecycle rules: transition to IA after 30 days, Glacier after 90 | Low |
| **P1** | Set DynamoDB TTL on chat spike records (e.g., 90-day expiry) | Low |
| **P1** | Enforce storage quotas per plan tier (Starter: 5GB, Pro: 50GB, Studio: 500GB) | Medium |
| **P2** | Add Cost Explorer alerts for unexpected spend spikes | Low |
| **P2** | Evaluate reserved capacity for DynamoDB if usage patterns stabilize | Low |
| **P3** | Consider Bedrock/Claude as OpenAI alternative (may offer better pricing for batch) | Medium |

### 7.4 Tier-Based Resource Allocation

| Resource | Starter ($0) | Pro ($29) | Studio ($99) |
|----------|-------------|-----------|-------------|
| Storage | 5 GB | 50 GB | 500 GB |
| AI analyses/month | 10 | 100 | Unlimited |
| Concurrent streams | 1 | 3 | 10 |
| Chat spike retention | 7 days | 30 days | 90 days |

*Not yet enforced in code — requires implementation.*

---

## 8. Pillar 6 - Sustainability

> *The ability to continually improve sustainability impacts by reducing energy consumption and increasing efficiency.*

### 8.1 Current State

| Practice | Status |
|----------|--------|
| Region selection | eu-west-1 (Ireland) — renewable energy commitments |
| Compute efficiency | Serverless (Vercel) — no idle compute |
| Data lifecycle | Not configured — all data retained indefinitely |
| Right-sizing | DynamoDB on-demand — no over-provisioning |

### 8.2 Recommendations

| Priority | Recommendation | Effort |
|----------|---------------|--------|
| **P2** | Add S3 lifecycle policies to delete abandoned uploads after 24h | Low |
| **P2** | Set DynamoDB TTL on analytics records older than 1 year | Low |
| **P2** | Compress video thumbnails/previews to reduce S3 storage and transfer | Medium |
| **P3** | Evaluate ARM-based Lambda (Graviton) for any future Lambda functions | Low |
| **P3** | Implement client-side video compression before upload | High |

---

## 9. Risk Register

| ID | Risk | Pillar | Severity | Likelihood | Status |
|----|------|--------|----------|------------|--------|
| R1 | Unauthenticated API routes allow abuse | Security | Critical | High | Open |
| R2 | No input validation enables injection/abuse | Security | Critical | High | Open |
| R3 | OpenAI cost runaway from unlimited analysis | Cost | High | Medium | Open |
| R4 | Stripe webhook replay causes duplicate plan changes | Reliability | Medium | Medium | Open |
| R5 | Orphaned DynamoDB records from failed uploads | Reliability | Medium | High | Open |
| R6 | No monitoring/alerting delays incident detection | Ops Excellence | High | High | Open |
| R7 | DynamoDB hot partitions from chat spike bursts | Performance | Medium | Low | Open |
| R8 | next-auth beta dependency breaks on update | Reliability | Medium | Medium | Open |
| R9 | No IaC makes environment reproduction difficult | Ops Excellence | Medium | Medium | Open |
| R10 | No security headers exposes XSS/clickjacking | Security | High | Medium | Open |

---

## 10. Recommendations Roadmap

### Phase 1 — Security Hardening (Week 1-2)

- [ ] Add `auth()` checks to all API routes
- [ ] Add Zod validation schemas to all API inputs
- [ ] Configure security headers (CSP, HSTS, X-Frame-Options)
- [ ] Restrict `next.config.ts` image pattern to specific S3 bucket
- [ ] Add rate limiting on authentication and API endpoints

### Phase 2 — Reliability & Operations (Week 3-4)

- [ ] Add structured logging with request correlation IDs
- [ ] Implement Stripe webhook idempotency (check event ID before processing)
- [ ] Add pagination to all DynamoDB list operations
- [ ] Configure CloudWatch alarms for DynamoDB, S3, and Cognito
- [ ] Enable DynamoDB Point-in-Time Recovery
- [ ] Create health check endpoint

### Phase 3 — Cost Controls (Week 5-6)

- [ ] Implement per-user rate limits on AI analysis (tied to plan tier)
- [ ] Add AI result caching (keyed by content hash)
- [ ] Configure S3 lifecycle rules (IA after 30d, Glacier after 90d)
- [ ] Set DynamoDB TTL on chat spikes and old analytics
- [ ] Add storage quota enforcement per plan tier

### Phase 4 — Infrastructure Maturity (Week 7-8)

- [ ] Create CDK/Terraform templates for all AWS resources
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Add integration test suite
- [ ] Create operational runbooks
- [ ] Implement asset cleanup pipeline (S3 events → orphan detection)

---

## Appendix A: Service Dependencies

```
truss (Next.js)
├── @aws-sdk/client-dynamodb
├── @aws-sdk/client-s3
├── @aws-sdk/client-sts
├── @aws-sdk/lib-dynamodb
├── @aws-sdk/s3-request-presigner
├── amazon-cognito-identity-js
├── next-auth@5.0.0-beta
├── stripe@18.x
├── ai (Vercel AI SDK)
├── @ai-sdk/openai
└── zod (validation)
```

## Appendix B: Environment Variables

| Variable | Service | Required | Secret |
|----------|---------|----------|--------|
| `AWS_REGION` | All AWS | Yes | No |
| `DYNAMODB_TABLE_NAME` | DynamoDB | Yes | No |
| `S3_BUCKET` | S3 | Yes | No |
| `COGNITO_USER_POOL_ID` | Cognito | Yes | No |
| `COGNITO_CLIENT_ID` | Cognito | Yes | No |
| `COGNITO_CLIENT_SECRET` | Cognito | Yes | **Yes** |
| `COGNITO_HOSTED_DOMAIN` | Cognito | Yes | No |
| `NEXTAUTH_SECRET` | NextAuth | Yes | **Yes** |
| `NEXTAUTH_URL` | NextAuth | Yes | No |
| `STRIPE_SECRET_KEY` | Stripe | Yes | **Yes** |
| `STRIPE_WEBHOOK_SECRET` | Stripe | Yes | **Yes** |
| `STRIPE_PRICE_PRO` | Stripe | Yes | No |
| `STRIPE_PRICE_STUDIO` | Stripe | Yes | No |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe | Yes | No |
| `OPENAI_API_KEY` | OpenAI | Yes | **Yes** |
| `GOOGLE_CLIENT_ID` | Cognito/Google | Optional | No |
| `GOOGLE_CLIENT_SECRET` | Cognito/Google | Optional | **Yes** |
| `AWS_WEB_IDENTITY_TOKEN` | STS (Vercel) | Production only | **Yes** |
| `AWS_ROLE_ARN` | STS (Vercel) | Production only | No |
