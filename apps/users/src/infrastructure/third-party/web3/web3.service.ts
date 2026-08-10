import { Injectable, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThirdwebSDK, SmartContract } from '@thirdweb-dev/sdk';
import { getAllNftLabels, getNftTokenIdByLabel } from '@xyro/contracts/users';

import { Config } from '../../config';

@Injectable()
export class Web3Service implements OnModuleInit {
  private readonly thirdwebSDK: ThirdwebSDK;
  private contract: SmartContract | undefined;

  constructor(private readonly configService: ConfigService<Config>) {
    const { network, secretKey } = this.configService.get('web3');

    this.thirdwebSDK = new ThirdwebSDK(network, {
      secretKey,
    });
  }

  async onModuleInit() {
    const { contractAddress } = this.configService.get('web3');
    this.contract = await this.thirdwebSDK.getContract(contractAddress);
  }

  async checkWalletHasPlatformNFTs(walletAddress: string): Promise<boolean> {
    const contract = this.getContract();

    const walletNFTs = await Promise.all<boolean>(
      getAllNftLabels().map(
        (nft) => contract
          .call("balanceOf", [walletAddress, getNftTokenIdByLabel(nft)])
          .then((result) => Boolean(Number(result)))
      )
    );

    return walletNFTs.some((walletNFT) => walletNFT);
  }

  private getContract(): SmartContract {
    if (!this.contract) throw new InternalServerErrorException('Smart Contract not obtained');
    return this.contract;
  }
}
