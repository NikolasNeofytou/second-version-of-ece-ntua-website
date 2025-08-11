-- CreateTable
CREATE TABLE "Course" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "code" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "credits" INTEGER NOT NULL,
  "semester" INTEGER NOT NULL,
  "type" TEXT NOT NULL,
  "prerequisites" TEXT NOT NULL DEFAULT '',
  "instructors" TEXT NOT NULL DEFAULT '',
  "description" TEXT NOT NULL,
  "outcomes" TEXT NOT NULL DEFAULT '',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Course_code_key" ON "Course"("code");
