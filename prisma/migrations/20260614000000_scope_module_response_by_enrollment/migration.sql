-- Scope student module answers to a specific program enrollment.
-- Existing answers are backfilled to the oldest matching enrollment for the
-- same user and program so current pilot data remains readable.
ALTER TABLE "ModuleResponse" ADD COLUMN "enrollmentId" TEXT;

UPDATE "ModuleResponse" AS mr
SET "enrollmentId" = (
  SELECT pe.id
  FROM "ProgramEnrollment" AS pe
  JOIN "ProgramModule" AS pm ON pm."programId" = pe."programId"
  WHERE pe."userId" = mr."userId"
    AND pm.id = mr."moduleId"
  ORDER BY pe."createdAt" ASC
  LIMIT 1
);

DROP INDEX "ModuleResponse_userId_moduleId_key";
CREATE UNIQUE INDEX "ModuleResponse_enrollmentId_moduleId_key" ON "ModuleResponse"("enrollmentId", "moduleId");
CREATE INDEX "ModuleResponse_userId_moduleId_idx" ON "ModuleResponse"("userId", "moduleId");

ALTER TABLE "ModuleResponse"
  ADD CONSTRAINT "ModuleResponse_enrollmentId_fkey"
  FOREIGN KEY ("enrollmentId") REFERENCES "ProgramEnrollment"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
