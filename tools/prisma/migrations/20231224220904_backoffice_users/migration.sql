-- AlterTable
ALTER TABLE "BackofficeUser" ADD COLUMN     "blameId" UUID;

-- CreateTable
CREATE TABLE "UsersOnGroups" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "groupId" UUID NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "blameId" UUID NOT NULL,

    CONSTRAINT "UsersOnGroups_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BackofficeUser" ADD CONSTRAINT "BackofficeUser_blameId_fkey" FOREIGN KEY ("blameId") REFERENCES "BackofficeUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersOnGroups" ADD CONSTRAINT "UsersOnGroups_userId_fkey" FOREIGN KEY ("userId") REFERENCES "BackofficeUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersOnGroups" ADD CONSTRAINT "UsersOnGroups_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "BackofficeGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersOnGroups" ADD CONSTRAINT "UsersOnGroups_blameId_fkey" FOREIGN KEY ("blameId") REFERENCES "BackofficeUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
