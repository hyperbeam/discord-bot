/*
  Warnings:

  - You are about to drop the `Room` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RoomMember` table. If the table is not empty, all the data it contains will be lost.
  - The primary key for the `Session` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `duration` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `roomId` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `terminationDate` on the `Session` table. All the data in the column will be lost.
  - Added the required column `ownerId` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Room_ownerId_key";

-- DropIndex
DROP INDEX "Room_url_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Room";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "RoomMember";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "_members" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_members_A_fkey" FOREIGN KEY ("A") REFERENCES "Session" ("sessionId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_members_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_banned" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_banned_A_fkey" FOREIGN KEY ("A") REFERENCES "Session" ("sessionId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_banned_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Session" (
    "url" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL PRIMARY KEY,
    "embedUrl" TEXT NOT NULL,
    "adminToken" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" DATETIME,
    "ownerId" TEXT NOT NULL,
    CONSTRAINT "Session_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Session" ("adminToken", "createdAt", "embedUrl", "sessionId") SELECT "adminToken", "createdAt", "embedUrl", "sessionId" FROM "Session";
DROP TABLE "Session";
ALTER TABLE "new_Session" RENAME TO "Session";
CREATE UNIQUE INDEX "Session_url_key" ON "Session"("url");
CREATE UNIQUE INDEX "Session_sessionId_key" ON "Session"("sessionId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "_members_AB_unique" ON "_members"("A", "B");

-- CreateIndex
CREATE INDEX "_members_B_index" ON "_members"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_banned_AB_unique" ON "_banned"("A", "B");

-- CreateIndex
CREATE INDEX "_banned_B_index" ON "_banned"("B");
