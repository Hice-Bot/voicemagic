-- CreateTable
CREATE TABLE "VoiceFavorite" (
    "id" TEXT NOT NULL,
    "voiceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VoiceFavorite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VoiceFavorite_voiceId_userId_key" ON "VoiceFavorite"("voiceId", "userId");

-- CreateIndex
CREATE INDEX "VoiceFavorite_userId_orgId_idx" ON "VoiceFavorite"("userId", "orgId");

-- AddForeignKey
ALTER TABLE "VoiceFavorite" ADD CONSTRAINT "VoiceFavorite_voiceId_fkey" FOREIGN KEY ("voiceId") REFERENCES "Voice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
