import { Web3Config } from './web3-config.type';

export const loadWeb3Config = (): Web3Config => {
  return {
    web3: {
      contractAddress: process.env.WEB3_CONTRACT_ADDRESS!,
      secretKey: process.env.WEB3_SECRET_KEY!,
      network: process.env.WEB3_NETWORK!,
    },
  };
};
