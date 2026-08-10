-- CreateTable
CREATE TABLE "BackofficeGroupsPermissions" (
    "id" UUID NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "permissionId" UUID NOT NULL,
    "groupId" UUID NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "blameId" UUID NOT NULL,

    CONSTRAINT "BackofficeGroupsPermissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BackofficePermission" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "systemName" TEXT NOT NULL,

    CONSTRAINT "BackofficePermission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BackofficePermission_systemName_key" ON "BackofficePermission"("systemName");

-- AddForeignKey
ALTER TABLE "BackofficeGroupsPermissions" ADD CONSTRAINT "BackofficeGroupsPermissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "BackofficePermission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BackofficeGroupsPermissions" ADD CONSTRAINT "BackofficeGroupsPermissions_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "BackofficeGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BackofficeGroupsPermissions" ADD CONSTRAINT "BackofficeGroupsPermissions_blameId_fkey" FOREIGN KEY ("blameId") REFERENCES "BackofficeUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
