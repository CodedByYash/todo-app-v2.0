import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import getUser from "@/lib/getUser";
import {
  ALLOWED_UPLOAD_MIME_TYPES,
  MAX_UPLOAD_FILE_SIZE,
} from "@/lib/auth-guards";
import { getS3Client, isS3Configured, s3PublicBase } from "@/lib/s3/client";
import { badRequest, serverError, unauthorized } from "@/lib/api";
import { z } from "zod";

const querySchema = z.object({
  filename: z.string().min(1).max(255),
  fileType: z.enum(ALLOWED_UPLOAD_MIME_TYPES),
  fileSize: z.coerce.number().int().min(1).max(MAX_UPLOAD_FILE_SIZE),
});

export async function GET(request: Request) {
  try {
    const user = await getUser();
    if (!user) return unauthorized();

    if (!isS3Configured()) {
      return NextResponse.json(
        { error: "File uploads are not configured" },
        { status: 503 },
      );
    }

    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      filename: searchParams.get("filename"),
      fileType: searchParams.get("fileType"),
      fileSize: searchParams.get("fileSize"),
    });
    if (!parsed.success) {
      return badRequest(
        `Invalid upload request (max ${MAX_UPLOAD_FILE_SIZE / (1024 * 1024)}MB, allowed types only)`,
      );
    }
    const { filename, fileType, fileSize } = parsed.data;

    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `uploads/${user.id}/${Date.now()}-${safeName}`;

    const url = await getSignedUrl(
      getS3Client(),
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        ContentType: fileType,
        ContentLength: fileSize,
      }),
      { expiresIn: 60 },
    );

    return NextResponse.json({ url, key, fileUrl: `${s3PublicBase()}/${key}` });
  } catch (error) {
    return serverError("UPLOAD_URL", error);
  }
}
