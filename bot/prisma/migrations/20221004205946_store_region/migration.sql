-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Session" (
    "url" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL PRIMARY KEY,
    "embedUrl" TEXT NOT NULL,
    "adminToken" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "region" TEXT NOT NULL DEFAULT 'NA',
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" DATETIME,
    "ownerId" TEXT NOT NULL,
    CONSTRAINT "Session_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Session" ("adminToken", "createdAt", "embedUrl", "endedAt", "ownerId", "sessionId", "updatedAt", "url") SELECT "adminToken", "createdAt", "embedUrl", "endedAt", "ownerId", "sessionId", "updatedAt", "url" FROM "Session";
DROP TABLE "Session";
ALTER TABLE "new_Session" RENAME TO "Session";
CREATE UNIQUE INDEX "Session_url_key" ON "Session"("url");
CREATE UNIQUE INDEX "Session_sessionId_key" ON "Session"("sessionId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
