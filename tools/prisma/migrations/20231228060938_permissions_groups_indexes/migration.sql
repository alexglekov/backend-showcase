/*
  Warnings:

  - A unique constraint covering the columns `[groupId,permissionId]` on the table `BackofficeGroupsPermissions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[groupId,userId]` on the table `UsersOnGroups` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BackofficeGroupsPermissions_groupId_permissionId_key" ON "BackofficeGroupsPermissions"("groupId", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "UsersOnGroups_groupId_userId_key" ON "UsersOnGroups"("groupId", "userId");
