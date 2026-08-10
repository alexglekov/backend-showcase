-- DropForeignKey
ALTER TABLE "BackofficeGroupsPermissions" DROP CONSTRAINT "BackofficeGroupsPermissions_blameId_fkey";

-- DropForeignKey
ALTER TABLE "UsersOnGroups" DROP CONSTRAINT "UsersOnGroups_blameId_fkey";

-- AlterTable
ALTER TABLE "BackofficeGroupsPermissions" ALTER COLUMN "blameId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "UsersOnGroups" ALTER COLUMN "blameId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "UsersOnGroups" ADD CONSTRAINT "UsersOnGroups_blameId_fkey" FOREIGN KEY ("blameId") REFERENCES "BackofficeUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BackofficeGroupsPermissions" ADD CONSTRAINT "BackofficeGroupsPermissions_blameId_fkey" FOREIGN KEY ("blameId") REFERENCES "BackofficeUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
