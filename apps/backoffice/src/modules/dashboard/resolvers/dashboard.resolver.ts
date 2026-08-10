import { Resolver, Query } from '@nestjs/graphql';
import { IUserCredentials, UserCredentials } from '@xyro/libs/graphql';

import { DashboardService } from '../dashboard.service';
import { DashboardDataType } from './models/dashboardData.models';

import { PermissionsEnum, UsePermissions } from '../../iam/permissions';

@Resolver()
export class DashboardResolver {
  constructor(private readonly dashboardService: DashboardService) {}

  @Query(() => [DashboardDataType])
  @UsePermissions([PermissionsEnum.dashboard])
  async getDashboardData(
    @UserCredentials() _credentials: IUserCredentials
  ): Promise<DashboardDataType[]> {
    const result = await this.dashboardService.getDashboardData();

    return result.data;
  }
}
