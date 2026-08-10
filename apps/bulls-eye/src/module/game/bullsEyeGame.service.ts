import { BadRequestException, Injectable } from '@nestjs/common';
import {
  BetBullseye,
  GameBullseye,
  Prisma,
} from '@prisma/client';
import { LoggerService } from '@xyro/libs/logger';
import { RedisService } from '@xyro/libs/redis';
import {
  getBullsEyeBetsMatchPattern,
  getBullsEyeGameCacheKey,
  getCurrentBullsEyeGameIdCacheKey
} from '@xyro/contracts/bulls-eye';

import { PrismaService } from '../../infrastructure/prisma';

type GetBullsEyeGamesPaginatedParams = {
  skip?: number;
  take?: number;
};

@Injectable()
export class BullsEyeGameService {
  constructor(
    protected readonly logger: LoggerService,
    protected readonly redisService: RedisService,
    private readonly prismaService: PrismaService,
  ) {
    this.logger.setContext(BullsEyeGameService.name);
  }

  public async getCurrentGameFromCache() {
    const currentGameId = await this.redisService.get<string>(getCurrentBullsEyeGameIdCacheKey(), false);

    if (!currentGameId) {
      throw new BadRequestException('Bulls-Eye game not started yet.');
    }

    return this.getGameFromCache(currentGameId);
  }

  public async getCurrentGameWithBetsFromCache() {
    const currentGameId = await this.redisService.get<string>(getCurrentBullsEyeGameIdCacheKey(), false);
    
    if (!currentGameId) {
      throw new BadRequestException('Bulls-Eye game not started yet.');
    }

    return this.getGameWithBetsFromCache(currentGameId)
  }

  public async getGameWithBetsFromCache(id: string) {
    const cachedGame = await this.redisService.get<GameBullseye>(getBullsEyeGameCacheKey(id));

    if (!cachedGame) {
      throw new BadRequestException('Bulls-Eye game not found.');
    }

    const bets = await this.getBetsFromCache(cachedGame.id);

    return {
      ...cachedGame,
      bets,
    }
  }

  public async getGameFromCache(id: string) {
    const cachedGame = await this.redisService.get<GameBullseye>(getBullsEyeGameCacheKey(id));

    if (!cachedGame) {
      throw new BadRequestException('Bulls-Eye game not found.');
    }

    return cachedGame;
  }

  private async getBetsFromCache(gameId: string) {
    const betsStream = this.redisService.scanStream<BetBullseye>(getBullsEyeBetsMatchPattern(gameId));

    // TODO: Rewrite this code to Observable
    const betsKeys = await new Promise<string[]>((resolve, reject) => {
      let foundBetsKeys: string[] = [];
      
      betsStream.on("data", (chunk: string[] = []) => {
        foundBetsKeys.push(...chunk);
      });
      betsStream.on("end", () => resolve(foundBetsKeys));
      betsStream.on("error", error => reject(error));
    });

    if (betsKeys.length === 0) return [];

    const bets = await this.redisService.getBatch<BetBullseye>(betsKeys);

    return bets.filter((bet) => Boolean(bet)) as BetBullseye[];
  }

  public async getBullsEyeGamesPaginated(
    params: GetBullsEyeGamesPaginatedParams,
  ): Promise<GameBullseye[]> {
    const where: Prisma.GameBullseyeWhereInput = {};

    const games = await this.prismaService.gameBullseye.findMany({
      where,
      skip: params.skip,
      take: params.take,
      orderBy: {
        endAt: 'desc',
      },
      include: {
        bets: true,
      },
    });

    return games;
  }
}
