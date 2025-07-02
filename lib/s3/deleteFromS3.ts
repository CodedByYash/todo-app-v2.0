import { DeleteObjectsCommand, S3Client } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const deleteFromS3 = async (fileKey: string) => {
  const command = new DeleteObjectsCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Delete: {
      Objects: [
        {
          Key: fileKey,
        },
      ],
    },
  });
  await s3.send(command);
};
