/*
  Warnings:

  - A unique constraint covering the columns `[idempotencyKey]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `idempotencyKey` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalGuest` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Booking` ADD COLUMN `idempotencyKey` VARCHAR(191) NOT NULL,
    ADD COLUMN `totalGuest` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Booking_idempotencyKey_key` ON `Booking`(`idempotencyKey`);
