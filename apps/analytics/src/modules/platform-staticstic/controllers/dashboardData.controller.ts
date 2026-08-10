import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { DashboardDataResult } from '@xyro/contracts/analytics';

import { DashboardDataService } from '../services/dashboardData.service';

@Controller()
export class DashboardDataController {
  constructor(private readonly dashboardDataService: DashboardDataService) {}

  @GrpcMethod('AnalyticsService', 'getGraphdata')
  async getGraphdata(): Promise<DashboardDataResult> {
    try {
      const data = await this.dashboardDataService.getDashboardData();

      if (!data) {
        throw new RpcException('Not found');
      }

      return { data };
    } catch (e) {
      throw new RpcException(e);
    }
  }
}
