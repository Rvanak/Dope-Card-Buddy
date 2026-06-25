-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "stripeCustomerId" TEXT,
    "trialAccessExpiresAt" TIMESTAMP(3),
    "legalAcceptedAt" TIMESTAMP(3),
    "legalAcceptedVersion" TEXT,
    "legalAcceptedIp" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3),
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "grantHours" INTEGER NOT NULL DEFAULT 24,
    "maxUses" INTEGER NOT NULL DEFAULT 1,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccessCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessCodeRedemption" (
    "id" TEXT NOT NULL,
    "accessCodeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "grantedUntil" TIMESTAMP(3) NOT NULL,
    "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccessCodeRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimitBucket" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChamberDrawing" (
    "id" TEXT NOT NULL,
    "caliberInch" DOUBLE PRECISION NOT NULL,
    "cartridgeName" TEXT NOT NULL,
    "saamiUrl" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChamberDrawing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityEvent" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "ip" TEXT,
    "email" TEXT,
    "userId" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecurityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateUniqueIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");
CREATE UNIQUE INDEX "AccessCode_code_key" ON "AccessCode"("code");
CREATE UNIQUE INDEX "AccessCodeRedemption_accessCodeId_userId_key" ON "AccessCodeRedemption"("accessCodeId", "userId");
CREATE UNIQUE INDEX "RateLimitBucket_key_scope_windowStart_key" ON "RateLimitBucket"("key", "scope", "windowStart");

-- CreateIndex
CREATE INDEX "RateLimitBucket_scope_key_windowStart_idx" ON "RateLimitBucket"("scope", "key", "windowStart");
CREATE INDEX "ChamberDrawing_caliberInch_isActive_idx" ON "ChamberDrawing"("caliberInch", "isActive");
CREATE INDEX "SecurityEvent_category_createdAt_idx" ON "SecurityEvent"("category", "createdAt");
CREATE INDEX "SecurityEvent_route_createdAt_idx" ON "SecurityEvent"("route", "createdAt");
CREATE INDEX "SecurityEvent_email_createdAt_idx" ON "SecurityEvent"("email", "createdAt");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AccessCode" ADD CONSTRAINT "AccessCode_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AccessCodeRedemption" ADD CONSTRAINT "AccessCodeRedemption_accessCodeId_fkey" FOREIGN KEY ("accessCodeId") REFERENCES "AccessCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AccessCodeRedemption" ADD CONSTRAINT "AccessCodeRedemption_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SecurityEvent" ADD CONSTRAINT "SecurityEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
