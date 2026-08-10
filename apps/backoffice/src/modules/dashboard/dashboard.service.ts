import { Inject, Injectable } from '@nestjs/common';
import { AppsNames } from '@xyro/core';
import { AnalyticsService } from '@xyro/contracts/analytics';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class DashboardService {
  constructor(
    @Inject(AppsNames.Analytics)
    private readonly analyticsService: AnalyticsService
  ) {}

  public async getDashboardData() {
    const data = await lastValueFrom(
      this.analyticsService.getDashboardData({})
    );

    return data;
  }
}
