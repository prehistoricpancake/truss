import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const highlightSchema = z.object({
  highlights: z.array(
    z.object({
      start_offset: z.coerce.number(),
      end_offset: z.coerce.number(),
      title: z.string(),
      viralityScore: z.coerce.number().min(1).max(100),
    })
  ),
});

const SIMULATED_RESPONSE = {
  highlights: [
    { start_offset: 85,  end_offset: 115, title: "Did You See That?",        viralityScore: 94 },
    { start_offset: 158, end_offset: 188, title: "New Personal Best",         viralityScore: 88 },
    { start_offset: 191, end_offset: 221, title: "Donation Storm Erupts",     viralityScore: 81 },
    { start_offset: 295, end_offset: 325, title: "World Record Pace Locked",  viralityScore: 97 },
  ],
};

export async function POST(req: NextRequest) {
  try {
    const { transcript, energyMarkers } = await req.json();

    if (!transcript) {
      return NextResponse.json({ error: "Transcript is required" }, { status: 400 });
    }

    const { text } = await generateText({
      model: google("gemini-2.0-flash"),
      prompt: `You are a viral content analyst. Analyze this stream transcript and energy markers. Return ONLY a raw JSON object — no markdown, no code fences, no explanation.

The JSON must match this exact shape:
{
  "highlights": [
    {
      "start_offset": <number, seconds>,
      "end_offset": <number, seconds>,
      "title": "<short punchy clip title>",
      "viralityScore": <integer 1-100>
    }
  ]
}

Identify 3-5 high-impact moments. Score each for viral potential (80-100 = elite, 60-79 = strong, below 60 = moderate).

Transcript:
${transcript}

Energy Markers:
${JSON.stringify(energyMarkers || [])}`,
    });

    const cleaned = text
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    const parsed = highlightSchema.parse(JSON.parse(cleaned));
    return NextResponse.json(parsed);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Analyze error:", msg);

    // On quota or rate-limit errors, return simulated results so the demo stays live
    if (msg.includes("quota") || msg.includes("rate") || msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) {
      return NextResponse.json(SIMULATED_RESPONSE);
    }

    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
