# Hackathon Video Script — AWS H0 Hackathon (Vercel v0 + AWS Databases)

~3 minutes spoken · ~430 words · Live demo walkthrough format

---

**[SCREEN: Black. A Twitch clip plays — chat going absolutely wild, emotes flooding the screen]**

You just had the best 30 seconds of your stream. Chat knows it. You know it. And it'll be buried in a three-hour VOD by tomorrow morning, because clipping, converting to vertical, captioning, and posting to four platforms takes hours — not seconds. This is Truss.

**[SCREEN: Navigate to the-truss-app.vercel.app, show the dashboard]**

Let me show you how it works.

**[SCREEN: Drag a video file into the upload zone]**

I drop in a stream recording. Truss sends it to Gemini — Google's AI — which reads the transcript and visual energy markers, then scores every moment for viral potential from 1 to 100.

**[SCREEN: Clips page loads — scores like 94, 87, 81 visible on each tile]**

These are the moments worth posting. Ranked. No guesswork.

**[SCREEN: Navigate to /connect, click YouTube — OAuth popup appears and resolves]**

I link my YouTube account — ten seconds, standard OAuth — and Truss can publish any clip directly to my channel as a Short.

**[SCREEN: Show the Streams page with a live stream card and chat spike markers on the timeline]**

It also runs on live streams. Truss watches chat in real time. When the message rate jumps more than double the rolling baseline — that's a spike, that's a highlight. The timestamp gets marked automatically while you're still live.

**[SCREEN: Analytics page — daily views, followers, watch time trend lines]**

And every metric across every connected platform, in one place.

**[SCREEN: Fade to a clean architecture diagram]**

Now — here's how it's actually built.

The frontend runs on Vercel. Next.js App Router, React 19, deployed in under a minute. The data layer is a single AWS DynamoDB table. One table — user profiles, video assets, clips, streams, platform tokens, analytics, all of it. DynamoDB on-demand means this scales from zero to a hundred thousand users without me touching a capacity setting.

**[SCREEN: Brief animation showing browser → S3, bypassing Vercel]**

Video files never touch Vercel. The browser uploads directly to S3 via presigned URL. AI analysis runs on Vercel serverless functions. The whole stack stays serverless end to end.

I built this for the AWS H0 Hackathon — Vercel v0 plus AWS Databases track. The combination of Vercel's deployment experience and DynamoDB's zero-config scaling made it possible to ship a production SaaS in a hackathon window.

**[SCREEN: Show the live URL]**

Truss is live at the-truss-app.vercel.app. If you're a creator who lives in VODs, this is built for you.

**#H0Hackathon**
