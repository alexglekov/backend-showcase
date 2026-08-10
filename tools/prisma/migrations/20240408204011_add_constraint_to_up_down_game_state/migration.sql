-- CreateIndex
CREATE  UNIQUE INDEX "GameUpDown_state_key"
ON "GameUpDown"("state")
WHERE ("GameUpDown"."state" IN ('OPEN', 'INPROGRESS'))