import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getS3Client, isS3Configured } from "@/lib/s3/client";

export const deleteFromS3 = async (fileKey: string) => {
  if (!isS3Configured()) return;
  await getS3Client().send(
    new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileKey,
    }),
  );
};
