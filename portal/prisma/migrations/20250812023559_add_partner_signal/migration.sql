-- CreateTable
CREATE TABLE "PartnerSignal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdById" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "courseCode" TEXT NOT NULL,
    "project" TEXT NOT NULL,
    "details" TEXT,
    "membersNeeded" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PartnerSignal_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "PartnerSignal_courseCode_idx" ON "PartnerSignal"("courseCode");

-- CreateIndex
CREATE INDEX "PartnerSignal_type_idx" ON "PartnerSignal"("type");

-- CreateIndex
CREATE INDEX "PartnerSignal_status_idx" ON "PartnerSignal"("status");
