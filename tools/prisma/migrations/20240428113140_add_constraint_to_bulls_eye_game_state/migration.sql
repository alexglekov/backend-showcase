-- CreateIndex
CREATE UNIQUE INDEX "GameBullseye_state_key"
ON "GameBullseye"("state")
WHERE ("GameBullseye"."state" IN ('OPEN', 'INPROGRESS'));
