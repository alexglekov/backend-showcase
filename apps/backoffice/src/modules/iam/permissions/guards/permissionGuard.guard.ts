import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { HttpHeaders } from '@xyro/core';

import { PermissionsService } from '../services/permissions.service';
import { PERMISSIONS_TOKEN } from '../decorators/permissions.decorator';
import { PermissionsEnum } from '../core/permissions.enum';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly permissionService: PermissionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { req } = context.getArgByIndex(2);

    const handler = context.getHandler();
    const classHandler = context.getClass();

    const permissions = Reflect.getMetadata(PERMISSIONS_TOKEN, classHandler.prototype, handler.name) as PermissionsEnum[];

    if (!permissions) return true;

    const userId = req.headers[HttpHeaders.userId] as string | undefined;
    
    if (!userId) return false;

    return this.permissionService.checkPermission({
      userId,
      permissions,
    });
  }
}