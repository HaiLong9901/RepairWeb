/*
  Warnings:

  - You are about to drop the column `coordinate` on the `UserAddress` table. All the data in the column will be lost.
  - Added the required column `latitude` to the `UserAddress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `UserAddress` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserAddress" DROP COLUMN "coordinate",
ADD COLUMN     "latitude" INTEGER NOT NULL,
ADD COLUMN     "longitude" INTEGER NOT NULL;
