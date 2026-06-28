import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getS3Client } from "@/lib/aws";
import { createAsset } from "@/lib/db";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { filename, contentType, userId } = await req.json();

    if (!filename || !contentType || !userId) {
      return NextResponse.json(
        { error: "filename, contentType, and userId are required" },
        { status: 400 }
      );
    }

    const videoId = randomUUID();
    const s3Key = `uploads/${userId}/${videoId}/${filename}`;

    const s3 = await getS3Client();
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: s3Key,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    // Create asset record in DynamoDB
    await createAsset(userId, videoId, filename, s3Key);

    return NextResponse.json({
      presignedUrl,
      videoId,
      s3Key,
    });
  } catch (error) {
    console.error("Upload presign error:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
