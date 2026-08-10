import { NftConfig } from './nft-config.type';

export const loadNftConfig = (): NftConfig => {
  return {
    nft: {
      contract: process.env.NFT_CONTRACT_ADDRESS!,
      network: process.env.NETWORK!,
      rpc: process.env.RPC_URL!,
    },
  };
};
