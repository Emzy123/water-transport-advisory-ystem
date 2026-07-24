-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PUBLIC', 'VESSEL_OPERATOR', 'PORT_MANAGER', 'REGULATORY_OFFICIAL');

-- CreateEnum
CREATE TYPE "VesselType" AS ENUM ('CARGO_FERRY', 'PASSENGER_FERRY', 'TANKER', 'PATROL', 'TUG', 'OTHER');

-- CreateEnum
CREATE TYPE "WarningSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "WarningStatus" AS ENUM ('ACTIVE', 'CLEARED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "BerthStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MODERATE', 'HIGH');

-- CreateEnum
CREATE TYPE "IncidentSeverity" AS ENUM ('MINOR', 'MODERATE', 'SERIOUS', 'CRITICAL');

-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'RESOLVED');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'PUBLIC',
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vessel" (
    "id" SERIAL NOT NULL,
    "vesselName" TEXT NOT NULL,
    "registrationNumber" TEXT,
    "vesselType" "VesselType" NOT NULL DEFAULT 'OTHER',
    "maxDraught" DOUBLE PRECISION,
    "latitude" DOUBLE PRECISION NOT NULL DEFAULT 7.8003,
    "longitude" DOUBLE PRECISION NOT NULL DEFAULT 6.7332,
    "speed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "heading" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "operatorId" INTEGER,

    CONSTRAINT "Vessel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Port" (
    "id" SERIAL NOT NULL,
    "portName" TEXT NOT NULL,
    "locationName" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "operationalHours" TEXT,
    "berthCount" INTEGER NOT NULL DEFAULT 1,
    "servicesOffered" TEXT,
    "managerId" INTEGER,

    CONSTRAINT "Port_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BerthRecord" (
    "id" SERIAL NOT NULL,
    "berthName" TEXT NOT NULL,
    "status" "BerthStatus" NOT NULL DEFAULT 'AVAILABLE',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "portId" INTEGER NOT NULL,
    "updatedById" INTEGER,

    CONSTRAINT "BerthRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FerrySchedule" (
    "id" SERIAL NOT NULL,
    "destination" TEXT NOT NULL,
    "departure" TEXT NOT NULL,
    "daysOfWeek" TEXT NOT NULL,
    "vesselName" TEXT,
    "fare" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "portId" INTEGER NOT NULL,
    "publishedBy" INTEGER,

    CONSTRAINT "FerrySchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NavWarning" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "WarningSeverity" NOT NULL DEFAULT 'MEDIUM',
    "affectedZone" TEXT,
    "expectedClearance" TIMESTAMP(3),
    "status" "WarningStatus" NOT NULL DEFAULT 'ACTIVE',
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedBy" INTEGER NOT NULL,

    CONSTRAINT "NavWarning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeatherAdvisory" (
    "id" SERIAL NOT NULL,
    "location" TEXT,
    "windSpeed" DOUBLE PRECISION,
    "precipitation" DOUBLE PRECISION,
    "visibility" DOUBLE PRECISION,
    "advisoryType" TEXT NOT NULL DEFAULT 'info',
    "advisoryText" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeatherAdvisory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RouteAdvisory" (
    "id" SERIAL NOT NULL,
    "departure" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "recommendedRoute" TEXT,
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'LOW',
    "estTransitHours" DOUBLE PRECISION,
    "advisoryText" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vesselId" INTEGER,
    "requestedBy" INTEGER NOT NULL,

    CONSTRAINT "RouteAdvisory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmergencyAlert" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" "AlertSeverity" NOT NULL DEFAULT 'WARNING',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "issuedBy" INTEGER NOT NULL,

    CONSTRAINT "EmergencyAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncidentReport" (
    "id" SERIAL NOT NULL,
    "incidentType" TEXT,
    "description" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "severity" "IncidentSeverity" NOT NULL DEFAULT 'MODERATE',
    "status" "IncidentStatus" NOT NULL DEFAULT 'SUBMITTED',
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vesselId" INTEGER,
    "reportedBy" INTEGER NOT NULL,

    CONSTRAINT "IncidentReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "ipAddress" TEXT,
    "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Vessel_registrationNumber_key" ON "Vessel"("registrationNumber");

-- AddForeignKey
ALTER TABLE "Vessel" ADD CONSTRAINT "Vessel_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Port" ADD CONSTRAINT "Port_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BerthRecord" ADD CONSTRAINT "BerthRecord_portId_fkey" FOREIGN KEY ("portId") REFERENCES "Port"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BerthRecord" ADD CONSTRAINT "BerthRecord_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FerrySchedule" ADD CONSTRAINT "FerrySchedule_portId_fkey" FOREIGN KEY ("portId") REFERENCES "Port"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FerrySchedule" ADD CONSTRAINT "FerrySchedule_publishedBy_fkey" FOREIGN KEY ("publishedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NavWarning" ADD CONSTRAINT "NavWarning_publishedBy_fkey" FOREIGN KEY ("publishedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteAdvisory" ADD CONSTRAINT "RouteAdvisory_vesselId_fkey" FOREIGN KEY ("vesselId") REFERENCES "Vessel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteAdvisory" ADD CONSTRAINT "RouteAdvisory_requestedBy_fkey" FOREIGN KEY ("requestedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyAlert" ADD CONSTRAINT "EmergencyAlert_issuedBy_fkey" FOREIGN KEY ("issuedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentReport" ADD CONSTRAINT "IncidentReport_vesselId_fkey" FOREIGN KEY ("vesselId") REFERENCES "Vessel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentReport" ADD CONSTRAINT "IncidentReport_reportedBy_fkey" FOREIGN KEY ("reportedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
