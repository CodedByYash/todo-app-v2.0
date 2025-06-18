/*
  Warnings:

  - Added the required column `provider` to the `UserCredential` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserCredential" ADD COLUMN     "provider" TEXT NOT NULL,
ADD COLUMN     "providerId" TEXT;
