import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardResolver } from './resolvers/dashboard.resolver';

@Module({
  providers: [DashboardService, DashboardResolver],
})
export class DashboardModule {}
