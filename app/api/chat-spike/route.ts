import { NextRequest, NextResponse } from "next/server";
import { writeChatSpike } from "@/lib/db";

// Spike detection: fires when message rate exceeds 200% of baseline
const SPIKE_THRESHOLD_MULTIPLIER = 2.0;

export async function POST(req: NextRequest) {
  try {
    const { userId, messageRate, baseline, streamId } = await req.json();

    if (!userId || messageRate === undefined || baseline === undefined) {
      return NextResponse.json(
        { error: "userId, messageRate, and baseline are required" },
        { status: 400 }
      );
    }

    const isSpike = messageRate > baseline * SPIKE_THRESHOLD_MULTIPLIER;

    if (isSpike) {
      const timestamp = new Date().toISOString();
      await writeChatSpike(userId, {
        timestamp,
        messageRate,
        baseline,
        highlightRange: streamId
          ? { start: Date.now() - 30000, end: Date.now() }
          : undefined,
        streamId,
      });

      return NextResponse.json({
        spike: true,
        timestamp,
        messageRate,
        baseline,
        ratio: (messageRate / baseline).toFixed(2),
      });
    }

    return NextResponse.json({
      spike: false,
      messageRate,
      baseline,
      ratio: (messageRate / baseline).toFixed(2),
    });
  } catch (error) {
    console.error("Chat spike error:", error);
    return NextResponse.json(
      { error: "Spike detection failed" },
      { status: 500 }
    );
  }
}
