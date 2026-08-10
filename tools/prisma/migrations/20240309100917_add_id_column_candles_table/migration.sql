-- AlterTable
ALTER TABLE "Candle" DROP CONSTRAINT "Candle_pkey",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "Candle_pkey" PRIMARY KEY ("id");
