import { BadRequestException, Injectable } from '@nestjs/common';
import {
  UpDownGameEntity,
  getCurrentUpDownGameIdCacheKey,
  getUpDownBetsMatchPattern,
  getUpDownGameCacheKey
} from '@xyro/contracts/up-down';
import {
  BetUpDown,
  GameStateEnum,
  GameUpDown,
  Prisma,
} from '@prisma/client';
import { LoggerService } from '@xyro/libs/logger';
import { RedisService } from '@xyro/libs/redis';

import { PrismaService } from '../../infrastructure/prisma';

type GetUpDownGamesPaginatedParams = {
  skip?: number;
  take?: number;
};

const COUNT_LAST_CLOSED_GAMES_HISTORY = 8;

@Injectable()
export class UpDownGameService {
  private readonly lastClosedGames: GameUpDown[] = [];

  constructor(
    protected readonly logger: LoggerService,
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
  ) {
    this.logger.setContext(UpDownGameService.name);
  }

  async onModuleInit() {
    const games = await this.prismaService.gameUpDown.findMany({
      where: {
        state: GameStateEnum.CLOSE,
      },
      orderBy: {
        endAt: 'desc',
      },
      include: {
        bets: true,
      },
      skip: 0,
      take: COUNT_LAST_CLOSED_GAMES_HISTORY,
    });
    games.forEach((game) => this.addGameToLastGames(game));
  }

  public async onGameChanged(game: UpDownGameEntity) {
    if (game.state !== GameStateEnum.CLOSE) return;
    try {
      const cachedGame = await this.getGameWithBetsFromCache(game.id);
      this.addGameToLastGames(cachedGame);
    } catch (error) {
      this.addGameToLastGames(game as unknown as GameUpDown);
    }
  }

  public async getCurrentGameFromCache() {
    const currentGameId = await this.redisService.get<string>(getCurrentUpDownGameIdCacheKey(), false);

    if (!currentGameId) {
      throw new BadRequestException('Up/Down game not started yet.');
    }

    return this.getGameFromCache(currentGameId);
  }

  public async getCurrentGameWithBetsFromCache() {
    const currentGameId = await this.redisService.get<string>(getCurrentUpDownGameIdCacheKey(), false);
    
    if (!currentGameId) {
      throw new BadRequestException('Up/Down game not started yet.');
    }

    return this.getGameWithBetsFromCache(currentGameId)
  }

  public async getGameWithBetsFromCache(id: string) {
    const cachedGame = await this.redisService.get<GameUpDown>(getUpDownGameCacheKey(id));

    if (!cachedGame) {
      throw new BadRequestException('Up/Down game not found.');
    }

    const bets = await this.getBetsFromCache(cachedGame.id);

    return {
      ...cachedGame,
      bets,
    }
  }

  public async getGameFromCache(id: string) {
    const cachedGame = await this.redisService.get<GameUpDown>(getUpDownGameCacheKey(id));

    if (!cachedGame) {
      throw new BadRequestException('Up/Down game not found.');
    }

    return cachedGame;
  }

  private async getBetsFromCache(gameId: string) {
    const betsStream = this.redisService.scanStream<BetUpDown>(getUpDownBetsMatchPattern(gameId));

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

    const bets = await this.redisService.getBatch<BetUpDown>(betsKeys);

    return bets.filter((bet) => Boolean(bet)) as BetUpDown[];
  }

  public async getLastClosedGames() {
    return this.lastClosedGames;
  }

  private addGameToLastGames(game: GameUpDown) {
    this.lastClosedGames.push(game);
    if (this.lastClosedGames.length > COUNT_LAST_CLOSED_GAMES_HISTORY) {
      this.lastClosedGames.shift();
    }
  }

  public async getUpDownGamesPaginated(
    params: GetUpDownGamesPaginatedParams,
  ): Promise<GameUpDown[]> {
    const where: Prisma.GameUpDownWhereInput = {};

    const games = await this.prismaService.gameUpDown.findMany({
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
