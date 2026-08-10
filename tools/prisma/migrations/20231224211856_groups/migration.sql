-- CreateTable
CREATE TABLE "BackofficeGroup" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "blameId" UUID,

    CONSTRAINT "BackofficeGroup_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BackofficeGroup" ADD CONSTRAINT "BackofficeGroup_blameId_fkey" FOREIGN KEY ("blameId") REFERENCES "BackofficeUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
