"use server";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getS3Client } from "@/lib/aws";
import { createAsset } from "@/lib/db";
import { randomUUID } from "crypto";

export async function getPresignedUploadUrl(
  filename: string,
  contentType: string,
  userId: string
) {
  const videoId = randomUUID();
  const s3Key = `uploads/${userId}/${videoId}/${filename}`;

  const s3 = await getS3Client();
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    Key: s3Key,
    ContentType: contentType,
  });

  const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

  await createAsset(userId, videoId, filename, s3Key);

  return { presignedUrl, videoId, s3Key };
}
