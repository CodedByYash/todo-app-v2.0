import { S3Client } from "@aws-sdk/client-s3";

let client: S3Client | null = null;

/** Lazily created so builds and routes without S3 configured don't fail. */
export function getS3Client() {
  if (!client) {
    client = new S3Client({
      region: process.env.AWS_REGION,
      credentials:
        process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
          ? {
              accessKeyId: process.env.AWS_ACCESS_KEY_ID,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            }
          : undefined,
    });
  }
  return client;
}

export const isS3Configured = () =>
  Boolean(process.env.AWS_REGION && process.env.AWS_S3_BUCKET);

/** Public base URL of uploaded objects, e.g. https://bucket.s3.region.amazonaws.com */
export const s3PublicBase = () =>
  `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com`;
