import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PickConstructor, PrismaTransaction } from '@xyro/libs/utils'
import { createSoftDeleteMiddleware } from 'prisma-soft-delete-middleware'

export type DBTransaction = PrismaTransaction;

@Injectable()
export class PrismaService extends PickConstructor(PrismaClient)(
  'backofficeUser',
  'paymentOrder',
  'paymentTransaction',
  '$transaction',
  '$use',
  'backofficeGroup',
  'usersOnGroups',
  'backofficePermission',
  'backofficeGroupsPermissions'
) implements OnModuleInit {
  constructor() {
    super();
  }

  onModuleInit() {
    this.$use(createSoftDeleteMiddleware({
      models: {
        BackofficeUser: {
          field: "deleted",
          createValue: Boolean,
        },
        BackofficeGroup: {
          field: "archived",
          createValue: Boolean,
        },
        BackofficeGroupsPermissions: {
          field: "deleted",
          createValue: Boolean,
        },
        UsersOnGroups: {
          field: "deleted",
          createValue: Boolean,
        },
      }
    }))
  }
}