-- CreateTable
CREATE TABLE "BlockedUserFeatures" (
    "userId" UUID NOT NULL,
    "allowSendMessage" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "BlockedUserFeatures_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "BlockedUserFeatures" ADD CONSTRAINT "BlockedUserFeatures_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
