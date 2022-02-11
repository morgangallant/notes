/*
  Warnings:

  - You are about to drop the column `token` on the `Token` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Token_token_key` ON `Token`;

-- AlterTable
ALTER TABLE `Token` DROP COLUMN `token`;
