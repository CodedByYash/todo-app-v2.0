/*
  Warnings:

  - You are about to drop the column `department` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `jobTitle` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `companyDomain` on the `Workspace` table. All the data in the column will be lost.
  - You are about to drop the column `companyName` on the `Workspace` table. All the data in the column will be lost.
  - You are about to drop the column `companySize` on the `Workspace` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Workspace` table. All the data in the column will be lost.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspacename` to the `Workspace` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "department",
DROP COLUMN "jobTitle",
DROP COLUMN "name",
ADD COLUMN     "password" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Workspace" DROP COLUMN "companyDomain",
DROP COLUMN "companyName",
DROP COLUMN "companySize",
DROP COLUMN "name",
ADD COLUMN     "organizationDomain" TEXT,
ADD COLUMN     "organizationName" TEXT,
ADD COLUMN     "workspaceSize" TEXT,
ADD COLUMN     "workspacename" TEXT NOT NULL;
