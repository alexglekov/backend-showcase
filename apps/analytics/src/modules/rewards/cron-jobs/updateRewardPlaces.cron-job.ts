import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LoggerService } from '@xyro/libs/logger';

import { PrismaService } from '../../../infrastructure/prisma';

@Injectable()
export class UpdateRewardsPlacesCronJobs {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async onModuleInit() {
    await this.updateRewardsPlaces();
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async updateRewardsPlaces() {
    try {
      const startTime = Date.now();
      await this.prismaService.$transaction(async (transaction) => {
        await transaction.$queryRaw`
          UPDATE "Reward"
          SET "lastPlace" = "currentPlace";
        `;
        await transaction.$queryRaw`
          WITH ranked_balances AS (
            SELECT "Balance".id AS "balanceId", ROW_NUMBER() OVER (ORDER BY amount DESC) AS place
            FROM "Balance"
            WHERE
              "Balance"."id" IN (
                  SELECT "Reward"."balanceId" FROM "Reward"
              )
          )
          UPDATE "Reward" r
          SET "currentPlace" = rb.place
          FROM ranked_balances rb
          WHERE r."balanceId" = rb."balanceId";
        `;
      });
      const endTime = Date.now();
    
      this.logger.log({
        action: 'Rewards places has successfully updated',
        payload: {
          takeMls: endTime - startTime,
        }
      });
    } catch (error) {
      this.logger.error({
        action: `Error occured on updating rewards places`,
        payload: {
          errorMessage: error.message,
          errorStack: error.stack,
        },
      });
      // TODO: add notification
    }
  }
}