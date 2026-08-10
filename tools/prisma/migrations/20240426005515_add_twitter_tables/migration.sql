-- AlterTable
ALTER TABLE "User" DROP COLUMN "twitterAccessToken",
DROP COLUMN "twitterRefreshToken";

-- CreateTable
CREATE TABLE "TwitterAuthToken" (
    "twitterId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,

    CONSTRAINT "TwitterAuthToken_pkey" PRIMARY KEY ("twitterId")
);

-- CreateTable
CREATE TABLE "TwitterOffset" (
    "id" UUID NOT NULL,
    "tweetId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "nextToken" TEXT,
    "startToken" TEXT,
    "endToken" TEXT,

    CONSTRAINT "TwitterOffset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tweet" (
    "tweetId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tweet_pkey" PRIMARY KEY ("tweetId")
);

-- CreateTable
CREATE TABLE "TweetLike" (
    "id" UUID NOT NULL,
    "twitterId" TEXT NOT NULL,
    "tweetId" TEXT NOT NULL,

    CONSTRAINT "TweetLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Retweet" (
    "id" UUID NOT NULL,
    "twitterId" TEXT NOT NULL,
    "tweetId" TEXT NOT NULL,
    "withQuote" BOOLEAN NOT NULL DEFAULT false,
    "quoteText" TEXT,

    CONSTRAINT "Retweet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TwitterAuthToken_twitterId_key" ON "TwitterAuthToken"("twitterId");

-- CreateIndex
CREATE UNIQUE INDEX "TwitterOffset_tweetId_type_key" ON "TwitterOffset"("tweetId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Tweet_tweetId_key" ON "Tweet"("tweetId");

-- CreateIndex
CREATE UNIQUE INDEX "TweetLike_twitterId_tweetId_key" ON "TweetLike"("twitterId", "tweetId");

-- CreateIndex
CREATE UNIQUE INDEX "Retweet_twitterId_tweetId_withQuote_key" ON "Retweet"("twitterId", "tweetId", "withQuote");
