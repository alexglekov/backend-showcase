-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'developer');

-- CreateTable
CREATE TABLE "BackofficeUser" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,

    CONSTRAINT "BackofficeUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BackofficeUser_email_key" ON "BackofficeUser"("email");
