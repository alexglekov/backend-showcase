import {
  Injectable,
} from '@nestjs/common';
import { Contract, Event, providers } from 'ethers';
import { Interval } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@xyro/libs/logger';
import {
  NftTokenIds,
  getNftLabelByTokenId,
} from '@xyro/contracts/users';
import { BaseEvent, DomainEventsPublisher } from '@xyro/libs/events';
import { Prisma } from '@prisma/client';
import { WalletAddressGaveNftDomainEvent, WalletAddressReceivedNftDomainEvent } from '@xyro/contracts/analytics';

import { DBTransaction, PrismaService } from '../../../infrastructure/prisma';
import { Config } from '../../../infrastructure/config';
import { abiData } from './DropERC1155_V2';

export type NftTransferEvent = {
  from: string;
  to: string;
  tokenId: NftTokenIds;
  amount: number;
};

const CHECK_TIMEOUT = 5 * 1000; // 5 s
const LOGS_LIMIT_BLOCKS = 10_000;

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const TRANSFER_EVENT_ID =
  'TransferSingle(address,address,address,uint256,uint256)';

@Injectable()
export class NftSyncService {
  private provider: providers.JsonRpcProvider;
  private isLastCalculationCompleted: boolean = true;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly logger: LoggerService,
    private readonly configService: ConfigService<Config>,
    private readonly domainEventsPublisher: DomainEventsPublisher,
  ) {
    const { rpc } = this.configService.get('nft');

    this.provider = new providers.JsonRpcProvider(rpc);

    this.logger.setContext(NftSyncService.name);
  }

  @Interval(CHECK_TIMEOUT)
  async syncBlockchainState() {
    if (!this.isLastCalculationCompleted) return;
    this.isLastCalculationCompleted = false;

    const { network } = this.configService.get('nft');

    try {
      const {
        currentBlock,
        lastScanBlock,
      } = await this.getCurrentBlockchainState(network);

      if (currentBlock < lastScanBlock) return;

      const events = await this.getEventsFromBlocks(lastScanBlock, currentBlock);

      const domainEvents = await this.prismaService.$transaction(
        async (transaction) => {
          await transaction.blockchain.update({
            where: {
              network: network,
            },
            data: {
              lastScanBlock: currentBlock,
            },
          });

          if (events.length === 0 ) return [];

          return this.checkAndSaveNewEvents(events, transaction);
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        }
      );

      await Promise.allSettled(domainEvents.map((domainEvent) => this.domainEventsPublisher.publish(domainEvent)));
    } catch (error) {
      this.logger.error({
        action: 'Error occured on NftSyncService.updateData',
        payload: {
          errorMessage: error.message,
          errorStack: error.stack,
        },
      });
    } finally {
      this.isLastCalculationCompleted = true;
    }
  }

  private async getCurrentBlockchainState(network: string) {
    const blockchain = await this.prismaService.blockchain.findFirstOrThrow({
      where: {
        network,
      },
    });

    const lastScanBlock = Number(blockchain.lastScanBlock) + 1;
    const lastBlock = await this.provider.getBlockNumber();

    const toBlock = lastScanBlock + LOGS_LIMIT_BLOCKS < lastBlock
      ? lastScanBlock + LOGS_LIMIT_BLOCKS
      : lastBlock;

    return {
      currentBlock: toBlock,
      lastScanBlock,
    }
  }

  private async getEventsFromBlocks(blockFrom: number, blockTo: number) {
    const { contract: contractAddress } = this.configService.get('nft');

    const contract = new Contract(contractAddress, abiData.abi, this.provider);
    const filter = contract.filters[TRANSFER_EVENT_ID]();

    const rawEvents = await contract.queryFilter(filter, blockFrom, blockTo);
    const events = this.parseLogs(rawEvents);

    return events;
  }

  private async checkAndSaveNewEvents(
    events: NftTransferEvent[],
    transaction: DBTransaction,
  ) {
    const domainEvents: BaseEvent<any>[] = [];

    for (const event of events) {
      const [
        addNftToAddressDomainEvents,
        removeNftFromAddressDomainEvents,
      ] = await Promise.all([
        this.addNftToAddress(event, transaction),
        this.removeNftFromAddress(event, transaction),
      ]);

      domainEvents.push(...addNftToAddressDomainEvents);
      domainEvents.push(...removeNftFromAddressDomainEvents);
    }

    return domainEvents;
  }

  private async addNftToAddress(event: NftTransferEvent, transaction: DBTransaction) {
    const NftLabel = getNftLabelByTokenId(event.tokenId);

    const nftHolder = await transaction.nftHolder.upsert({
      where: {
        address: event.to,
      },
      create: {
        address: event.to,
        common: 0,
        rare: 0,
        epic: 0,
        legendary: 0,
        [NftLabel]: event.amount || 1,
      },
      update: {
        [NftLabel]: {
          increment: event.amount || 1,
        },
      },
    });

    this.logger.log({
      action: 'Add nft to holder',
      payload: {
        tokenId: event.tokenId,
        address: nftHolder.address,
      },
    });

    return [
      new WalletAddressReceivedNftDomainEvent({
        tokenId: event.tokenId,
        walletAddress: nftHolder.address,
        amount: event.amount || 1,
      }),
    ];
  }

  private async removeNftFromAddress(event: NftTransferEvent, transaction: DBTransaction) {
    if (event.from === ZERO_ADDRESS) return [];

    const NftLabel = getNftLabelByTokenId(event.tokenId);

    const nftHolder = await transaction.nftHolder.upsert({
      where: {
        address: event.from,
      },
      create: {
        address: event.from,
        common: 0,
        rare: 0,
        epic: 0,
        legendary: 0,
        [NftLabel]: -(event.amount || 1),
      },
      update: {
        [NftLabel]: {
          decrement: event.amount || 1,
        },
      },
    });

    this.logger.log({
      action: 'Remove nft from holder',
      payload: {
        tokenId: event.tokenId,
        address: nftHolder.address,
      },
    });

    return [
      new WalletAddressGaveNftDomainEvent({
        tokenId: event.tokenId,
        walletAddress: nftHolder.address,
        amount: event.amount || 1,
      }),
    ];
  }

  private parseLogs(events: Event[]): NftTransferEvent[] {
    return events
      .map((event) => this.parseLog(event))
      .filter(Boolean) as NftTransferEvent[];
  }

  private parseLog(event: Event): NftTransferEvent | null {
    if (!event.args) return null;

    return {
      from: String(event.args[1]),
      to: String(event.args[2]),
      tokenId: Number(event.args[3]) as NftTokenIds,
      amount: Number(event.args[4]),
    };
  }
}
