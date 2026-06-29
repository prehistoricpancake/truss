import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const highlightSchema = z.object({
  highlights: z.array(
    z.object({
      start_offset: z.number(),
      end_offset: z.number(),
      title: z.string(),
      viralityScore: z.number().min(1).max(100),
    })
  ),
});

export async function POST(req: NextRequest) {
  try {
    const { transcript, energyMarkers } = await req.json();

    if (!transcript) {
      return NextResponse.json(
        { error: "Transcript is required" },
        { status: 400 }
      );
    }

    const result = await generateObject({
      model: google("gemini-3-flash-preview"),
      schema: highlightSchema,
      prompt: `Analyze this media asset context payload. Cross-reference transcript timestamps with the raw visual energy flags. Isolate high-impact narrative ranges and score each for viral potential.

Transcript:
${transcript}

Energy Markers:
${JSON.stringify(energyMarkers || [])}`,
    });

    return NextResponse.json(result.object);
  } catch (error) {
    console.error("Analyze error:", error);
    return NextResponse.json(
      { error: "Analysis failed" },
      { status: 500 }
    );
  }
}
