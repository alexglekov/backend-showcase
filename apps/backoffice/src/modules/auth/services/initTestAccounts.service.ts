import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { passwordToHash } from '@xyro/libs/utils';

import { Config } from '../../../infrastructure/config';
import { BackofficeUsersService } from '../../iam/users';

@Injectable()
export class InitTestAccountsService implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService<Config>,
    private readonly usersService: BackofficeUsersService,
  ) {}

  async onModuleInit() {
    const { testAccounts } = this.configService.get('app');

    for (const accountType of Object.keys(testAccounts) as Array<keyof typeof testAccounts>) {
      for(const admin of testAccounts[accountType]) {
        const foundAdmin = await this.usersService.findByEmail(admin.email);
        
        if (foundAdmin) continue;

        await this.usersService.createUser({
          email: admin.email,
          name: admin.name,
          passwordHash: passwordToHash(admin.password),
          surname: admin.surname,
        });
      }
    }
  }
}