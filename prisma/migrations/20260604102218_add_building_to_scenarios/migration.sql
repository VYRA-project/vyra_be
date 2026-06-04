/*
  Warnings:

  - Added the required column `element_id` to the `scenarios` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "scenarios" ADD COLUMN     "element_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "scenarios" ADD CONSTRAINT "scenarios_element_id_fkey" FOREIGN KEY ("element_id") REFERENCES "campus_elements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
