-- CreateTable
CREATE TABLE "UserDailyLogin" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "date" DATE NOT NULL,

    CONSTRAINT "UserDailyLogin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserDailyLogin_id_key" ON "UserDailyLogin"("id");

-- CreateIndex
CREATE INDEX "UserDailyLogin_userId_idx" ON "UserDailyLogin"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserDailyLogin_userId_date_key" ON "UserDailyLogin"("userId", "date");

-- AddForeignKey
ALTER TABLE "UserDailyLogin" ADD CONSTRAINT "UserDailyLogin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
