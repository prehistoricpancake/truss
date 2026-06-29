# Hackathon Podcast Script — AWS H0 Hackathon (Vercel v0 + AWS Databases)

~3 minutes spoken · ~430 words · Reflective solo voice memo format · No visual cues

---

Six months ago I finished a three-hour stream, had one of those genuinely great gaming moments — the kind where everyone in chat loses their mind — and did nothing with it. Not because I didn't want to. Because the path from "that was good" to "that is a TikTok" involves clipping, transcoding to 9:16, writing a caption, exporting, then running the same upload flow four separate times across YouTube, TikTok, Instagram, Discord. I'd rather play another session than do that. And I think most creators feel the same way.

That frustration is what became Truss. Upload one video, or connect your live stream, and Truss does the rest — extracts the best moments, scores them for virality, publishes everywhere simultaneously.

Now, the thing I want to talk about today is a decision that looked boring on the surface but ended up shaping the entire build. The database.

When I sat down to design the schema, the instinct was relational. I drew out five tables — users, videos, clips, streams, analytics. It looked clean. Then I thought about the most common read operation in this app. Nearly every page — dashboard, clips, analytics, connections — is asking the same question: "Give me everything for this user, filtered by type." In SQL, that's joins or five separate queries. In DynamoDB, with a single-table design, that's one query per page — partition key is `CREATOR#userId`, and I use sort key prefixes (`ASSET#`, `CLIP#`, `STREAM#`, `ANALYTICS#DAILY#`) to separate entity types. The access patterns almost write themselves.

I chose DynamoDB over Postgres for two reasons beyond the query model. First, on-demand capacity — I have no idea how many users will sign up. I don't want to guess at provisioned throughput. Second, no connection pool. Vercel serverless functions don't maintain persistent connections; DynamoDB's HTTP API fits that model exactly. A relational database in a serverless environment means spending the first 50ms of every request negotiating a connection. DynamoDB just doesn't have that problem.

The other thing that genuinely surprised me was how clean the Vercel to AWS credential chain is now. My functions are using short-lived STS tokens via OIDC federation — no static keys anywhere in production. That used to be a significant infrastructure investment. It's now a couple of environment variables and an IAM role config.

I'm submitting Truss to the AWS H0 Hackathon, Vercel v0 plus AWS Databases track, because this is a stack I'd recommend to anyone building a B2C SaaS from scratch. Not because it's exciting — because it stays out of your way.

**#H0Hackathon**

If you're a creator, check out the-truss-app.vercel.app. If you're a developer considering this stack, single-table DynamoDB from day one. You'll thank yourself later.
