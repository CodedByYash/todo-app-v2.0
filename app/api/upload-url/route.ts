import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import getUser from "@/lib/getUser";
import {
  ALLOWED_UPLOAD_MIME_TYPES,
  MAX_UPLOAD_FILE_SIZE,
} from "@/lib/auth-guards";
import { NextResponse } from "next/server";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(req: Request) {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filename = searchParams.get("filename");
    const fileType = searchParams.get("fileType");
    const fileSizeParam = searchParams.get("fileSize");
    const fileSize = fileSizeParam ? parseInt(fileSizeParam, 10) : null;

    if (!filename || !fileType) {
      return NextResponse.json(
        { error: "Missing filename or fileType" },
        { status: 400 },
      );
    }

    if (
      !ALLOWED_UPLOAD_MIME_TYPES.includes(
        fileType as (typeof ALLOWED_UPLOAD_MIME_TYPES)[number],
      )
    ) {
      return NextResponse.json(
        { error: "File type not allowed" },
        { status: 400 },
      );
    }

    if (fileSize !== null && (isNaN(fileSize) || fileSize > MAX_UPLOAD_FILE_SIZE)) {
      return NextResponse.json(
        { error: `File size must not exceed ${MAX_UPLOAD_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400 },
      );
    }

    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `uploads/${user.id}/${Date.now()}-${sanitizedFilename}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      ContentType: fileType,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 60 });

    return NextResponse.json({
      url,
      key,
      fileUrl: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    });
  } catch (error) {
    console.error("[UPLOAD_URL]", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 },
    );
  }
}
