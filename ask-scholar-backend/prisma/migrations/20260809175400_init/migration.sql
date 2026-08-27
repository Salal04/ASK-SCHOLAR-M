-- CreateEnum
CREATE TYPE "Fiqah" AS ENUM ('HANAFI', 'SHAFI', 'MALIKI', 'HANBALI', 'JAFARI', 'OTHER');

-- CreateEnum
CREATE TYPE "ScholarStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED');

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scholars" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "fiqah" "Fiqah",
    "picture" TEXT,
    "bio" TEXT,
    "specialization" TEXT,
    "qualifications" TEXT,
    "yearsOfExperience" INTEGER,
    "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "location" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "status" "ScholarStatus" NOT NULL DEFAULT 'PENDING',
    "inviteToken" TEXT,
    "inviteTokenExpiry" TIMESTAMP(3),
    "createdByAdminId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scholars_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "scholars_email_key" ON "scholars"("email");

-- CreateIndex
CREATE UNIQUE INDEX "scholars_inviteToken_key" ON "scholars"("inviteToken");

-- CreateIndex
CREATE INDEX "scholars_fiqah_idx" ON "scholars"("fiqah");

-- CreateIndex
CREATE INDEX "scholars_status_idx" ON "scholars"("status");
