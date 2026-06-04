/*
  Warnings:

  - You are about to drop the column `project_id` on the `scenarios` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "scenarios" DROP CONSTRAINT "scenarios_project_id_fkey";

-- AlterTable
ALTER TABLE "scenarios" DROP COLUMN "project_id";
