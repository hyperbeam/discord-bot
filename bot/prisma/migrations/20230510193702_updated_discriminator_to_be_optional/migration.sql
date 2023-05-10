-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hash" TEXT,
    "email" TEXT,
    "avatar" TEXT,
    "username" TEXT NOT NULL,
    "discriminator" TEXT,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("accessToken", "avatar", "discriminator", "email", "hash", "id", "refreshToken", "updatedAt", "username") SELECT "accessToken", "avatar", "discriminator", "email", "hash", "id", "refreshToken", "updatedAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");
CREATE UNIQUE INDEX "User_hash_key" ON "User"("hash");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
