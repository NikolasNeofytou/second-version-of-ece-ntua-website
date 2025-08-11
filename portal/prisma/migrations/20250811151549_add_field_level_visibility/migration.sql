-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "year" INTEGER,
    "bio" TEXT,
    "interestsRaw" TEXT NOT NULL DEFAULT '',
    "skillsRaw" TEXT NOT NULL DEFAULT '',
    "visibility" TEXT NOT NULL DEFAULT 'PUBLIC',
    "avatarUrl" TEXT,
    "bannerUrl" TEXT,
    "bioVisibility" TEXT NOT NULL DEFAULT 'PUBLIC',
    "interestsVisibility" TEXT NOT NULL DEFAULT 'PUBLIC',
    "skillsVisibility" TEXT NOT NULL DEFAULT 'PUBLIC',
    "yearVisibility" TEXT NOT NULL DEFAULT 'PUBLIC',
    "avatarVisibility" TEXT NOT NULL DEFAULT 'PUBLIC',
    "bannerVisibility" TEXT NOT NULL DEFAULT 'PUBLIC',
    "completeness" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Profile" ("avatarUrl", "bannerUrl", "bio", "completeness", "createdAt", "id", "interestsRaw", "skillsRaw", "updatedAt", "userId", "visibility", "year") SELECT "avatarUrl", "bannerUrl", "bio", "completeness", "createdAt", "id", "interestsRaw", "skillsRaw", "updatedAt", "userId", "visibility", "year" FROM "Profile";
DROP TABLE "Profile";
ALTER TABLE "new_Profile" RENAME TO "Profile";
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
