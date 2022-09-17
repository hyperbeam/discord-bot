-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Session" (
    "url" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL PRIMARY KEY,
    "embedUrl" TEXT NOT NULL,
    "adminToken" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" DATETIME,
    "ownerId" TEXT NOT NULL,
    CONSTRAINT "Session_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Session" ("adminToken", "createdAt", "embedUrl", "endedAt", "ownerId", "sessionId", "url") SELECT "adminToken", "createdAt", "embedUrl", "endedAt", "ownerId", "sessionId", "url" FROM "Session";
DROP TABLE "Session";
ALTER TABLE "new_Session" RENAME TO "Session";
CREATE UNIQUE INDEX "Session_url_key" ON "Session"("url");
CREATE UNIQUE INDEX "Session_sessionId_key" ON "Session"("sessionId");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hash" TEXT,
    "email" TEXT,
    "avatar" TEXT,
    "username" TEXT NOT NULL,
    "discriminator" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("accessToken", "avatar", "discriminator", "email", "hash", "id", "refreshToken", "username") SELECT "accessToken", "avatar", "discriminator", "email", "hash", "id", "refreshToken", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");
CREATE UNIQUE INDEX "User_hash_key" ON "User"("hash");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
