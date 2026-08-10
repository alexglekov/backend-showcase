-- AlterTable
ALTER TABLE "Asset" ADD COLUMN "precision" INTEGER NOT NULL DEFAULT 4;

-- Add Assets
INSERT INTO "Asset" VALUES ('BTC', 'Bitcoin', true, 2);
INSERT INTO "Asset" VALUES ('ETH', 'Ethereum', true, 3);
INSERT INTO "Asset" VALUES ('BNB', 'BNB', true, 3);
INSERT INTO "Asset" VALUES ('XRP', 'XRP', true, 5);
INSERT INTO "Asset" VALUES ('ADA', 'Cardano', true, 5);
INSERT INTO "Asset" VALUES ('DOGE', 'Dogecoin', true, 5);
INSERT INTO "Asset" VALUES ('SOL', 'Solana', true, 3);
INSERT INTO "Asset" VALUES ('TRX', 'Tron', true, 5);
INSERT INTO "Asset" VALUES ('DOT', 'Polkadot', true, 4);
INSERT INTO "Asset" VALUES ('MATIC', 'Polygon', true, 4);
INSERT INTO "Asset" VALUES ('LTC', 'Litecoin', true, 3);
INSERT INTO "Asset" VALUES ('NEAR', 'NEAR', true, 4);
INSERT INTO "Asset" VALUES ('AVAX', 'Avalanche', true, 4);
INSERT INTO "Asset" VALUES ('XLM', 'Stellar', true, 5);
INSERT INTO "Asset" VALUES ('LINK', 'Chainlink', true, 4);
INSERT INTO "Asset" VALUES ('UNI', 'Uniswap', true, 5);
INSERT INTO "Asset" VALUES ('FTM', 'Fantom', true, 4);
INSERT INTO "Asset" VALUES ('FIL', 'Filecoin', true, 6);
INSERT INTO "Asset" VALUES ('ATOM', 'Cosmos', true, 4);
INSERT INTO "Asset" VALUES ('APT', 'Aptos', true, 4);