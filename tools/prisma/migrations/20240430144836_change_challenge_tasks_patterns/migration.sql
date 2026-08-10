BEGIN;
CREATE TYPE "ChallengeTaskPattern_new" AS ENUM ('ENRICH_PROFILE', 'CONNECT_WITH_X', 'CONNECT_WALLET_CHALLENGE', 'SHARE_CHALLENGE', 'DISCORD_CHALLENGE', 'COMMUNITY_CHALLENGE', 'INVITE_USERS', 'PLAY_ANY_GAME', 'PLAY_SETUP_GAMES', 'CREATE_CHAT_MESSAGES', 'WON_GAMES', 'WHALE_SQUAD', 'SOCIAL_TRIBE_CHALLENGE', 'SHAROOOORS_CHALLENGE');
ALTER TABLE "ChallengeTask" ALTER COLUMN "pattern" TYPE "ChallengeTaskPattern_new" USING ("pattern"::text::"ChallengeTaskPattern_new");
ALTER TYPE "ChallengeTaskPattern" RENAME TO "ChallengeTaskPattern_old";
ALTER TYPE "ChallengeTaskPattern_new" RENAME TO "ChallengeTaskPattern";
DROP TYPE "ChallengeTaskPattern_old";
COMMIT;
