/*
  Warnings:

  - The `workspaceSize` column on the `Workspace` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Workspace" DROP COLUMN "workspaceSize",
ADD COLUMN     "workspaceSize" INTEGER NOT NULL DEFAULT 1;
