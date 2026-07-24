-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_loggedAt_idx" ON "AuditLog"("loggedAt");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "BerthRecord_portId_idx" ON "BerthRecord"("portId");

-- CreateIndex
CREATE INDEX "BerthRecord_status_idx" ON "BerthRecord"("status");

-- CreateIndex
CREATE INDEX "EmergencyAlert_isActive_idx" ON "EmergencyAlert"("isActive");

-- CreateIndex
CREATE INDEX "EmergencyAlert_issuedAt_idx" ON "EmergencyAlert"("issuedAt");

-- CreateIndex
CREATE INDEX "IncidentReport_reportedBy_idx" ON "IncidentReport"("reportedBy");

-- CreateIndex
CREATE INDEX "IncidentReport_status_idx" ON "IncidentReport"("status");

-- CreateIndex
CREATE INDEX "IncidentReport_reportedAt_idx" ON "IncidentReport"("reportedAt");

-- CreateIndex
CREATE INDEX "NavWarning_status_idx" ON "NavWarning"("status");

-- CreateIndex
CREATE INDEX "NavWarning_publishedAt_idx" ON "NavWarning"("publishedAt");

-- CreateIndex
CREATE INDEX "RouteAdvisory_requestedBy_idx" ON "RouteAdvisory"("requestedBy");

-- CreateIndex
CREATE INDEX "RouteAdvisory_generatedAt_idx" ON "RouteAdvisory"("generatedAt");

-- CreateIndex
CREATE INDEX "Vessel_operatorId_idx" ON "Vessel"("operatorId");

-- CreateIndex
CREATE INDEX "Vessel_lastUpdated_idx" ON "Vessel"("lastUpdated");

-- CreateIndex
CREATE INDEX "WeatherAdvisory_generatedAt_idx" ON "WeatherAdvisory"("generatedAt");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
